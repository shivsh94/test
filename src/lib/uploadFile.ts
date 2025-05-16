import axios from "axios";


export const uploadFile = async (
  file: File,
  fieldName: string,
  fieldType: "Image" | "File",
  fileInputRefs: React.RefObject<{ [key: string]: HTMLInputElement | null }>,
  onStatusChange?: (status: "uploading" | "success" | "error") => void
) => {
  try {
    onStatusChange?.("uploading");
    
    const uploadUrlResponse = await axios.post("http://localhost:8000/server/@/v1/general/get/upload/url/", {
      paths: [file.name],
      prefix: "Documents", 
      is_private: false
    });

    if (uploadUrlResponse.data && uploadUrlResponse.data[file.name]) {
      const uploadUrl = uploadUrlResponse.data[file.name];
  
      const uploadResponse = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      });
      if (uploadResponse.status !== 200) {
        throw new Error('File upload failed');
      }
      const fileUrl = uploadUrl.split('?')[0];
      console.log("File uploaded successfully:", fileUrl);

      if (fileInputRefs.current && fileInputRefs.current[fieldName]) {
        fileInputRefs.current[fieldName]!.value = "";
      }

      onStatusChange?.("success");
  
      return {
        url: uploadUrl.split('?')[0], 
        fieldName,
        fieldType
      };
    } else {
      throw new Error('Failed to get upload URL');
    }
  } catch (error) {
    console.error("Upload error:", error);
    onStatusChange?.("error");
    throw error;
  }
};