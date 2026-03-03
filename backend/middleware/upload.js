import multer from 'multer';
import { imagekit } from '../config/imagekit.js';
import { AppError } from './errorHandler.js';

// Store files in memory (buffer) — not disk — for ImageKit upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Only JPEG, PNG, and WEBP images are allowed', 400), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * Upload a buffer to ImageKit and return { url, fileId }.
 * @param {Buffer} buffer
 * @param {string} filename
 * @param {string} folder
 */
export async function uploadToImageKit(buffer, filename, folder = '/ostas') {
    try {
        const result = await imagekit.upload({
            file: buffer,
            fileName: filename,
            folder,
            useUniqueFileName: true,
        });
        return { url: result.url, fileId: result.fileId };
    } catch (err) {
        throw new AppError(`Image upload failed: ${err.message}`, 500);
    }
}

/**
 * Delete a file from ImageKit by fileId.
 * @param {string} fileId
 */
export async function deleteFromImageKit(fileId) {
    try {
        await imagekit.deleteFile(fileId);
    } catch (err) {
        // Log but don't throw — image deletion failure shouldn't block DB operations
        console.error(`ImageKit deletion failed for ${fileId}:`, err.message);
    }
}
