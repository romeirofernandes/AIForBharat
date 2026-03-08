const { GoogleGenerativeAI } = require("@google/generative-ai");
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const prisma = require("../config/prisma"); 

const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_URL || "dummy_key";
const genAI = new GoogleGenerativeAI(geminiKey);

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
    }
});

exports.generateDescription = async (req, res) => {
    try {
        const { currentDescription, department, incidentType } = req.body;

        // Fetch user profile for age/gender context
        const profile = await prisma.citizenProfile.findUnique({
            where: { userId: req.user.userId },
            select: { age: true, gender: true },
        });
        const age = profile?.age || null;
        const gender = profile?.gender || null;
        const persona = [age && `${age} year old`, gender].filter(Boolean).join(' ') || 'citizen';
        
        let prompt = `Write a very brief 1-2 sentence description of this civic issue as reported by a ${persona} from India. English only. The issue is about "${incidentType || 'an issue'}" for the ${department || 'municipal'} department.`;
                
                if (currentDescription && currentDescription.trim().length > 0) {
                    prompt += ` The reporter says: "${currentDescription}".`;
                } else {
                    prompt += ` The user has not provided text — describe solely based on the image.`;
                }

                prompt += `
Rules:
- Maximum 2 sentences, keep it very short and clear.
- Write in first person as if the citizen is reporting it.
- Be factual, mention what is visible.
- Do NOT include greetings, sign-offs, or filler.
- Output ONLY the description text.
`;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        let result;

        if (req.file) {
            // Fetch image securely from S3 using key
            const getObjectParams = {
                Bucket: process.env.AWS_S3_BUCKET_NAME || 'aiforbharat',
                Key: req.file.key,
            };
            const command = new GetObjectCommand(getObjectParams);
            const response = await s3Client.send(command);
            
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            const imagePart = {
                inlineData: {
                    data: buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            };
            result = await model.generateContent([prompt, imagePart]);
        } else {
            result = await model.generateContent([prompt]);
        }

        const generatedText = result.response.text();
        res.json({ description: generatedText });
    } catch (error) {
        console.error("Gemini generation error:", error);
        res.status(500).json({ error: "Failed to generate AI description" });
    }
};
