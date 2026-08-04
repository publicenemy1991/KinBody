/**
 * Compresses a base64 image data string using HTML Canvas.
 * Resizes the image to fit within maxDimension and lowers JPEG quality.
 */
export function compressBase64Image(
  base64Str: string,
  maxDimension = 800,
  quality = 0.65
): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedData = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedData);
    };

    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
