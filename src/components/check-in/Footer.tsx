import React from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useDocumentFormStore } from '@/store/useDocumentFormStore';
import { useDetailFormStore } from '@/store/useDetailFormStore';
import { useSlugStore } from '@/store/useProjectStore';

interface FormValue {
  value: any;
  is_default: boolean;
}

interface Context {
  extras: Record<string, any>;
}

interface Details {
  [key: string]: any;
  context: Context;
}

interface Document {
  [key: string]: any;
  context: Context;
}

interface FooterProps {
  activeStep: number;
  stepsLength: number;
  handlePrevious: () => void;
  handleNext: () => void;
  isValid: boolean;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

// Helper function to normalize field names
const normalizeFieldName = (fieldName: string): string => {
  return fieldName.toLowerCase().replace(/\s+/g, '_');
};

const Footer: React.FC<FooterProps> = ({ 
  activeStep, 
  stepsLength, 
  handlePrevious, 
  handleNext,
  isValid = false,
  isSubmitting = false,
  onSuccess,
  onError
}) => {
  const slug = useSlugStore((state) => state.data);
  const entity_id = slug?.id || "";

  const getLeftButtonLabel = () => {
    if (activeStep === 1) return "Back";
    return "Previous";
  };

  const getRightButtonLabel = () => {
    if (activeStep === stepsLength) return "Submit";
    return "Next";
  };

  const handleSubmit = async () => {
    try {
      const documentFormValues = useDocumentFormStore.getState().formValues;
      const detailFormValues = useDetailFormStore.getState().formValues;
  
      const details: Details = {
        context: {
          extras: {}
        }
      };
      
      // Process detail form values
      Object.entries(detailFormValues).forEach(([fieldName, formValue]) => {
        const normalizedFieldName = normalizeFieldName(fieldName);
        if (formValue.is_default) {
          details[normalizedFieldName] = formValue.value;
        } else {
          details.context.extras[normalizedFieldName] = formValue.value;
        }
      });
      
      const document: Document = {
        context: {
          extras: {}
        }
      };
      
      Object.entries(documentFormValues).forEach(([fieldName, formValue]) => {
        let normalizedFieldName = normalizeFieldName(fieldName);
        // Remove 'doc_' prefix if present and normalize
        normalizedFieldName = normalizedFieldName.startsWith('doc_') 
          ? normalizedFieldName.replace('doc_', '') 
          : normalizedFieldName;
        
        if (formValue.is_default) {
          document[normalizedFieldName] = formValue.value;
        } else {
          document.context.extras[normalizedFieldName] = formValue.value;
        }
      });
      
      const payload = {
        entity_id,
        details,
        document,
        is_tnc_accepted: true 
      };
      
      await axios.post(`/checkin/`, payload);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error submitting checkin data:', error);
      if (onError) onError(error);
      throw error;
    }
  };

  const handleRightButtonClick = async () => {
    if (activeStep === stepsLength) {
      await handleSubmit();
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed bottom-0 w-full max-w-sm bg-white py-4 px-6 shadow-md border-t">
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          {getLeftButtonLabel()}
        </Button>
        <Button 
          onClick={handleRightButtonClick}
          disabled={!isValid || (activeStep === stepsLength && isSubmitting)}
        >
          {isSubmitting ? "Submitting..." : getRightButtonLabel()}
        </Button>
      </div>
    </div>
  );
};

export default Footer;