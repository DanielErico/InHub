import { supabase } from './supabase';

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  progress: number; // 0 to 100
}

/**
 * Uploads a file to Supabase Storage with progress tracking using XMLHttpRequest.
 * 
 * @param bucket - The name of the Supabase storage bucket (e.g., 'course-content')
 * @param path - The path inside the bucket (e.g., 'videos/123.mp4')
 * @param file - The File object to upload
 * @param onProgress - Callback function that receives progress updates (0 to 100)
 * @returns Promise that resolves to the public URL of the uploaded file
 */
export async function uploadFileWithProgress(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated for upload');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('cache-control', '3600');
    xhr.setRequestHeader('x-upsert', 'true');
    // Content-Type should be determined by the file, or application/octet-stream
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Successfully uploaded, now get public URL
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        resolve(data.publicUrl);
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload aborted'));
    };

    // Send the raw file directly in the body, as expected by Supabase storage REST API
    xhr.send(file);
  });
}
