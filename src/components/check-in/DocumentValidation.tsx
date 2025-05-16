import React, { useEffect } from "react";
import { CheckinAttribute } from "@/store/useCheck-inStore";

interface DocumentValidationProps {
  documentAttributes: CheckinAttribute[];
  formValues: Record<string, any>;
  fileUploads: Record<
    string,
    {
      file: File | null;
      preview: string | null;
      uploadStatus: "idle" | "uploading" | "success" | "error";
      fileError: string | null;
    }
  >;
  phoneNumberValidity: Record<string, boolean>;
  onValidationChange: (isValid: boolean) => void;
}

const DocumentValidation: React.FC<DocumentValidationProps> = ({
  documentAttributes,
  formValues,
  fileUploads,
  phoneNumberValidity,
  onValidationChange,
}) => {
  console.log(formValues);
  
  useEffect(() => {
    const requiredFields = documentAttributes.filter(
      (attr) => attr.is_required
    );

    const isValid = requiredFields.every((field) => {
      if (field.field_type === "Image" || field.field_type === "File") {
        return (
          fileUploads[field.name]?.file !== null &&
          fileUploads[field.name]?.uploadStatus === "success"
        );
      }
      if (field.field_type === "Checkbox") {
        return formValues[field.name].value === true;
      }
      if (field.field_type === "Multi Select Dropdown") {
        return formValues[field.name]?.length > 0;
      }
      if (field.field_type === "Phone") {
        return phoneNumberValidity[field.name] !== false;
      }
      return !!formValues[field.name];
    });

    onValidationChange(isValid);
  }, [formValues, fileUploads, phoneNumberValidity, documentAttributes]);

  return null;
};

export default DocumentValidation;