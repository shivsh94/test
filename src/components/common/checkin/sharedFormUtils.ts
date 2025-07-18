export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export const validateFile = (
  file: File,
  fieldType: "Image" | "File"
): boolean => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (fieldType === "Image" && !allowedImageTypes.includes(file.type)) {
    return false;
  }
  if (fieldType === "File" && !allowedFileTypes.includes(file.type)) {
    return false;
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_IMAGE_SIZE) {
    return false;
  }

  return true;
};

export const bufferToDataURL = (
  buffer: ArrayBuffer,
  mimeType: string = "image/jpeg"
) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${window.btoa(binary)}`;
};

export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new window.File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            0.8
          );
        }
      };
    };
  });
};

export const getDocumentTypes = (country: string) => {
  const defaultDocTypes = ["Passport"];
  const countrySpecificDocTypes: Record<string, string[]> = {
    India: ["Aadhar Card", "Driving License", "Voter ID", "Passport"],
  };
  return countrySpecificDocTypes[country] || defaultDocTypes;
};
