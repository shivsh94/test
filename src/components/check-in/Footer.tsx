"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";

import { Button } from "@/components/ui/button";
import { uploadSignatures } from "@/lib/uploadSignature";
import useCheckinStore from "@/store/useCheck-inStore";
import { useDetailFormStore } from "@/store/useDetailFormStore";
import { useDocumentFormStore } from "@/store/useDocumentFormStore";
import { useSlugStore } from "@/store/useProjectStore";
import { getCaptchaToken } from "@/utils/captcha";

import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

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

interface GuestData {
  mainGuest?: Guest;
  additionalGuests?: Guest[];
  currentProperty?: string;
  rid?: string | null;
}

interface Guest {
  name: string;
  id: string;
  checkinId: string;
  property: string;
  timestamp: string;
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

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  const extractMainError = (error: string) => {
    const firstLine = error.split("\n")[0];
    return firstLine || "An error occurred during check-in";
  };

  const mainError = extractMainError(message);

  return (
    <div className="fixed bottom-24  left-1/2 transform -translate-x-1/2 z-50 w-[80%] max-w-2xl h-[50%] overflow-y-auto">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-start p-4">
          <div className="ml-3 flex-1 overflow-auto max-h-60">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {mainError}
            </p>
            <details className="mt-2 text-xs text-red-700 dark:text-red-300">
              <summary className="cursor-pointer">
                Show technical details
              </summary>
              <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-x-auto">
                {message}
              </pre>
            </details>
          </div>
          <button
            onClick={onDismiss}
            className="ml-2 flex-shrink-0 flex text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 focus:outline-none"
            aria-label="Close error"
          >
            <X className="h-15 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const normalizeFieldName = (fieldName: string): string => {
  return fieldName.trim().toLowerCase().replace(/\s+/g, "_");
};

const dispatchStorageChange = () => {
  window.dispatchEvent(
    new CustomEvent("localStorageChange", {
      detail: { key: "guestData", newValue: localStorage.getItem("guestData") },
    })
  );
};

const useGuestCheckinMutation = () => {
  return useMutation({
    mutationFn: async (payload: { data: any; token: string }) => {
      const response = await axios.post(`/checkin/`, payload.data, {
        headers: {
          Captcha: payload.token,
        },
      });
      return response.data;
    },
  });
};

const Footer: React.FC<FooterProps> = ({
  activeStep,
  stepsLength,
  handlePrevious,
  handleNext,
  isValid = false,
  isSubmitting = false,
  onSuccess,
  onError,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const slug = useSlugStore((state) => state.data);
  const entity_id = slug?.id ?? "";
  const primaryColor = slug?.company?.primary_color;
  const primaryTextColor = slug?.company?.primary_text_color ?? "#ffffff";
  const resetDocumentForm = useDocumentFormStore((state) => state.resetForm);
  const resetDetailForm = useDetailFormStore((state) => state.resetForm);
  const { checkinAttributes } = useCheckinStore();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const rid = searchParams.get("rid");
  const { mutate: submitGuestCheckin, isPending } = useGuestCheckinMutation();

  useEffect(() => {
    if (rid) {
      localStorage.setItem("rid", rid);
    }
  }, [rid]);

  const getLeftButtonLabel = () => (activeStep === 1 ? "Back" : "Previous");
  const getRightButtonLabel = () =>
    activeStep === stepsLength ? "Submit" : "Next";

  const handleLeftButtonClick = () => {
    if (activeStep === 1) {
      resetDocumentForm();
      resetDetailForm();
    }
    handlePrevious();
  };

  const prepareFormData = async () => {
    const documentFormValues = useDocumentFormStore.getState().formValues;
    const token = await getCaptchaToken();
    const signatureUrls = await uploadSignatures(
      checkinAttributes,
      fileInputRefs
    );

    for (const [fieldName, url] of Object.entries(signatureUrls)) {
      useDetailFormStore.setState((state) => ({
        formValues: {
          ...state.formValues,
          [fieldName]: {
            ...state.formValues[fieldName],
            value: url,
          },
        },
      }));
    }

    const updatedDetailFormValues = useDetailFormStore.getState().formValues;

    const details: Details = { context: { extras: {} } };
    Object.entries(updatedDetailFormValues).forEach(
      ([fieldName, formValue]) => {
        const normalizedFieldName = normalizeFieldName(fieldName);
        if (formValue.is_default) {
          details[normalizedFieldName] = formValue.value;
        } else {
          details.context.extras[normalizedFieldName] = formValue.value;
        }
      }
    );

    const document: Document = { context: { extras: {} } };
    Object.entries(documentFormValues).forEach(([fieldName, formValue]) => {
      const normalizedFieldName = normalizeFieldName(fieldName);
      if (formValue.is_default) {
        document[normalizedFieldName] = formValue.value;
      } else {
        document.context.extras[normalizedFieldName] = formValue.value;
      }
    });

    const guestData: GuestData = JSON.parse(
      localStorage.getItem("guestData") ?? "{}"
    );
    const isMainGuest = !guestData.mainGuest;

    return {
      token,
      entity_id,
      details: {
        ...details,
        email: details.email === "" ? null : details.email,
      },
      document,
      is_tnc_accepted: true,
      is_main_guest: isMainGuest,
      guestData,
    };
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { token, entity_id, details, document, is_main_guest, guestData } =
        await prepareFormData();

      const subdetails = {
        ...details,
        email: details.email === "" ? null : details.email,
      };
      // details.email === "" ? null : details.email;
      submitGuestCheckin(
        {
          data: {
            entity_id,
            details: subdetails,
            document,
            is_tnc_accepted: true,
            is_main_guest,
          },
          token: token ?? "",
        },
        {
          onSuccess: (responseData) => {
            const property =
              window.location.pathname.split("/")[1] ?? "default-property";
            const updatedDetailFormValues =
              useDetailFormStore.getState().formValues;
            const nameField = "name";
            const idField = "ID Number";
            const fullName = updatedDetailFormValues[nameField]?.value ?? "";
            const guestId =
              updatedDetailFormValues[idField]?.value ?? responseData.id;

            const newGuest: Guest = {
              name: fullName,
              id: guestId,
              checkinId: responseData.id,
              property,
              timestamp: new Date().toISOString(),
            };

            const updatedGuestData: GuestData = !guestData.mainGuest
              ? {
                  mainGuest: newGuest,
                  additionalGuests: [],
                  currentProperty: property,
                  rid: rid ?? null,
                }
              : {
                  ...guestData,
                  additionalGuests: [
                    ...(guestData.additionalGuests ?? []),
                    newGuest,
                  ],
                  rid: guestData.rid ?? rid ?? null,
                };

            localStorage.setItem("guestData", JSON.stringify(updatedGuestData));
            dispatchStorageChange();

            resetDocumentForm();
            setShowSuccess(true);
            onSuccess?.();
          },
          onError: (error) => {
            let errorMessage = "An unknown error occurred";

            if (axios.isAxiosError(error)) {
              errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error?.message ||
                error.message ||
                "Failed to submit form";
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }

            setError(errorMessage);
            onError?.(error);
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      setIsLoading(false);
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      onError?.(error);
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
    <>
      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <Drawer.Root
        open={showSuccess}
        onOpenChange={setShowSuccess}
        shouldScaleBackground={false}
      >
        <Drawer.Overlay
          className="fixed inset-0 bg-black/40"
          onClick={(e) => e.stopPropagation()}
        />
        <DrawerContent
          className="rounded-t-2xl mx-auto w-full max-w-sm"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <DrawerTitle className="text-center">
                Successfully Checked-in!
              </DrawerTitle>
              <DrawerDescription className="text-center">
                Your form has been submitted successfully
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    const basePath = window.location.pathname.split("/")[1];
                    const homePageUrl = rid
                      ? `${window.location.origin}/${basePath}/?rid=${rid}`
                      : `${window.location.origin}/${basePath}/`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                      `Use this link to checkin: ${homePageUrl}`
                    )}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                  className="w-full"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccess(false);
                    resetDocumentForm();
                    resetDetailForm();
                    router.push(
                      rid
                        ? `/${window.location.pathname.split("/")[1]}/check-in?rid=${rid}`
                        : `/${window.location.pathname.split("/")[1]}/check-in`
                    );

                    if (activeStep === stepsLength) {
                      handlePrevious();
                    }
                  }}
                  className="w-full"
                  style={{
                    backgroundColor: primaryColor,
                    color: primaryTextColor,
                  }}
                >
                  Add More Guest
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccess(false);
                  onSuccess?.();
                  const pathParts = window.location.pathname.split("/");
                  const basePath = pathParts[1];
                  router.push(
                    rid ? `/${basePath}/?rid=${rid}` : `/${basePath}/`
                  );
                  dispatchStorageChange();
                }}
                className="w-full mt-4"
              >
                Back to Home
              </Button>
            </div>
            <DrawerFooter></DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer.Root>
      <div className="fixed bottom-0 w-full max-w-sm bg-background py-4 px-6 shadow-md border-t">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleLeftButtonClick}
            disabled={isPending || isLoading}
          >
            {getLeftButtonLabel()}
          </Button>
          <Button
            onClick={handleRightButtonClick}
            disabled={!isValid || isPending || isLoading}
            style={{
              backgroundColor: primaryColor,
              color: primaryTextColor,
            }}
          >
            {isPending || isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {activeStep === stepsLength ? "Submitting..." : "Loading..."}
              </div>
            ) : (
              getRightButtonLabel()
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Footer;
