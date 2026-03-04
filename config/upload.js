const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'restaurant/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
    }),
});

const voiceStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'restaurant/voice',
        resource_type: 'video',
        allowed_formats: ['mp3', 'wav', 'ogg', 'webm', 'aac', 'm4a'],
    }),
});

const menuFilesStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
        if (file.fieldname === 'voice_file') {
            return {
                folder: 'restaurant/voice',
                resource_type: 'video',
                allowed_formats: ['mp3', 'wav', 'ogg', 'webm', 'aac', 'm4a'],
            };
        }
        return {
            folder: 'restaurant/images',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }],
        };
    },
});

const voiceFileFilter = (_req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/x-m4a', 'audio/mp4'];
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.webm', '.aac', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files (MP3, WAV, OGG, WebM, AAC, M4A) are allowed'), false);
    }
};

const imageFileFilter = (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'), false);
    }
};

const uploadVoice = multer({
    storage: voiceStorage,
    fileFilter: voiceFileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

const uploadMenuFiles = multer({
    storage: menuFilesStorage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'voice_file') {
            voiceFileFilter(req, file, cb);
        } else if (file.fieldname === 'image_file') {
            imageFileFilter(req, file, cb);
        } else {
            cb(null, true);
        }
    },
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

module.exports = { uploadVoice, uploadImage, uploadMenuFiles, cloudinary };
