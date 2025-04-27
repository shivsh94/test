// components/Footer.tsx
import React from 'react';
import { Button } from "@/components/ui/button";

interface FooterProps {
  activeStep: number;
  stepsLength: number;
  handlePrevious: () => void;
  handleNext: () => void;
  isValid: boolean;
  isSubmitting?: boolean;
}

const Footer: React.FC<FooterProps> = ({ 
  activeStep, 
  stepsLength, 
  handlePrevious, 
  handleNext,
  isValid = false,
  isSubmitting = false
}) => {
  
  const getLeftButtonLabel = () => {
    if (activeStep === 1) return "Back";
    return "Previous";
  };

  const getRightButtonLabel = () => {
    if (activeStep === stepsLength) return "Submit";
    return "Next";
  };

  return (
    <div className="sticky bottom-0 left-0 w-full bg-white py-4 px-6 shadow-md border-t">
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          {getLeftButtonLabel()}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isValid || (activeStep === stepsLength && isSubmitting)}
        >
          {isSubmitting ? "Submitting..." : getRightButtonLabel()}
        </Button>
      </div>
    </div>
  );
};

export default Footer;
