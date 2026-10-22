import ImageKit from 'imagekit';
import { config } from '../../config';
import { logger } from '../utils/logger';

let imagekitInstance: ImageKit | null = null;

export function getImageKit(): ImageKit {
  if (!imagekitInstance) {
    imagekitInstance = new ImageKit({
      privateKey: config.imagekit.privateKey,
      publicKey: config.imagekit.publicKey,
      urlEndpoint: config.imagekit.urlEndpoint,
    });
  }
  return imagekitInstance;
}

export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  filePath: string;
}

export async function uploadToImageKit(
  file: string | Buffer,
  fileName: string,
  folder = '/evee-uploads'
): Promise<ImageKitUploadResult> {
  const ik = getImageKit();

  try {
    const response = await ik.upload({
      file,
      fileName,
      folder,
      useUniqueFileName: true,
    });

    logger.info(`[ImageKit] Successfully uploaded image: ${response.url}`);

    return {
      fileId: response.fileId,
      name: response.name,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      filePath: response.filePath,
    };
  } catch (error: any) {
    logger.error(`[ImageKit] Upload failed: ${error.message || error}`);
    throw new Error(error.message || 'ImageKit upload failed');
  }
}

export function getImageKitAuth() {
  const ik = getImageKit();
  return ik.getAuthenticationParameters();
}
