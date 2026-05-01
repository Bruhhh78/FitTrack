const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage for body progress images
const bodyImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fittrack/body-progress',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for meal images
const mealImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fittrack/meals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for batch thumbnails
const batchImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fittrack/batches',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for PDFs
const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fittrack/pdfs',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

const uploadBodyImage = multer({ storage: bodyImageStorage });
const uploadMealImage = multer({ storage: mealImageStorage });
const uploadBatchImage = multer({ storage: batchImageStorage });
const uploadPdf = multer({ storage: pdfStorage });

// Memory storage for flexible uploads
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
  },
});

// Upload to cloudinary from buffer
const uploadToCloudinary = (buffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `fittrack/${folder}`,
        resource_type: resourceType,
        quality: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = {
  uploadBodyImage,
  uploadMealImage,
  uploadBatchImage,
  uploadPdf,
  uploadToMemory,
  uploadToCloudinary,
};
