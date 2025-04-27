'use client';

import React, { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Document from './Document';
import PersonalInformationStep from './UserInfo';
import SignatureStep from './Signature';
import Footer from "./Footer";
import { ChevronLeft } from 'lucide-react'
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

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
  {
    id: 3,
    title: "Signature",
    description: "Provide your electronic signature",
    component: SignatureStep
  }
];

export default function CustomShadcnStepper() {
  const [activeStep, setActiveStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidationChange = (isValid: boolean) => {
    console.log('Validation changed:', isValid); // For debugging
    setIsStepValid(isValid);
  };

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
      setIsStepValid(false); // Reset validation when moving to next step
    }
  };

  const handlePrevious = () => {
    if (activeStep === 1) {
      router.back()
    } else if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (activeStep === steps.length) {
      setIsSubmitting(true);
      try {
        const signatureData = document.querySelector('canvas')?.toDataURL();
        
        if (signatureData) {
          console.log("Signature Data:", signatureData);
          // Handle successful submission (e.g., show success message, redirect)
          router.push('/'); // or wherever you want to redirect
        } else {
          console.log("No signature found");
        }
      } catch (error) {
        console.error('Submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
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
    switch (activeStep) {
      case 1:
        return <Document onValidationChange={handleValidationChange} />;
      case 2:
        return <PersonalInformationStep onValidationChange={handleValidationChange} />;
      case 3:
        return <SignatureStep onValidationChange={handleValidationChange} />;
      default:
        return null;
    }
  };

  const router = useRouter();

  return (
    <div className="w-full mx-auto space-y-6 flex flex-col h-screen">
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
              <div className={`mt-2 text-xs text-center font-medium ${activeStep === step.id ? "text-primary" : activeStep > step.id ? "text-green-600" : "text-muted-foreground"}`}>
                {step.title}
              </div>
            </div>
            {/* Extend the line between steps */}
            {index < steps.length - 1 && (
              <div className={`h-1 w-full mx-2 transition-colors duration-300 ${activeStep > step.id ? "bg-green-500" : "bg-muted"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      </div>
      
      <div className='flex-1 flex flex-col items-center'>
        {renderCurrentStep()}
      {/* <Card>
        <CardHeader>
          <CardTitle>{steps[activeStep - 1].title}</CardTitle>
          <CardDescription>
            {steps[activeStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent />
        </CardContent>
      </Card> */}
      </div>

      {/* Footer for Navigation Buttons */}
      <Footer 
        activeStep={activeStep} 
        stepsLength={steps.length} 
        handlePrevious={handlePrevious} 
        handleNext={activeStep === steps.length ? handleSubmit : handleNext}
        isValid={isStepValid}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
