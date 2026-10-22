import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadToImageKit, getImageKitAuth } from '../../common/services/imagekit.service';
import { successResponse } from '../../common/utils/response';
import { authenticate } from '../../common/middleware/auth';

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload endpoint (authenticated users & admins)
uploadRouter.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let fileData: string | Buffer | undefined;
      let fileName = 'upload_' + Date.now();
      const folder = (req.body?.folder as string) || '/evee-uploads';

      if (req.file) {
        fileData = req.file.buffer;
        fileName = req.file.originalname || fileName;
      } else if (req.body?.file) {
        fileData = req.body.file;
        if (req.body.fileName) fileName = req.body.fileName;
      }

      if (!fileData) {
        res.status(400).json({ success: false, error: 'No image file or base64 data provided' });
        return;
      }

      const result = await uploadToImageKit(fileData, fileName, folder);
      successResponse(res, result, { statusCode: 201, message: 'Image uploaded successfully' });
    } catch (err: any) {
      next(err);
    }
  }
);

// Get client auth parameters for direct upload
uploadRouter.get('/auth', authenticate, (req: Request, res: Response) => {
  const authParams = getImageKitAuth();
  successResponse(res, authParams);
});
