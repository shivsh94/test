import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, X, ImagePlus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import countries from "world-countries";
import axios from "axios";
import Image from "next/image";

const indiaDocumentTypes = ["Aadhar Card", "Driving License", "Voter ID", "Passport"];
const otherDocumentTypes = ["Passport"];

interface DocumentUploadFormProps {
  onValidationChange: (isValid: boolean) => void;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onValidationChange }) => {
  const [country, setCountry] = useState("India");
  const [documentType, setDocumentType] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontUploadStatus, setFrontUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [backUploadStatus, setBackUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [frontFileError, setFrontFileError] = useState<string | null>(null);
  const [backFileError, setBackFileError] = useState<string | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isDocumentDropdownOpen, setIsDocumentDropdownOpen] = useState(false);
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const countryList = Object.values(countries).map((c) => ({
    value: c.name.common,
    label: c.name.common,
    key: c.cca3,
  }));

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const MAX_SIZE_MB = 10;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      return false;
    }

    return true;
  };

  const compressAndUploadImage = async (file: File, isFront: boolean) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    
    // Reset previous errors
    if (isFront) {
      setFrontFileError(null);
    } else {
      setBackFileError(null);
    }

    // Validate file
    if (!validateFile(file)) {
      const errorMessage = !allowedTypes.includes(file.type)
        ? "Invalid File Format"
        : "Size Limit Exceeded";
      
      if (isFront) {
        setFrontFileError(errorMessage);
        setFrontUploadStatus("error");
      } else {
        setBackFileError(errorMessage);
        setBackUploadStatus("error");
      }
      return;
    }

    if (isFront) {
      setFrontUploadStatus("uploading");
    } else {
      setBackUploadStatus("uploading");
    }

    const MAX_WIDTH = 600;
    const MAX_SIZE_MB = 1;
    const fileSizeMB = file.size / (1024 * 1024);

    try {
      if (fileSizeMB > MAX_SIZE_MB) {
        // Compress large files
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
              const compressedDataUrl = canvas.toDataURL("image/jpeg");
              await uploadFile(compressedDataUrl, isFront);
            }
          };
        };
      } else {
        // Use FormData to upload smaller files directly
        const formData = new FormData();
        formData.append("file", file);
        formData.append("isFront", isFront.toString());
        await fetch("/upload-endpoint", {
          method: "POST",
          body: formData,
        });
      }

      if (isFront) {
        setFrontUploadStatus("success");
        console.log("success");
      } else {
        setBackUploadStatus("success");
        console.log("success");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      if (isFront) {
        setFrontUploadStatus("error");
      } else {
        setBackUploadStatus("error");
      }
    }
  };

  const uploadFile = async (file: string | File, isFront: boolean) => {
    const formData = new FormData();
    const dateTime = Date.now();

    formData.append("file", file instanceof File ? file : file);
    formData.append("datetime", dateTime.toString());

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (isFront) {
        setFrontImage(null);
        if (frontInputRef.current) frontInputRef.current.value = "";
      } else {
        setBackImage(null);
        if (backInputRef.current) backInputRef.current.value = "";
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleImageUpload = (file: File, isFront: boolean) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isFront) {
        setFrontImage(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackImage(file);
        setBackPreview(reader.result as string);
      }
      compressAndUploadImage(file, isFront);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (isFront: boolean) => {
    if (isFront) {
      setFrontImage(null);
      setFrontPreview(null);
      setFrontUploadStatus("idle");
      setFrontFileError(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else {
      setBackImage(null);
      setBackPreview(null);
      setBackUploadStatus("idle");
      setBackFileError(null);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  const ImageUploadBox = ({
    preview,
    onFileChange,
    onRemove,
    label,
    inputRef,
    uploadStatus,
    fileError,
  }: {
    preview: string | null;
    onFileChange: (file: File) => void;
    onRemove: () => void;
    label: string;
    inputRef: React.RefObject<HTMLInputElement>;
    uploadStatus: "idle" | "uploading" | "success" | "error";
    fileError: string | null;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
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
              <p className="text-xs text-gray-500">{`Upload Status: ${uploadStatus.charAt(0).toUpperCase() + uploadStatus.slice(1)}`}</p>
            </div>
            <Image
              src={preview}
              alt="Document preview"
              width={200}
              height={200}
              priority={true}
              className="max-h-48 mx-auto rounded-md object-contain"
            />
            <button
              onClick={onRemove}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
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
              <ImagePlus className="h-12 w-12 text-gray-400 mb-2" />
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
                Supports JPG, JPEG, PNG (Max 10MB)
              </p>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    // Check if required fields are filled
    const isValid = !!documentType && !!frontImage;
    
    onValidationChange(isValid);
  }, [country, documentType, frontImage, backImage]);

  return (
    <div className="w-full px-6 mx-auto space-y-6">
      {/* Rest of the component remains the same */}
      {/* Country Dropdown */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Document Issuing Country *</label>
        <Popover open={isCountryDropdownOpen} onOpenChange={setIsCountryDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {country || "Select Country..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search country..." className="h-9" />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryList.map((c) => (
                    <CommandItem
                      key={c.key}
                      onSelect={() => {
                        setCountry(c.value);
                        setIsCountryDropdownOpen(false); // Close the dropdown
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          country === c.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Document Type Dropdown */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Document Type *</label>
        <Popover open={isDocumentDropdownOpen} onOpenChange={setIsDocumentDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {documentType || "Select Document Type..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search document type..." className="h-9" />
              <CommandList>
                <CommandEmpty>No document type found.</CommandEmpty>
                <CommandGroup>
                  {(country === "India"
                    ? indiaDocumentTypes
                    : otherDocumentTypes
                  ).map((type) => (
                    <CommandItem
                      key={type}
                      onSelect={() => {
                        setDocumentType(type);
                        setIsDocumentDropdownOpen(false); // Close the dropdown
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          documentType === type ? "opacity-100" : "opacity-0"
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

      {/* Front Image Upload */}
      <ImageUploadBox
        preview={frontPreview}
        onFileChange={(file) => handleImageUpload(file, true)}
        onRemove={() => removeImage(true)}
        label="Front Side"
        inputRef={frontInputRef}
        uploadStatus={frontUploadStatus}
        fileError={frontFileError}
      />

      {/* Back Image Upload */}
      <ImageUploadBox
        preview={backPreview}
        onFileChange={(file) => handleImageUpload(file, false)}
        onRemove={() => removeImage(false)}
        label="Back Side"
        inputRef={backInputRef}
        uploadStatus={backUploadStatus}
        fileError={backFileError}
      />

    </div>
  );
};

export default DocumentUploadForm;