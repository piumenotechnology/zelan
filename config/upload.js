const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/voice', 'uploads/images'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Configure storage for voice files
const voiceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads/voice'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Configure storage for image files
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads/images'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter for voice files
const voiceFileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/x-m4a', 'audio/mp4'];
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.webm', '.aac', '.m4a'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files (MP3, WAV, OGG, WebM, AAC, M4A) are allowed'), false);
    }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'), false);
    }
};

// Create multer instances
const uploadVoice = multer({
    storage: voiceStorage,
    fileFilter: voiceFileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

// Combined upload for menu items (voice + image)
const uploadMenuFiles = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = file.fieldname === 'voice_file' ? 'uploads/voice' : 'uploads/images';
            cb(null, path.join(__dirname, '..', dir));
        },
        filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'voice_file') {
            voiceFileFilter(req, file, cb);
        } else if (file.fieldname === 'image_file') {
            imageFileFilter(req, file, cb);
        } else {
            cb(null, true);
        }
    },
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
    }
});

module.exports = {
    uploadVoice,
    uploadImage,
    uploadMenuFiles
};
