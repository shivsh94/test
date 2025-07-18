"use client";
import {
  AlertTriangle,
  File,
  FileText,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
interface FileUploadBoxProps {
  preview: string | null; // Blob URL string for preview
  onFileChange: (file: File) => void;
  onRemove: () => void;
  label: string;
  inputRef: (el: HTMLInputElement | null) => void;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  fileError: string | null;
  isRequired: boolean;
  fieldType: "Image" | "File";
  fieldName: string;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
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
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Use the preview URL directly
  useEffect(() => {
    setImageError(false); // Reset error state when preview changes
    setImageLoaded(false); // Reset loaded state

    if (!preview) {
      setLocalPreviewUrl(null);
      return;
    }

    // Preview is always a string URL (blob URL or data URL)
    setLocalPreviewUrl(preview);
  }, [preview]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileChange(files[0]);
      e.target.value = "";
    }
  };

  const fileInputId = `file-upload-${fieldName}`;

  return (
    <div className="space-y-2">
      <Label className="font-semibold">
        {label} {isRequired && <span className="text-destructive">*</span>}
      </Label>

      {fileError && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          uploadStatus === "uploading"
            ? "border-yellow-500 bg-yellow-50"
            : uploadStatus === "success"
              ? "border-green-500 bg-green-50"
              : uploadStatus === "error"
                ? "border-red-500 bg-red-50"
                : localPreviewUrl
                  ? "border-green-500 bg-muted/50"
                  : "border-gray-300 hover:border-blue-500"
        )}
      >
        {localPreviewUrl ? (
          <div className="relative">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : uploadStatus === "success"
                    ? "Uploaded Successfully"
                    : "Ready"}
              </span>
              {uploadStatus === "uploading" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>

            {fieldType === "Image" ? (
              <div className="relative h-48 w-full">
                {!imageError ? (
                  <Image
                    src={localPreviewUrl}
                    alt="Upload preview"
                    fill
                    className="object-contain"
                    unoptimized // Important for local blob URLs
                    onLoadingComplete={() => {
                      setImageLoaded(true);
                      setImageError(false);
                    }}
                    onError={(e) => {
                      console.warn("Failed to load preview image");
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                  />
                ) : (
                  // Fallback: try with regular img tag
                  <img
                    src={localPreviewUrl}
                    alt="Upload preview"
                    className="max-h-48 w-full object-contain rounded"
                    onLoad={() => {
                      setImageLoaded(true);
                      setImageError(false);
                    }}
                    onError={() => {
                      console.warn("Fallback img also failed to load");
                      setImageLoaded(false);
                    }}
                  />
                )}

                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                    {uploadStatus === "success" && imageError ? (
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Image failed to load
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click remove to try again
                        </p>
                      </div>
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center p-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm mt-2">Uploaded document</p>
              </div>
            )}

            <Button
              variant="destructive"
              size="icon"
              onClick={onRemove}
              className="absolute top-2 right-2"
              disabled={uploadStatus === "uploading"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept={fieldType === "Image" ? "image/*" : ".pdf,.doc,.docx"}
              onChange={handleFileInputChange}
              className="hidden"
              id={fileInputId}
              disabled={uploadStatus === "uploading"}
            />
            <label
              htmlFor={fileInputId}
              className={cn(
                "cursor-pointer flex flex-col items-center justify-center min-h-[120px]",
                uploadStatus === "uploading" && "cursor-not-allowed opacity-75"
              )}
            >
              {fieldType === "Image" ? (
                <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
              ) : (
                <File className="h-12 w-12 text-muted-foreground mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : `Click to upload ${label}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {fieldType === "Image"
                  ? "Supports JPG, PNG (Max 10MB)"
                  : "Supports PDF, DOC (Max 10MB)"}
              </p>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
