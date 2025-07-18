import axios from "axios";

import { getCaptchaToken } from "@/utils/captcha";
import { getLocalStorageItem } from "@/utils/storageUtils";

const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const uploadFile = async (
  file: File | string,
  fieldName: string,
  fieldType: "Image" | "File" | "Signature",
  fileInputRefs: React.RefObject<{ [key: string]: HTMLInputElement | null }>,
  onStatusChange?: (status: "uploading" | "success" | "error") => void
) => {
  const token = await getCaptchaToken();
  const company = getLocalStorageItem("formSubmissionResponse");
  const company_id = company?.id;

  try {
    onStatusChange?.("uploading");

    let fileName: string;
    let fileToUpload: Blob;
    let contentType: string;

    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const year = now.getFullYear();

    if (typeof file === "string") {
      fileName = `${fieldName}-${crypto.randomUUID()}-signature.png`;
      contentType = "image/png";

      const response = await fetch(file);
      fileToUpload = await response.blob();
    } else {
      // Sanitize the original filename to remove problematic characters
      const sanitizedOriginalName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace non-alphanumeric chars with underscore
        .replace(/_{2,}/g, "_") // Replace multiple underscores with single
        .replace(/^_|_$/g, ""); // Remove leading/trailing underscores

      if (fieldType === "Image") {
        const extension = sanitizedOriginalName.split(".").pop() || "jpg";
        const random = Date.now();
        const baseName = sanitizedOriginalName.replace(
          /(\.[^/.]+)$/,
          "_" + Math.random().toString(36).substring(2, 8)
        );

        fileName = `${fieldName}-${random}-${baseName}.${extension}`;
      } else {
        fileName = sanitizedOriginalName;
      }
      fileToUpload = file;
      contentType = file.type;
    }

    const uploadUrlResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL?.replace("guest", "@")}/general/get/upload/url/`,
      {
        paths: [fileName],
        prefix: `${company_id}/documents/${year}/${month}/${day}`,
        is_private: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          captcha: token,
        },
      }
    );

    if (uploadUrlResponse.data && uploadUrlResponse.data[fileName]) {
      const uploadUrl = uploadUrlResponse.data[fileName];

      const uploadResponse = await axios.put(uploadUrl, fileToUpload, {
        headers: {
          "Content-Type": contentType,
        },
      });

      if (uploadResponse.status !== 200) {
        throw new Error("File upload failed");
      }

      const fileUrl = uploadUrl.split("?")[0];

      // Ensure the URL is properly encoded
      const properlyEncodedUrl = encodeURI(decodeURI(fileUrl));

      if (fileInputRefs.current && fileInputRefs.current[fieldName]) {
        fileInputRefs.current[fieldName]!.value = "";
      }

      onStatusChange?.("success");

      return {
        url: properlyEncodedUrl,
        fieldName,
        fieldType,
      };
    } else {
      throw new Error("Failed to get upload URL");
    }
  } catch (error) {
    console.error("Upload error:", error);
    onStatusChange?.("error");
    throw error;
  }
};
