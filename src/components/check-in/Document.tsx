import "react-phone-number-input/style.css";

import { format } from "date-fns";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  File,
  FileText,
  ImagePlus,
  Link as LinkIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";
import PhoneInput from "react-phone-number-input";
import countries from "world-countries";
import { StoreApi, useStore } from "zustand";

import { Options, Show } from "@/components/check-in/attributeConditions";
import InfoTooltip from "@/components/InfoToolTip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/uploadFile";
import { cn } from "@/lib/utils";
import { BaseFormState } from "@/store/formStoreFactory";
import { useDocumentFormStore } from "@/store/useDocumentFormStore";

import DocumentValidation from "./DocumentValidation";
import SignatureComponent from "./Signature";

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

interface DocumentUploadFormProps {
  onValidationChange: (isValid: boolean) => void;
  attributes: AttributeType[];
  store?: StoreApi<BaseFormState>;
}

const DynamicDocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onValidationChange,
  attributes,
  store,
}) => {
  const documentAttributes = React.useMemo(() => {
    return attributes;
  }, [attributes]);

  const formStore = store! ?? useDocumentFormStore();

  const formValues = useStore(formStore, (s) => s.formValues);
  const fileUploads = useStore(formStore, (s) => s.fileUploads);
  const phoneNumberValidity = useStore(formStore, (s) => s.phoneNumberValidity);
  const dropdownStates = useStore(formStore, (s) => s.dropdownStates);
  const selectedCountry = useStore(formStore, (s) => s.selectedCountry);
  const selectedRegion = useStore(formStore, (s) => s.selectedRegion);
  const isCountryDropdownOpen = useStore(
    formStore,
    (s) => s.isCountryDropdownOpen
  );
  const isRegionDropdownOpen = useStore(
    formStore,
    (s) => s.isRegionDropdownOpen
  );

  const initializeForm = useStore(formStore, (s) => s.initializeForm);
  const handleValueChange = useStore(formStore, (s) => s.handleValueChange);
  const handlePhoneNumberChange = useStore(
    formStore,
    (s) => s.handlePhoneNumberChange
  );
  const removeFile = useStore(formStore, (s) => s.removeFile);
  const toggleDropdown = useStore(formStore, (s) => s.toggleDropdown);
  const setSelectedCountry = useStore(formStore, (s) => s.setSelectedCountry);
  const setSelectedRegion = useStore(formStore, (s) => s.setSelectedRegion);
  const setIsCountryDropdownOpen = useStore(
    formStore,
    (s) => s.setIsCountryDropdownOpen
  );
  const setIsRegionDropdownOpen = useStore(
    formStore,
    (s) => s.setIsRegionDropdownOpen
  );

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (documentAttributes.length > 0 && Object.keys(formValues).length === 0) {
      initializeForm(documentAttributes);
    }
  }, [documentAttributes, initializeForm, formValues]);

  useEffect(() => {
    return () => {
      const currentFileUploads = formStore.getState().fileUploads;
      Object.values(currentFileUploads).forEach((upload) => {
        if (upload.preview && upload.preview.startsWith("blob:")) {
          URL.revokeObjectURL(upload.preview);
        }
      });
    };
  }, [formStore]);

  const sortedAttributes = useMemo(() => {
    return [...documentAttributes].sort((a, b) => a.position - b.position);
  }, [documentAttributes]);

  const groupedAttributes = useMemo(() => {
    const groups: Record<string, AttributeType[]> = {};

    sortedAttributes.forEach((attr) => {
      if (!groups[attr.section]) {
        groups[attr.section] = [];
      }
      groups[attr.section].push(attr);
    });

    return groups;
  }, [sortedAttributes]);

  const sectionOrder = useMemo(() => {
    const order: string[] = [];
    sortedAttributes.forEach((attr) => {
      if (!order.includes(attr.section)) {
        order.push(attr.section);
      }
    });
    return order;
  }, [sortedAttributes]);

  const validateFile = (file: File, fieldType: "Image" | "File"): boolean => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const MAX_SIZE_MB = 10;

    if (!file || !file.name) {
      return false;
    }

    if (fieldType === "Image" && !allowedImageTypes.includes(file.type)) {
      return false;
    }
    if (fieldType === "File" && !allowedFileTypes.includes(file.type)) {
      return false;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      return false;
    }

    if (file.size < 100) {
      return false;
    }

    return true;
  };

  const handleUploadAndState = async (
    file: File,
    fieldName: string,
    fieldType: "Image" | "File"
  ) => {
    try {
      const currentRef = fileInputRefs.current[fieldName];
      const result = await uploadFile(file, fieldName, fieldType, {
        current: { [fieldName]: currentRef },
      });

      // Use the new completeFileUpload method
      formStore.getState().completeFileUpload(fieldName, true, result.url);
    } catch (error) {
      formStore
        .getState()
        .completeFileUpload(fieldName, false, undefined, "Upload failed");
    }
  };
  const compressAndUploadFile = async (
    file: File,
    fieldName: string,
    fieldType: "Image" | "File"
  ) => {
    // Check if this field is already uploading to prevent duplicate uploads
    const currentState = formStore.getState();
    if (currentState.fileUploads[fieldName]?.uploadStatus === "uploading") {
      console.log(`Upload already in progress for ${fieldName}`);
      return;
    }

    if (!validateFile(file, fieldType)) {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      const allowedFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const errorMessage =
        fieldType === "Image"
          ? !allowedImageTypes.includes(file.type)
            ? "Invalid Image Format"
            : "Image Size Limit Exceeded"
          : !allowedFileTypes.includes(file.type)
            ? "Invalid File Format"
            : "File Size Limit Exceeded";

      formStore.setState((state) => ({
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            ...state.fileUploads[fieldName],
            uploadStatus: "error",
            fileError: errorMessage,
            file: null,
            preview: null,
          },
        },
      }));
      return;
    }

    // Clean up previous preview if it exists
    const currentPreview = formStore.getState().fileUploads[fieldName]?.preview;
    if (currentPreview && currentPreview.startsWith("blob:")) {
      URL.revokeObjectURL(currentPreview);
    }

    // Set uploading state with new preview
    const preview = fieldType === "Image" ? URL.createObjectURL(file) : null;
    formStore.setState((state) => ({
      fileUploads: {
        ...state.fileUploads,
        [fieldName]: {
          ...state.fileUploads[fieldName],
          uploadStatus: "uploading",
          fileError: null,
          file: file,
          preview: preview,
        },
      },
    }));

    try {
      if (fieldType === "Image") {
        const MAX_WIDTH = 600;
        const MAX_SIZE_MB = 1;
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > MAX_SIZE_MB) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const srcEncoded = event.target?.result as string;
              const img = new window.Image();

              const imageLoadPromise = new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = srcEncoded;
              });

              await imageLoadPromise;
              const currentState = formStore.getState();
              if (
                currentState.fileUploads[fieldName]?.uploadStatus !==
                "uploading"
              ) {
                return;
              }

              const canvas = document.createElement("canvas");
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;

              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const blobPromise = new Promise<Blob | null>((resolve) => {
                  canvas.toBlob(resolve, "image/jpeg", 0.8);
                });

                const blob = await blobPromise;
                if (blob) {
                  const currentState = formStore.getState();
                  if (
                    currentState.fileUploads[fieldName]?.uploadStatus !==
                    "uploading"
                  ) {
                    return;
                  }

                  const compressedFile = new window.File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  await handleUploadAndState(
                    compressedFile,
                    fieldName,
                    fieldType
                  );
                }
              }
            } catch (error) {
              console.error("Image processing error:", error);
              await handleUploadAndState(file, fieldName, fieldType);
            }
          };

          reader.onerror = () => {
            console.error("FileReader error");
            handleUploadAndState(file, fieldName, fieldType);
          };

          reader.readAsDataURL(file);
        } else {
          await handleUploadAndState(file, fieldName, fieldType);
        }
      } else {
        await handleUploadAndState(file, fieldName, fieldType);
      }
    } catch (error) {
      console.log("error", error);
      const currentState = formStore.getState();
      if (currentState.fileUploads[fieldName]?.uploadStatus === "uploading") {
        formStore.setState((state) => ({
          fileUploads: {
            ...state.fileUploads,
            [fieldName]: {
              ...state.fileUploads[fieldName],
              uploadStatus: "error",
              fileError: "An error occurred",
            },
          },
        }));
      }
    }
  };

  const getDocumentTypes = (country: string) => {
    const defaultDocTypes = ["Passport"];
    const countrySpecificDocTypes: Record<string, string[]> = {
      India: ["Aadhar Card", "Driving License", "Voter ID", "Passport"],
    };
    return countrySpecificDocTypes[country] || defaultDocTypes;
  };

  const FileUploadBox = ({
    preview,
    onFileChange,
    onRemove,
    label,
    inputRef,
    uploadStatus,
    fileError,
    isRequired,
    fieldType,
    fieldName,
  }: {
    preview: string | null;
    onFileChange: (file: File) => void;
    onRemove: () => void;
    label: string;
    inputRef: (el: HTMLInputElement | null) => void;
    uploadStatus: "idle" | "uploading" | "success" | "error";
    fileError: string | null;
    isRequired: boolean;
    fieldType: "Image" | "File";
    fieldName: string;
  }) => {
    const isUploadingCurrentField = uploadStatus === "uploading";

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      // Only prevent file selection if THIS specific field is uploading
      if (files && files[0] && !isUploadingCurrentField) {
        onFileChange(files[0]);
        e.target.value = "";
      }
    };

    const handleRemove = () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      onRemove();
    };

    return (
      <div className="space-y-2">
        <Label className="font-semibold">
          {label} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {fileError && (
          <Alert variant="destructive" className="mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </div>
          </Alert>
        )}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200",
            preview
              ? "border-green-500 bg-muted/50"
              : "border-gray-300 hover:border-blue-500 hover:bg-blue-50",
            uploadStatus === "uploading" && "border-yellow-500 bg-yellow-50",
            uploadStatus === "success" && "border-green-500 bg-muted/100",
            uploadStatus === "error" && "border-red-500 bg-red-50"
          )}
        >
          {!fileError && preview ? (
            <div className="relative">
              <div className="mb-2">
                <p className="text-xs text-muted-foreground">{`Upload Status: ${
                  uploadStatus.charAt(0).toUpperCase() + uploadStatus.slice(1)
                }`}</p>
                {uploadStatus === "uploading" && (
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              {fieldType === "Image" ? (
                <div className="relative">
                  <Image
                    src={preview}
                    alt="Document preview"
                    width={400}
                    height={400}
                    unoptimized
                    priority={false}
                    className="max-h-48 mx-auto rounded-lg object-contain"
                    style={{ maxWidth: "100%", height: "auto" }}
                    onError={(e) => {
                      console.warn("Image preview failed to load");
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                  {/* Add fallback message for failed images */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    {uploadStatus === "success"
                      ? "Upload Complete"
                      : "Uploading..."}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium break-words">
                    {fileUploads[fieldName]?.file?.name || "Uploaded File"}
                  </p>
                </div>
              )}

              <Button
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="absolute top-0 right-0 rounded-full p-1 m-2"
                type="button"
                disabled={isUploadingCurrentField}
                style={{ minHeight: "32px", minWidth: "32px" }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <input
                ref={inputRef}
                type="file"
                accept={
                  fieldType === "Image"
                    ? "image/jpeg,image/jpg,image/png"
                    : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                }
                onChange={handleFileInputChange}
                className="hidden"
                id={`file-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
                disabled={isUploadingCurrentField}
              />
              <Label
                htmlFor={`file-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "cursor-pointer flex flex-col items-center min-h-[120px] justify-center",
                  isUploadingCurrentField && "cursor-not-allowed"
                )}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                }}
              >
                {fieldType === "Image" ? (
                  <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
                ) : (
                  <File className="h-12 w-12 text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground text-center px-2">
                  {uploadStatus === "uploading"
                    ? "Uploading..."
                    : uploadStatus === "success"
                      ? "Upload Successful"
                      : uploadStatus === "error"
                        ? "Upload Failed, Try Again"
                        : fieldType === "Image"
                          ? `Tap to upload ${label.toLowerCase()}`
                          : `Tap to upload ${label.toLowerCase()}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 text-center px-2">
                  {fieldType === "Image"
                    ? "Supports JPG, JPEG, PNG (Max 10MB)"
                    : "Supports PDF, DOC, DOCX (Max 10MB)"}
                </p>
              </Label>
            </div>
          )}
          {fileUploads[fieldName]?.queue?.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {fileUploads[fieldName].queue.length} file(s) waiting to upload
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderField = (attribute: AttributeType) => {
    const {
      name,
      label: fieldLabel,
      field_type,
      is_required,
      help_text,
      context,
      is_default,
    } = attribute;
    const fieldKey = `${name}-${field_type}`;

    const shouldShow = Show({
      attribute,
      formValues: formStore.getState().formValues,
    });

    if (!shouldShow) return null;

    switch (field_type) {
      case "Text":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Input
              type="text"
              value={formValues[name]?.value || ""}
              onChange={(e) =>
                handleValueChange(name, e.target.value, is_default)
              }
              placeholder={`Enter ${name.toLowerCase()}`}
            />
          </div>
        );

      case "Long Text":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Textarea
              value={formValues[name]?.value || ""}
              onChange={(e) =>
                handleValueChange(name, e.target.value, is_default)
              }
              placeholder={`Enter ${name.toLowerCase()}`}
              rows={4}
            />
          </div>
        );

      case "Email":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Input
              type="email"
              value={formValues[name]?.value || ""}
              onChange={(e) => {
                const value =
                  e.target.value.trim() === "" ? null : e.target.value;
                handleValueChange(name, value, is_default);
              }}
              placeholder="example@domain.com"
            />
          </div>
        );

      case "Phone":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <div className="react-phone-input-container">
              <PhoneInput
                placeholder="Enter phone number"
                value={formValues[name]?.value || ""}
                onChange={(value: string | undefined) =>
                  handlePhoneNumberChange(name, value || "")
                }
                defaultCountry="IN"
                international
                countrySelectProps={{
                  value: selectedCountry,
                  onChange: (value: string | undefined) =>
                    setSelectedCountry(value || "India"),
                  className: "flex-1 px-3 py-2 bg-secondary rounded",
                }}
                inputComponent={
                  Input as React.ComponentType<
                    React.InputHTMLAttributes<HTMLInputElement>
                  >
                }
                required={is_required}
                style={{
                  width: "100%",
                  fontSize: "16px",
                }}
                inputStyle={{
                  fontSize: "16px",
                  width: "100%",
                }}
              />
            </div>
            {!phoneNumberValidity[name] && (
              <span className="text-destructive text-sm">
                Please enter a valid phone number.
              </span>
            )}
          </div>
        );

      case "Number":
      case "Amount":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Input
              type="number"
              value={formValues[name]?.value || ""}
              onChange={(e) =>
                handleValueChange(
                  name,
                  parseFloat(e.target.value) || 0,
                  is_default
                )
              }
              placeholder={`Enter ${name.toLowerCase()}`}
              min={field_type === "Amount" ? 0 : undefined}
              step={field_type === "Amount" ? "0.01" : "1"}
            />
          </div>
        );

      case "Date":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {/* Year Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span>
                      {formValues[name]?.value
                        ? new Date(formValues[name].value).getFullYear()
                        : "Year"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="grid grid-cols-3 gap-1 p-2 max-h-60 overflow-auto">
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - 80 + i;
                      return (
                        <Button
                          key={year}
                          variant="ghost"
                          onClick={() => {
                            const currentDate = formValues[name]?.value
                              ? new Date(formValues[name].value)
                              : new Date();
                            currentDate.setFullYear(year);
                            handleValueChange(name, currentDate, is_default);
                          }}
                          className={cn(
                            "w-full",
                            formValues[name]?.value &&
                              new Date(formValues[name].value).getFullYear() ===
                                year
                              ? "bg-accent"
                              : ""
                          )}
                        >
                          {year}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Month Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span>
                      {formValues[name]?.value
                        ? format(new Date(formValues[name].value), "MMMM")
                        : "Month"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <Button
                          key={month}
                          variant="ghost"
                          onClick={() => {
                            const currentDate = formValues[name]?.value
                              ? new Date(formValues[name].value)
                              : new Date();
                            currentDate.setMonth(month - 1);
                            handleValueChange(name, currentDate, is_default);
                          }}
                          className={cn(
                            "w-full",
                            formValues[name]?.value &&
                              new Date(formValues[name].value).getMonth() +
                                1 ===
                                month
                              ? "bg-accent"
                              : ""
                          )}
                        >
                          {format(new Date(2000, month - 1, 1), "MMMM")}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span>
                      {formValues[name]?.value
                        ? new Date(formValues[name].value).getDate()
                        : "Day"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {Array.from(
                      {
                        length: formValues[name]?.value
                          ? new Date(
                              new Date(formValues[name].value).getFullYear(),
                              new Date(formValues[name].value).getMonth() + 1,
                              0
                            ).getDate()
                          : 31,
                      },
                      (_, i) => {
                        const day = i + 1;
                        return (
                          <Button
                            key={day}
                            variant="ghost"
                            onClick={() => {
                              const currentDate = formValues[name]?.value
                                ? new Date(formValues[name].value)
                                : new Date();
                              currentDate.setDate(day);
                              handleValueChange(name, currentDate, is_default);
                            }}
                            className={cn(
                              "w-full",
                              formValues[name]?.value &&
                                new Date(formValues[name].value).getDate() ===
                                  day
                                ? "bg-accent"
                                : ""
                            )}
                          >
                            {day}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case "Time":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                type="time"
                value={formValues[name]?.value || ""}
                onChange={(e) =>
                  handleValueChange(name, e.target.value, is_default)
                }
              />
              <Clock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        );

      case "Image":
      case "File":
        const isFrontSide = name.toLowerCase().includes("front");
        const isBackSide = name.toLowerCase().includes("back");
        const label = isFrontSide
          ? "Front Side"
          : isBackSide
            ? "Back Side"
            : name;

        return (
          <div key={name}>
            <FileUploadBox
              preview={fileUploads[name]?.preview || null}
              onFileChange={(file) =>
                compressAndUploadFile(file, name, field_type)
              }
              onRemove={() => removeFile(name)}
              label={fieldLabel}
              inputRef={(el) => (fileInputRefs.current[name] = el)}
              uploadStatus={fileUploads[name]?.uploadStatus || "idle"}
              fileError={fileUploads[name]?.fileError || null}
              isRequired={is_required}
              fieldType={field_type}
              fieldName={name}
            />
          </div>
        );

      case "URL":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                type="url"
                value={formValues[name]?.value || ""}
                onChange={(e) =>
                  handleValueChange(name, e.target.value, is_default)
                }
                placeholder="https://example.com"
              />
              <LinkIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        );

      case "Checkbox":
        return (
          <div key={fieldKey} className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={formValues[name]?.value || false}
              onCheckedChange={(checked) =>
                handleValueChange(name, checked, is_default)
              }
            />
            <Label htmlFor={name} className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
            </Label>
          </div>
        );

      case "Country":
        const countryList = Object.values(countries).map((c) => ({
          value: c.name.common,
          label: c.name.common,
          key: c.cca2,
          region: c.region,
        }));

        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Popover
              modal
              open={isCountryDropdownOpen}
              onOpenChange={setIsCountryDropdownOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {countryList.find((c) => c.key === formValues[name]?.value)
                    ?.label || "Select Country..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder="Search country..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countryList.map((c) => (
                        <CommandItem
                          key={c.key}
                          onSelect={() => {
                            setSelectedCountry(c.value);
                            setSelectedRegion(c.region);
                            setIsCountryDropdownOpen(false);
                            handleValueChange(name, c.key, is_default);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formValues[name]?.value === c.key
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {c.label} ({c.region})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "State":
        const regionList = Array.from(
          new Set(countries.map((c) => c.region).filter(Boolean))
        );

        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Popover
              modal
              open={isRegionDropdownOpen}
              onOpenChange={setIsRegionDropdownOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedRegion || "Select State / Region..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder="Search state / region..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No Region found.</CommandEmpty>
                    <CommandGroup>
                      {regionList.map((s) => (
                        <CommandItem
                          key={s}
                          onSelect={() => {
                            setSelectedRegion(s);
                            setIsRegionDropdownOpen(false);
                            handleValueChange(name, s, is_default);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedRegion === s ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "Dropdown":
        if (name === "Document Type") {
          const country = formValues["Document Issuing Country"]?.value || "";
          const documentTypes = getDocumentTypes(country);

          return (
            <div key={fieldKey} className="flex flex-col space-y-2">
              <Label className="font-semibold">
                {fieldLabel}{" "}
                {is_required && <span className="text-destructive">*</span>}
                {help_text && (
                  <span>
                    <InfoTooltip helpText={help_text} />
                  </span>
                )}
              </Label>
              <Popover
                modal
                open={dropdownStates[name]}
                onOpenChange={(isOpen) => toggleDropdown(name, isOpen)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={!country}
                  >
                    {formValues[name]?.value || "Select Document Type..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search document type..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No document type found.</CommandEmpty>
                      <CommandGroup>
                        {documentTypes.map((type) => (
                          <CommandItem
                            key={type}
                            onSelect={() => {
                              handleValueChange(name, type, is_default);
                              toggleDropdown(name, false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formValues[name]?.value === type
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          );
        }

        const options = Options({
          options: context?.options || {},
          formValues: formStore.getState().formValues,
          attribute,
        });
        console.log(
          JSON.stringify(options),
          JSON.stringify(formStore.getState().formValues)
        );
        const optionList = Object.keys(options).map((key) => ({
          value: key,
          label: options[key],
        }));

        return (
          <div key={name} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Popover
              open={dropdownStates[name]}
              onOpenChange={(isOpen) => toggleDropdown(name, isOpen)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {optionList.find(
                    (opt) => opt.value === formValues[name]?.value
                  )?.label || `Select ${fieldLabel}...`}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder={`Search ${fieldLabel.toLowerCase()}...`}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandGroup>
                      {optionList.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            handleValueChange(name, option.value, is_default);
                            toggleDropdown(name, false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formValues[name]?.value === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "Multi Select Dropdown":
        const multiOptions = context?.options || {};
        const multiOptionList = Object.keys(multiOptions).map((key) => ({
          value: key,
          label: multiOptions[key],
        }));

        return (
          <div key={name} className="flex flex-col space-y-2">
            <Label className="font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-destructive">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </Label>
            <Popover
              open={dropdownStates[name]}
              onOpenChange={(isOpen) => toggleDropdown(name, isOpen)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {(formValues[name]?.value?.length || 0) > 0
                    ? `${formValues[name].value.length} selected`
                    : `Select ${name}...`}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder={`Search ${name.toLowerCase()}...`}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandGroup>
                      {multiOptionList.map((option) => {
                        const isSelected =
                          formValues[name]?.value?.includes(option.label) ||
                          false;
                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => {
                              const currentValues =
                                formValues[name]?.value || [];
                              const newValues = isSelected
                                ? currentValues.filter(
                                    (v: string) => v !== option.label
                                  )
                                : [...currentValues, option.label];
                              handleValueChange(name, newValues, is_default);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center">
                              <div
                                className={cn(
                                  "mr-2 h-4 w-4 border rounded flex items-center justify-center",
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-border"
                                )}
                              >
                                {isSelected && (
                                  <CheckCircle className="h-3 w-3 text-white" />
                                )}
                              </div>
                              {option.label}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {(formValues[name]?.value?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formValues[name].value.map((value: string) => (
                  <div
                    key={value}
                    className="flex items-center bg-secondary px-2 py-1 rounded text-sm"
                  >
                    {value}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newValues = formValues[name].value.filter(
                          (v: string) => v !== value
                        );
                        handleValueChange(name, newValues, is_default);
                      }}
                      className="ml-1 h-4 w-4"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "Sign":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {fieldLabel}{" "}
              {is_required && <span className="text-red-500">*</span>}
              {help_text && (
                <span>
                  <InfoTooltip helpText={help_text} />
                </span>
              )}
            </label>
            <SignatureComponent
              fieldName={name}
              defaultValue={formValues[name]?.value || ""}
              onValidationChange={(isValid) => {}}
              onSignatureChange={(dataUrl) => {
                handleValueChange(name, dataUrl, is_default);
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full px-4 flex-1 p-4 space-y-4 overflow-auto">
      <DocumentValidation
        documentAttributes={documentAttributes}
        formValues={Object.fromEntries(
          Object.entries(formValues).map(([k, v]) => [k, v.value])
        )}
        fileUploads={fileUploads}
        phoneNumberValidity={phoneNumberValidity}
        onValidationChange={onValidationChange}
      />

      {sectionOrder.map((section) => (
        <React.Fragment key={section}>
          {groupedAttributes[section]?.length > 0 && (
            <h3 className="text-lg font-medium">{section}</h3>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {groupedAttributes[section]?.map(renderField)}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default DynamicDocumentUploadForm;
