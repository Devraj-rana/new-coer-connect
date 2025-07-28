import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const readFileAsDataUrl = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size too large. Please choose an image under 5MB.'));
      return;
    }

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      if (typeof fileReader.result === 'string') {
        // For very large images, you could add compression logic here
        return resolve(fileReader.result);
      }
    }
    fileReader.onerror = () => {
      reject(new Error('Failed to read file'));
    }
    fileReader.readAsDataURL(file);
  })
}