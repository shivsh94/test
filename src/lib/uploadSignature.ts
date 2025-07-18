import { uploadFile } from "@/lib/uploadFile";
import { useDetailFormStore } from "@/store/useDetailFormStore";

/**
 * @param {Array<Object>} documentAttributes
 * @param {Object} fileInputRefs
 * @returns {Promise<Object>}
 */
interface DocumentAttribute {
  field_type: string;
  name: string;
}

import { RefObject } from "react";

export const uploadSignatures = async (
  documentAttributes: Array<DocumentAttribute>,
  fileInputRefs: RefObject<{ [key: string]: HTMLInputElement | null }>
): Promise<object> => {
  const { formValues } = useDetailFormStore.getState();
  const signatureFields = documentAttributes.filter(
    (attr) => attr.field_type === "Sign"
  );
  const signatureUrls: { [key: string]: string } = {};

  await Promise.all(
    signatureFields.map(async (field) => {
      const fieldName = field.name;
      const dataUrl = formValues[fieldName]?.value;

      if (!dataUrl || dataUrl.startsWith("http")) {
        return;
      }

      try {
        const result = await uploadFile(
          dataUrl,
          fieldName,
          "Signature",
          fileInputRefs,
          (status) => {
            useDetailFormStore.setState((state) => ({
              fileUploads: {
                ...state.fileUploads,
                [fieldName]: {
                  ...state.fileUploads[fieldName],
                  uploadStatus: status,
                  fileError: status === "error" ? "Upload failed" : null,
                },
              },
            }));
          }
        );

        signatureUrls[fieldName] = result.url;
      } catch (error) {
        console.error(`Failed to upload signature for ${fieldName}:`, error);
        useDetailFormStore.setState((state) => ({
          fileUploads: {
            ...state.fileUploads,
            [fieldName]: {
              ...state.fileUploads[fieldName],
              uploadStatus: "error",
              fileError:
                error instanceof Error ? error.message : "Upload failed",
            },
          },
        }));
        throw error;
      }
    })
  );

  return signatureUrls;
};
