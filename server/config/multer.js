const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            const fileExt = path.extname(file.originalname).toLowerCase();
            const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Images and PDFs are classified under the image type by Cloudinary's auto uploader.
            // For these, Cloudinary appends the extension automatically. For others (raw), we append it ourselves.
            const isImageOrPdf = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf'].includes(fileExt);
            return {
                folder: 'auxp_vault',
                resource_type: 'auto',
                public_id: isImageOrPdf ? uniqueId : uniqueId + fileExt
            };
        }
    });
} else {
    // Fallback to local storage
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });
}

const upload = multer({ 
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

module.exports = upload;
