import React, { useRef, useEffect } from "react";
import {
  Check,
  ChevronsUpDown,
  X,
  ImagePlus,
  AlertTriangle,
  Calendar,
  Clock,
  Link,
  FileText,
  File,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover as DatePopover,
  PopoverContent as DatePopoverContent,
  PopoverTrigger as DatePopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import countries from "world-countries";
import Image from "next/image";
import useCheckinStore, { CheckinAttribute } from "@/store/useCheck-inStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { uploadFile } from "../../lib/uploadFile";
import DocumentValidation from "./DocumentValidation";
import { useDetailFormStore } from "@/store/useDetailFormStore";

interface DetailUploadFormProps {
  onValidationChange: (isValid: boolean) => void;
}

const DynamicDetailUploadForm: React.FC<DetailUploadFormProps> = ({
  onValidationChange,
}) => {
  const { checkinAttributes } = useCheckinStore();
  const documentAttributes = React.useMemo(
    () => checkinAttributes.filter((attr) => attr.show_on_screen === "Detail"),
    [checkinAttributes]
  );

  console.log("Document Attributes:", useDetailFormStore.getState().formValues);
  const {
    formValues,
    fileUploads,
    phoneNumberValidity,
    dropdownStates,
    datePickerStates,
    selectedCountry,
    selectedRegion,
    isCountryDropdownOpen,
    isRegionDropdownOpen,
    initializeForm,
    handleValueChange,
    handlePhoneNumberChange,
    // handleFileUpload,
    removeFile,
    toggleDropdown,
    toggleDatePicker,
    setSelectedCountry,
    setSelectedRegion,
    setIsCountryDropdownOpen,
    setIsRegionDropdownOpen,
  } = useDetailFormStore();

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (documentAttributes.length > 0) {
      initializeForm(documentAttributes);
    }
  }, [documentAttributes, initializeForm]);

  const validateFile = (file: File, fieldType: "Image" | "File"): boolean => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    const allowedFileTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const MAX_SIZE_MB = 10;

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

    return true;
  };

  const compressAndUploadFile = async (
    file: File,
    fieldName: string,
    fieldType: "Image" | "File"
  ) => {
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

      // Set error state
      useDetailFormStore.setState((state) => ({
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            ...state.fileUploads[fieldName],
            uploadStatus: "error",
            fileError: errorMessage,
          },
        },
      }));
      return;
    }

    try {
      // Set uploading state
      useDetailFormStore.setState((state) => ({
        fileUploads: {
          ...state.fileUploads,
          [fieldName]: {
            ...state.fileUploads[fieldName],
            uploadStatus: "uploading",
            fileError: null,
          },
        },
      }));

      if (fieldType === "Image") {
        const MAX_WIDTH = 600;
        const MAX_SIZE_MB = 1;
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > MAX_SIZE_MB) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async (event) => {
            const srcEncoded = event.target?.result as string;
            const img = new window.Image();
            img.src = srcEncoded;

            img.onload = async () => {
              const canvas = document.createElement("canvas");
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;

              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                  async (blob) => {
                    if (blob) {
                      const compressedFile = new window.File(
                        [blob],
                        file.name,
                        {
                          type: "image/jpeg",
                          lastModified: Date.now(),
                        }
                      );
                      try {
                        const result = await uploadFile(
                          compressedFile,
                          fieldName,
                          fieldType,
                          fileInputRefs
                        );
                        // Update store with success state and URL
                        useDetailFormStore.setState((state) => ({
                          fileUploads: {
                            ...state.fileUploads,
                            [fieldName]: {
                              ...state.fileUploads[fieldName],
                              uploadStatus: "success",
                              fileError: null,
                            },
                          },
                          formValues: {
                            ...state.formValues,
                            [fieldName]: {
                              value: result.url,
                              is_default:
                                state.formValues[fieldName]?.is_default ||
                                false,
                            },
                          },
                        }));
                      } catch (error) {
                        console.log("error", error);
                        useDetailFormStore.setState((state) => ({
                          fileUploads: {
                            ...state.fileUploads,
                            [fieldName]: {
                              ...state.fileUploads[fieldName],
                              uploadStatus: "error",
                              fileError: "Upload failed",
                            },
                          },
                        }));
                      }
                    }
                  },
                  "image/jpeg",
                  0.8
                );
              }
            };
          };
        } else {
          try {
            const result = await uploadFile(
              file,
              fieldName,
              fieldType,
              fileInputRefs
            );
            useDetailFormStore.setState((state) => ({
              fileUploads: {
                ...state.fileUploads,
                [fieldName]: {
                  ...state.fileUploads[fieldName],
                  uploadStatus: "success",
                  fileError: null,
                },
              },
              formValues: {
                ...state.formValues,
                [fieldName]: {
                  value: result.url,
                  is_default: state.formValues[fieldName]?.is_default || false,
                },
              },
            }));
          } catch (error) {
            console.log("error", error);
            useDetailFormStore.setState((state) => ({
              fileUploads: {
                ...state.fileUploads,
                [fieldName]: {
                  ...state.fileUploads[fieldName],
                  uploadStatus: "error",
                  fileError: "Upload failed",
                },
              },
            }));
          }
        }
      } else {
        try {
          const result = await uploadFile(
            file,
            fieldName,
            fieldType,
            fileInputRefs
          );
          // Update store with success state and URL
          useDetailFormStore.setState((state) => ({
            fileUploads: {
              ...state.fileUploads,
              [fieldName]: {
                ...state.fileUploads[fieldName],
                uploadStatus: "success",
                fileError: null,
              },
            },
            formValues: {
              ...state.formValues,
              [fieldName]: {
                value: result.url,
                is_default: state.formValues[fieldName]?.is_default || false,
              },
            },
          }));
        } catch (error) {
          console.log("error", error);
          useDetailFormStore.setState((state) => ({
            fileUploads: {
              ...state.fileUploads,
              [fieldName]: {
                ...state.fileUploads[fieldName],
                uploadStatus: "error",
                fileError: "Upload failed",
              },
            },
          }));
        }
      }
    } catch (error) {
      console.log("error",error);
      useDetailFormStore.setState((state) => ({
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
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      {fileError && (
        <Alert variant="destructive" className="mb-2 flex items-center">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <AlertDescription className="">{fileError}</AlertDescription>
          </div>
        </Alert>
      )}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200",
          preview
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50",
          uploadStatus === "uploading" && "border-yellow-500 bg-yellow-50",
          uploadStatus === "success" && "border-green-500 bg-green-50",
          uploadStatus === "error" && "border-red-500 bg-red-50"
        )}
      >
        {!fileError && preview ? (
          <div className="relative">
            <div className="mb-2">
              <p className="text-xs text-gray-500">{`Upload Status: ${
                uploadStatus.charAt(0).toUpperCase() + uploadStatus.slice(1)
              }`}</p>
              {uploadStatus === "uploading" && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            {fieldType === "Image" ? (
              <Image
                src={preview}
                alt="Document preview"
                width={200}
                height={200}
                priority={true}
                className="max-h-48 mx-auto rounded-md object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <FileText className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium">
                  {fileUploads[label]?.file?.name || "Uploaded File"}
                </p>
              </div>
            )}
            <button
              onClick={onRemove}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-2"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept={
                fieldType === "Image" ? ".jpg,.jpeg,.png" : ".pdf,.doc,.docx"
              }
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
              id={`file-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
            />
            <label
              htmlFor={`file-upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="cursor-pointer flex flex-col items-center"
            >
              {fieldType === "Image" ? (
                <ImagePlus className="h-12 w-12 text-gray-400 mb-2" />
              ) : (
                <File className="h-12 w-12 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : uploadStatus === "success"
                    ? "Upload Successful"
                    : uploadStatus === "error"
                      ? "Upload Failed, Try Again"
                      : `Drag and drop or click to upload ${label.toLowerCase()}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {fieldType === "Image"
                  ? "Supports JPG, JPEG, PNG (Max 10MB)"
                  : "Supports PDF, DOC, DOCX (Max 10MB)"}
              </p>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  const renderField = (attribute: CheckinAttribute) => {
    const { name, field_type, is_required, help_text, context, is_default } =
      attribute;
    const fieldKey = `${name}-${field_type}`;

    switch (field_type) {
      case "Text":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
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
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
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
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
            <Input
              type="email"
              value={formValues[name]?.value || ""}
              onChange={(e) =>
                handleValueChange(name, e.target.value, is_default)
              }
              placeholder="example@domain.com"
            />
          </div>
        );

      case "Phone":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
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
                  className: "flex-1 px-3 py-2 bg-gray-200 rounded",
                }}
                inputComponent={
                  Input as React.ComponentType<
                    React.InputHTMLAttributes<HTMLInputElement>
                  >
                }
                required={is_required}
              />
            </div>
            {!phoneNumberValidity[name] && (
              <span className="text-red-500 text-sm">
                Please enter a valid phone number.
              </span>
            )}
          </div>
        );

      case "Number":
      case "Amount":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
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
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
            <DatePopover
              open={datePickerStates[name]}
              onOpenChange={(isOpen) => toggleDatePicker(name, isOpen)}
            >
              <DatePopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 opacity-50" />
                    {formValues[name]?.value ? (
                      format(new Date(formValues[name].value), "PPP")
                    ) : (
                      <span className="text-gray-500">Select date...</span>
                    )}
                  </div>
                </Button>
              </DatePopoverTrigger>
              <DatePopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={
                    formValues[name]?.value
                      ? new Date(formValues[name].value)
                      : undefined
                  }
                  onSelect={(date) => {
                    handleValueChange(name, date, is_default);
                    toggleDatePicker(name, false);
                  }}
                  initialFocus
                />
              </DatePopoverContent>
            </DatePopover>
          </div>
        );

      case "Time":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
            <div className="relative">
              <Input
                type="time"
                value={formValues[name]?.value || ""}
                onChange={(e) =>
                  handleValueChange(name, e.target.value, is_default)
                }
              />
              <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
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
            {is_default && (
              <span className="text-xs text-blue-500">(default)</span>
            )}
            <FileUploadBox
              preview={fileUploads[name]?.preview || null}
              onFileChange={(file) =>
                compressAndUploadFile(file, name, field_type)
              }
              onRemove={() => removeFile(name)}
              label={label}
              inputRef={(el) => (fileInputRefs.current[name] = el)}
              uploadStatus={fileUploads[name]?.uploadStatus || "idle"}
              fileError={fileUploads[name]?.fileError || null}
              isRequired={is_required}
              fieldType={field_type}
            />
          </div>
        );

      case "URL":
        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
            <div className="relative">
              <Input
                type="url"
                value={formValues[name]?.value || ""}
                onChange={(e) =>
                  handleValueChange(name, e.target.value, is_default)
                }
                placeholder="https://example.com"
              />
              <Link className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
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
            <Label htmlFor={name} className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </Label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
          </div>
        );

      case "Country":
        const countryList = Object.values(countries).map((c) => ({
          value: c.name.common,
          label: c.name.common,
          key: c.cca3,
          region: c.region,
        }));

        return (
          <div key={fieldKey} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
            <Popover
              open={isCountryDropdownOpen}
              onOpenChange={setIsCountryDropdownOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedCountry || "Select Country..."}
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
                            handleValueChange(name, c.value, is_default);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry === c.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {c.label}({c.region})
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
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
            <Popover
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
              <label className="text-sm font-semibold">
                {name} {is_required && <span className="text-red-500">*</span>}
                {is_default && (
                  <span className="text-green-500">(Default)</span>
                )}
              </label>
              {help_text && (
                <p className="text-xs text-gray-500">{help_text}</p>
              )}
              <Popover
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

        const options = context?.options || {};
        const optionList = Object.keys(options).map((key) => ({
          value: key,
          label: options[key],
        }));

        return (
          <div key={name} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
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
                  {formValues[name]?.value || `Select ${name}...`}
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
                      {optionList.map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            handleValueChange(name, option.label, is_default);
                            toggleDropdown(name, false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formValues[name]?.value === option.label
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
        console.log("multiOptionList", multiOptionList);

        return (
          <div key={name} className="flex flex-col space-y-2">
            <label className="text-sm font-semibold">
              {name} {is_required && <span className="text-red-500">*</span>}
              {is_default && <span className="text-green-500">(Default)</span>}
            </label>
            {help_text && <p className="text-xs text-gray-500">{help_text}</p>}
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
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-gray-300"
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
                    className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => {
                        const newValues = formValues[name].value.filter(
                          (v: string) => v !== value
                        );
                        handleValueChange(name, newValues, is_default);
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const sortedAttributes = [...documentAttributes].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="w-full px-6 mx-auto space-y-6">
      <DocumentValidation
        documentAttributes={documentAttributes}
        formValues={Object.fromEntries(
          Object.entries(formValues).map(([k, v]) => [k, v.value])
        )}
        fileUploads={fileUploads}
        phoneNumberValidity={phoneNumberValidity}
        onValidationChange={onValidationChange}
      />
      {sortedAttributes.map(renderField)}
    </div>
  );
};

export default DynamicDetailUploadForm;
