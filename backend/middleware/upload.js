const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Config = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
    }
});

const getDestinationPath = (req, file) => {
    // Determine path based on if it's an incident or profile upload
    if (file.fieldname === 'profileImage') {
        return `profile_image/${Date.now().toString()}-${file.originalname}`;
    }

    // Bribery proof uploads
    if (file.fieldname === 'proof') {
        return `bribery/proof/${Date.now().toString()}-${file.originalname}`;
    }

    // Bribery voice recording for transcription
    if (file.fieldname === 'audio') {
        return `bribery/audio/${Date.now().toString()}-${file.originalname}`;
    }
    
    // Default to incident path
    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo ? 'video' : 'image';
    return `incident/${folder}/${Date.now().toString()}-${file.originalname}`;
};

const upload = multer({
    storage: multerS3({
        s3: s3Config,
        bucket: process.env.AWS_S3_BUCKET_NAME || 'aiforbharat',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, getDestinationPath(req, file));
        }
    }),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
    }
});

module.exports = upload;
