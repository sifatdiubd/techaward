import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getDriveImageUrl = (url) => {
  if (!url) {
    return "https://placehold.co/150x150/1a1a1a/e0e0e0?text=No+Img";
  }
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const match = url.match(/[-\w]{25,}/);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[0]}`;
    }
  }
  return url;
};
