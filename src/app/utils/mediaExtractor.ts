import * as pdfjsLib from 'pdfjs-dist';

// Use unpkg for the worker to ensure correct resolution of the .mjs file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts text from a remote PDF url.
 */
export async function extractPdfText(url: string, maxPages = 50): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = Math.min(pdf.numPages, maxPages);
    
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // @ts-ignore
        const pageText = textContent.items.map(t => t.str).join(' ');
        fullText += `[Page ${i}]: ${pageText}\n`;
    }
    
    return fullText;
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return "Error: Could not extract text from the PDF.";
  }
}

/**
 * Extracts keyframes from a video as base64 images by loading it into a hidden canvas.
 */
export async function extractVideoFrames(url: string, numberOfFrames = 4): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = url;
    video.muted = true;
    // Autoplay is sometimes needed for browsers to fetch frames, but load is usually enough
    video.preload = "auto";
    
    video.addEventListener("loadedmetadata", async () => {
      const duration = video.duration;
      // If duration is NaN or very low, fallback immediately
      if (!duration || duration < 1) {
          resolve([]);
          return;
      }
      
      const canvas = document.createElement("canvas");
      // Keep resolution reasonable to avoid 413 Payload Too Large on API
      canvas.width = 640;
      canvas.height = Math.round((video.videoHeight / video.videoWidth) * 640) || 360;
      const ctx = canvas.getContext("2d");
      
      const frames: string[] = [];
      
      // We will loop and wait for 'seeked' event
      for (let i = 1; i <= numberOfFrames; i++) {
        const targetTime = (duration / (numberOfFrames + 1)) * i;
        video.currentTime = targetTime;
        
        await new Promise<void>((r) => {
          const seekHandler = () => {
             video.removeEventListener('seeked', seekHandler);
             r();
          };
          video.addEventListener('seeked', seekHandler);
          // Safety timeout in case seek fails
          setTimeout(() => {
              video.removeEventListener('seeked', seekHandler);
              r();
          }, 4000);
        });

        if (ctx) {
           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
           const base64 = canvas.toDataURL("image/jpeg", 0.6); // 60% quality compression
           // To be accepted by NIM API, an image_url needs the data: URI
           frames.push(base64);
        }
      }
      resolve(frames);
    });

    video.addEventListener("error", (e) => {
      console.error("Video frame extraction error:", e);
      resolve([]);
    });

    video.load();
  });
}
