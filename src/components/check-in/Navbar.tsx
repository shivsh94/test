"use client";

import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCheckinAttributes } from "@/hooks/useCheckinData";
import { cn } from "@/lib/utils";
import useCheckinStore from "@/store/useCheck-inStore";
import { useDetailFormStore } from "@/store/useDetailFormStore";
import { useDocumentFormStore } from "@/store/useDocumentFormStore";
import { getLocalStorageItem } from "@/utils/storageUtils";

import Document from "./Document";
import Footer from "./Footer";

const steps = [
  {
    id: 1,
    title: "Document",
    description: "Upload required documents",
    store: useDocumentFormStore,
  },
  {
    id: 2,
    title: "Detail",
    description: "Enter your personal details",
    store: useDetailFormStore,
  },
];

const getStepIndicatorClassName = (isCompleted: boolean, isActive: boolean) => {
  if (isCompleted) {
    return "bg-green-500 border-green-500 text-white";
  }
  if (isActive) {
    return "border-primary text-primary";
  }
  return "border-muted-foreground text-muted-foreground";
};

const getStepTitleClassName = (isActive: boolean, isCompleted: boolean) => {
  if (isActive) {
    return "text-primary";
  }
  if (isCompleted) {
    return "text-green-600";
  }
  return "text-muted-foreground";
};

export default function CustomShadcnStepper() {
  const [activeStep, setActiveStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkinData = useCheckinAttributes();
  const router = useRouter();
  const { checkinAttributes } = useCheckinStore();

  const handleValidationChange = (isValid: boolean) => {
    setIsStepValid(isValid);
  };

  const handleNext = () => {
    if (activeStep < steps.length && isStepValid) {
      setActiveStep(activeStep + 1);
      setIsStepValid(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeStep]);

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
        extras: {},
      },
    };

    Object.entries(detailFormValues).forEach(([fieldName, formValue]) => {
      const normalizedFieldName = fieldName.toLowerCase().replace(/\s+/g, "_");

      // Find the attribute to check field type
      const attribute = checkinAttributes.find(
        (attr) => attr.name === fieldName
      );

      let value = formValue.value;

      if (attribute?.field_type === "Email") {
        value = value === "" ? null : value;
      } else {
        value = value === "" ? null : value;
      }

      if (formValue.is_default) {
        details[normalizedFieldName] = value;
      } else {
        details.context.extras[normalizedFieldName] = value;
      }
    });

    const document: any = {
      context: {
        extras: {},
      },
    };

    Object.entries(documentFormValues).forEach(([fieldName, formValue]) => {
      const finalFieldName = fieldName.toLowerCase().replace(/\s+/g, "_");

      const attribute = checkinAttributes.find(
        (attr) => attr.name === fieldName
      );
      let value = formValue.value;
      if (attribute?.field_type === "Email") {
        value =
          value === "" || value === null || value === undefined
            ? "none"
            : value;
      } else {
        value = value === "" ? null : value;
      }

      if (formValue.is_default) {
        document[finalFieldName] = value;
      } else {
        document.context.extras[finalFieldName] = value;
      }
    });

    return {
      details,
      document,
      is_tnc_accepted: true,
    };
  };

  const handleSubmit = async () => {
    if (!isStepValid) return;

    setIsSubmitting(true);
    try {
      const payload = preparePayload();
      console.log("Submitting payload:", payload);

      const response = await axios.post("/checkin/", payload);
      if (response) {
        toast.success("Check-in submitted successfully!");
        router.push("/success");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({
    step,
    isActive,
    isCompleted,
  }: {
    step: number;
    isActive: boolean;
    isCompleted: boolean;
  }) => {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
          getStepIndicatorClassName(isCompleted, isActive)
        )}
      >
        {step}
      </div>
    );
  };

  const renderCurrentStep = () => {
    const guest = getLocalStorageItem("guestData");
    const form = guest ? "show_on_extra_guest_form" : "show_on_main_guest_form";
    return (
      <Document
        store={steps[activeStep - 1].store}
        attributes={checkinAttributes.filter(
          (attr) =>
            attr.show_on_screen == steps[activeStep - 1].title && attr[form]
        )}
        onValidationChange={handleValidationChange}
      />
    );
  };

  return (
    <div className="w-full relative mx-auto space-y-6 flex flex-col max-h-fit">
      <div className="sticky top-0 z-50 bg-white shadow-sm rounded-b">
        <div className="flex flex-1 shrink-0 items-center p-4 border-b">
          <button
            onClick={() => router.back()}
            className="absolute text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="mx-auto text-xl font-semibold">Contactless Checkin</h1>
        </div>

        <div className="flex justify-evenly items-baseline p-4 w-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center w-full">
                <StepIndicator
                  step={step.id}
                  isActive={activeStep === step.id}
                  isCompleted={activeStep > step.id}
                />
                <div
                  className={`mt-2 text-xs text-center font-medium ${getStepTitleClassName(
                    activeStep === step.id,
                    activeStep > step.id
                  )}`}
                >
                  {step.title}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-full mx-2 transition-colors duration-300 ${
                    activeStep > step.id ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center pb-[80px]">
        {renderCurrentStep()}
      </div>

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
