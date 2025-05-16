'use client';

import React, { useState } from 'react';
import Document from './Document';
import PersonalInformationStep from './UserInfo';
import Footer from "./Footer";
import { ChevronLeft } from 'lucide-react'
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { useDocumentFormStore } from '@/store/useDocumentFormStore';
import { useDetailFormStore } from '@/store/useDetailFormStore';

const steps = [
  {
    id: 1,
    title: "Document",
    description: "Upload required documents",
    component: Document
  },
  {
    id: 2,
    title: "Details",
    description: "Enter your personal details",
    component: PersonalInformationStep
  },
];

export default function CustomShadcnStepper() {
  const [activeStep, setActiveStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleValidationChange = (isValid: boolean) => {
    setIsStepValid(isValid);
  };

  const handleNext = () => {
    if (activeStep < steps.length && isStepValid) {
      setActiveStep(activeStep + 1);
      setIsStepValid(false); // Reset validation when moving to next step
    }
  };

  const handlePrevious = () => {
    if (activeStep === 1) {
      router.back();
    } else if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const preparePayload = () => {
    const documentFormValues = useDocumentFormStore.getState().formValues;
    const detailFormValues = useDetailFormStore.getState().formValues;
    
    const details: any = {
      context: {
        extras: {}
      }
    };
    
    // Process detail form values
    Object.entries(detailFormValues).forEach(([fieldName, formValue]) => {
      if (formValue.is_default) {
        details[fieldName.toLowerCase()] = formValue.value;
      } else {
        details.context.extras[fieldName] = formValue.value;
      }
    });
    
    // Prepare document object
    const document: any = {
      context: {
        extras: {}
      }
    };
    
    // Process document form values
    Object.entries(documentFormValues).forEach(([fieldName, formValue]) => {
      const normalizedFieldName = fieldName.toLowerCase().startsWith('doc_') 
        ? fieldName.toLowerCase().replace('doc_', '') 
        : fieldName.toLowerCase();
      
      if (formValue.is_default) {
        document[normalizedFieldName] = formValue.value;
      } else {
        document.context.extras[fieldName] = formValue.value;
      }
    });

    // Get signature if available
    const signatureData = document.querySelector('canvas')?.toDataURL();

    return {
      details,
      document,
      signature: signatureData,
      is_tnc_accepted: true
    };
  };

  const handleSubmit = async () => {
    if (!isStepValid) return;
    
    setIsSubmitting(true);
    try {
      const payload = preparePayload();
      console.log("Submitting payload:", payload); 

      const response = await axios.post('/checkin/', payload);
      if(response){
        toast.success("Check-in submitted successfully!");
        router.push('/success'); 
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({ step, isActive, isCompleted }: { 
    step: number, 
    isActive: boolean, 
    isCompleted: boolean 
  }) => {
    return (
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
        isCompleted 
          ? "bg-green-500 border-green-500 text-white" 
          : isActive 
            ? "border-primary text-primary" 
            : "border-muted-foreground text-muted-foreground"
      )}>
        {step}
      </div>
    );
  };

  const renderCurrentStep = () => {
    const StepComponent = steps[activeStep - 1].component;
    return <StepComponent onValidationChange={handleValidationChange} />;
  };

  return (
    <div className="w-full relative mx-auto space-y-6 flex flex-col max-h-fit">
      <div className='sticky top-0 z-50 bg-white shadow-sm rounded-b'>
        <div className="flex flex-1 shrink-0 items-center p-4 border-b">
          <button
            onClick={() => router.back()}
            className="absolute text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="mx-auto text-xl font-semibold">Contactless Checkin</h1>
        </div>
        
        {/* Step Navigation */}
        <div className="flex justify-evenly items-baseline p-4 w-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center w-full">
                <StepIndicator 
                  step={step.id} 
                  isActive={activeStep === step.id}
                  isCompleted={activeStep > step.id}
                />
                <div className={`mt-2 text-xs text-center font-medium ${
                  activeStep === step.id ? "text-primary" : 
                  activeStep > step.id ? "text-green-600" : 
                  "text-muted-foreground"
                }`}>
                  {step.title}
                </div>
              </div>
            
              {index < steps.length - 1 && (
                <div className={`h-1 w-full mx-2 transition-colors duration-300 ${
                  activeStep > step.id ? "bg-green-500" : "bg-muted"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className='flex-1 flex flex-col items-center'>
        {renderCurrentStep()}
      </div>

      <Footer 
        activeStep={activeStep}
        stepsLength={steps.length}
        handlePrevious={handlePrevious}
        handleNext={activeStep === steps.length ? handleSubmit : handleNext}
        isValid={isStepValid}
        isSubmitting={isSubmitting}/>
    </div>
  );
}