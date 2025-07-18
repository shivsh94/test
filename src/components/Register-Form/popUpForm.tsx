import "react-phone-number-input/style.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import * as z from "zod";

import { userInfo } from "@/lib/userApi";
import { useSlugStore } from "@/store/useProjectStore";
import { getCaptchaToken } from "@/utils/captcha";
import { storeFormSubmission } from "@/utils/storageUtils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z
    .string()
    .min(1, "Contact is required")
    .refine((val) => {
      return /^\+[1-9]\d{3,14}$/.test(val);
    }, "Invalid phone number format"),
});

interface PopUpFormProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess?: (data: { id: any; name: string; contact: string }) => void;
  pathname: string;
  slug: string;
}

export default function PopUpForm({
  open,
  onClose,
  onSubmitSuccess,
  pathname,
  slug,
}: Readonly<PopUpFormProps>) {
  const { data: slugData } = useSlugStore();
  const primaryColor = slugData?.company?.primary_color ?? "#1e40af";
  const primaryTextColor = slugData?.company?.primary_text_color ?? "#ffffff";
  const [phoneValue, setPhoneValue] = useState<string>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      contact: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { name: string; contact: string }) => {
      if (!slugData?.id || !slugData?.company_id) {
        throw new Error("Project ID or Company ID not available");
      }

      const token = await getCaptchaToken();
      if (!token) {
        throw new Error("Failed to get reCAPTCHA token");
      }

      return userInfo(
        slugData.id,
        token,
        slugData.company_id,
        data.name,
        data.contact
      );
    },
    onSuccess: (response) => {
      try {
        const formSubmissionResponse = {
          id: response.id,
          name: form.getValues("name"),
          contact: form.getValues("contact"),
          pathname: pathname,
          timestamp: new Date().toISOString(),
        };
        storeFormSubmission(formSubmissionResponse, slug);

        if (onSubmitSuccess) {
          onSubmitSuccess(formSubmissionResponse);
        }

        setIsSubmitted(true);
      } catch (err) {
        console.error("Failed to save to local storage:", err);
      }
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
    },
  });

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  const handleClose = () => {
    if (isSubmitted) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open && isSubmitted) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose, isSubmitted]);

  useEffect(() => {
    if (open) {
      setIsSubmitted(false);
      // Prevent body scroll when popup is open
      document.body.style.overflow = "hidden";

      // Handle viewport changes for mobile keyboard
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        );
      }
    } else {
      // Restore body scroll when popup is closed
      document.body.style.overflow = "unset";

      // Restore original viewport
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0"
        );
      }
    }

    // Cleanup function to ensure scroll is restored
    return () => {
      document.body.style.overflow = "unset";
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0"
        );
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300" />
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-1 transition-transform duration-300 ease-out">
        <div
          className="bg-white rounded-t-lg shadow-lg w-full max-w-sm max-h-[85vh] overflow-y-auto"
          style={{
            minHeight: "auto",
            transform: "translateY(0)",
          }}
        >
          <div className="px-4 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Contact Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Please provide your name and contact details.
                </p>
              </div>
              {isSubmitted && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="px-4 space-y-4"
          >
            <div>
              <input
                {...form.register("name")}
                placeholder="Your Name"
                className={`w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                  form.formState.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <PhoneInput
                international
                defaultCountry="IN"
                value={phoneValue}
                onChange={(value) => {
                  setPhoneValue(value);
                  form.setValue("contact", value || "");
                  form.trigger("contact");
                }}
                className={`w-full border rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-transparent focus:outline-none ${
                  form.formState.errors.contact
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {form.formState.errors.contact && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.contact.message}
                </p>
              )}
            </div>

            <div className="text-center text-xs text-gray-500">
              Protected by reCAPTCHA. Google{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              apply.
            </div>

            <div className="pb-6">
              <button
                type="submit"
                disabled={!form.formState.isValid || isPending}
                className="w-full py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  backgroundColor:
                    form.formState.isValid && !isPending
                      ? primaryColor
                      : "#9CA3AF",
                  color: primaryTextColor,
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
