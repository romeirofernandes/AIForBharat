const { GoogleGenerativeAI } = require("@google/generative-ai");
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

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
        
        let prompt = `Act as a civil infrastructure expert. Generate a professional, detailed, and urgent incident report description for the ${department || 'municipal'} department regarding a ${incidentType || 'issue'}.`;
                
                if (currentDescription && currentDescription.trim().length > 0) {
                    prompt += ` Incorporate the following user context: "${currentDescription}".`;
                } else {
                    prompt += ` The user has not provided a text description, so rely primarily on the image analysis.`;
                }

                prompt += `
                Guidelines:
                - Be objective, factual, and concise.
                - Highlight potential safety hazards and urgency.
                - Estimate the severity if possible.
                - Use professional language suitable for official records.
                - Do not include greetings or sign-offs.
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
