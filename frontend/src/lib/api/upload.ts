const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface UploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  filePath: string;
}

/**
 * Uploads an image file to ImageKit via backend `/api/v1/upload` endpoint.
 * Handles FormData with User Bearer token and automatic error extraction.
 */
export async function uploadImageToImageKit(
  file: File | Blob,
  folder = '/evee-avatars'
): Promise<UploadResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch(`${BASE.replace(/\/$/, '')}/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type so browser sets boundary for multipart/form-data
    },
    body: formData,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = json?.error || json?.message || res.statusText || 'Upload failed';
    throw new Error(errorMsg);
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as UploadResult;
  }

  return json as UploadResult;
}
