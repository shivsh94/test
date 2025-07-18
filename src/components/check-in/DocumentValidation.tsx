// DocumentValidation.tsx
import React, { useEffect } from "react";

import { Show } from "./attributeConditions";

interface AttributeType {
  required: boolean;
  name: string;
  label: string;
  section: string;
  field_type: any;
  field_for: any;
  help_text: string;
  position: number;
  is_required: boolean;
  is_disabled: boolean;
  show_on_list_view?: boolean;
  context: any;
  id?: string;
  entity_id?: string;
  is_default: boolean;
  created_at?: string;
  created_by_id?: string;
  updated_at?: string;
  updated_by_id?: string;
}

interface DocumentValidationProps {
  documentAttributes: AttributeType[];
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
  useEffect(() => {
    const requiredFields = documentAttributes.filter(
      (attr) =>
        attr.is_required && Show({ attribute: attr, formValues: formValues })
    );

    const isValid = requiredFields.every((field) => {
      let fieldValue;
      if (
        typeof formValues[field.name] === "object" &&
        formValues[field.name] !== null &&
        "value" in formValues[field.name]
      ) {
        fieldValue = formValues[field.name].value;
      } else {
        fieldValue = formValues[field.name];
      }

      if (field.field_type === "Sign") {
        return !!fieldValue && fieldValue !== "";
      }

      // console.log(`Field '${field.name}' value:`, fieldValue);

      if (field.field_type === "Image" || field.field_type === "File") {
        return fileUploads[field.name]?.uploadStatus === "success";
      }

      if (field.field_type === "Checkbox") {
        return fieldValue === true;
      }

      if (field.field_type === "Multi Select Dropdown") {
        return Array.isArray(fieldValue) && fieldValue.length > 0;
      }

      if (field.field_type === "Phone") {
        if (field.field_type === "Phone") {
          const isPhoneValid = phoneNumberValidity[field.name] !== false;
          if (!isPhoneValid) return false;
        }
        if (typeof fieldValue === "string") {
          return fieldValue.trim() !== "";
        } else {
          return !!fieldValue;
        }
      }
      if (typeof fieldValue === "string") {
        return fieldValue.trim() !== "";
      } else if (typeof fieldValue === "number") {
        return true;
      } else if (fieldValue === null || fieldValue === undefined) {
        return false;
      } else {
        return true;
      }
    });

    // console.log("Form validation result:", isValid);
    onValidationChange(isValid);
  }, [
    formValues,
    fileUploads,
    phoneNumberValidity,
    documentAttributes,
    onValidationChange,
  ]);

  return null;
};

export default DocumentValidation;
