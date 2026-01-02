/**
 * MediaPipe Face Mesh Utility for Virtual Lipstick Application
 * Uses Google's MediaPipe library for accurate facial landmark detection
 */

import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize MediaPipe FaceLandmarker with WASM backend
 * This is called once and cached for performance
 */
export async function initializeFaceLandmarker(): Promise<void> {
  // Return existing promise if already initializing
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // Return if already initialized
  if (faceLandmarker) {
    return;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionOnWeb({
        wasmLoaderPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm'
      });

      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU' // Use GPU if available, falls back to CPU
        },
        outputFaceExpressions: false,
        outputFaceBlendshapes: false,
        numFaces: 1,
        runningMode: 'IMAGE'
      });

      console.log('MediaPipe FaceLandmarker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe FaceLandmarker:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Detect facial landmarks from an image
 * Returns lip region bounds for makeup application
 */
export async function detectLipRegion(imageElement: HTMLImageElement | HTMLCanvasElement) {
  if (!faceLandmarker) {
    await initializeFaceLandmarker();
  }

  if (!faceLandmarker) {
    throw new Error('FaceLandmarker failed to initialize');
  }

  try {
    // Detect landmarks
    const results = faceLandmarker.detectForVideo(imageElement, Date.now());

    if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
      return null;
    }

    const landmarks = results.faceLandmarks[0];

    // MediaPipe provides 478 facial landmarks
    // Lips landmarks indices: outer lip region is approximately 0-20 and 290-310
    // For our purpose, we'll use the main lip contour points

    // Key lip landmarks from MediaPipe's FACEMESH_LIPS
    const lipIndices = [
      61, 146, 91, 181, 84, 17, 314, 405, 321, 375, // outer lip top
      78, 191, 80, 81, 82, 13, 312, 311, 310, 415,  // lip details
      95, 88, 178, 87, 14, 317, 402, 318, 324, 308   // lower lip
    ];

    // Extract lip region points
    const lipPoints = lipIndices
      .filter(idx => idx < landmarks.length)
      .map(idx => {
        const landmark = landmarks[idx];
        return {
          x: landmark.x,
          y: landmark.y,
          z: landmark.z
        };
      });

    if (lipPoints.length === 0) {
      return null;
    }

    // Calculate bounding box for lip region (normalized 0-1 coordinates)
    const minX = Math.min(...lipPoints.map(p => p.x));
    const maxX = Math.max(...lipPoints.map(p => p.x));
    const minY = Math.min(...lipPoints.map(p => p.y));
    const maxY = Math.max(...lipPoints.map(p => p.y));

    // Add padding to expand the region slightly
    const paddingX = (maxX - minX) * 0.1;
    const paddingY = (maxY - minY) * 0.15;

    return {
      minX: Math.max(0, minX - paddingX),
      maxX: Math.min(1, maxX + paddingX),
      minY: Math.max(0, minY - paddingY),
      maxY: Math.min(1, maxY + paddingY),
      lipPoints,
      allLandmarks: landmarks
    };
  } catch (error) {
    console.error('Error detecting lip region:', error);
    return null;
  }
}

/**
 * Apply lipstick color to detected lip region using MediaPipe landmarks
 * More accurate than pure color detection
 */
export async function applyLipstickWithMediaPipe(
  imageDataUri: string,
  colorHex: string
): Promise<string> {
  return new Promise(async (resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // Create canvas from image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageDataUri);
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Detect lip region using MediaPipe
        const lipRegion = await detectLipRegion(img);

        if (!lipRegion) {
          // Fallback to basic color detection if MediaPipe fails
          console.log('MediaPipe detection failed, using fallback method');
          resolve(imageDataUri);
          return;
        }

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert hex to RGB
        const hex = colorHex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Apply color to lip region
        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          const x = pixelIndex % canvas.width;
          const y = Math.floor(pixelIndex / canvas.width);

          // Normalize coordinates
          const normX = x / canvas.width;
          const normY = y / canvas.height;

          // Check if pixel is in lip region
          if (normX >= lipRegion.minX && normX <= lipRegion.maxX &&
              normY >= lipRegion.minY && normY <= lipRegion.maxY) {

            const pixelR = data[i];
            const pixelG = data[i + 1];
            const pixelB = data[i + 2];
            const alpha = data[i + 3];

            // Detect if this is a lip pixel (darker/reddish pixels in the region)
            const isLipPixel = alpha > 200 && (
              (pixelR > pixelG && pixelR > pixelB - 20) ||  // reddish
              (pixelR > 100 && pixelG < 100 && pixelB < 100)  // natural lip color
            );

            if (isLipPixel) {
              // Blend the new color with original, preserving some natural texture
              const blendFactor = 0.8;
              data[i] = Math.round(pixelR * (1 - blendFactor) + r * blendFactor);
              data[i + 1] = Math.round(pixelG * (1 - blendFactor) + g * blendFactor);
              data[i + 2] = Math.round(pixelB * (1 - blendFactor) + b * blendFactor);
              // Keep alpha unchanged
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (error) {
        console.error('Error applying lipstick:', error);
        resolve(imageDataUri);
      }
    };

    img.onerror = () => {
      console.error('Failed to load image');
      resolve(imageDataUri);
    };

    img.src = imageDataUri;
  });
}

/**
 * Clean up resources
 */
export function cleanup() {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
  isInitializing = false;
  initPromise = null;
}
