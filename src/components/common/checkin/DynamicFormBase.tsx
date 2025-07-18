// import React, { useEffect, useMemo, useRef } from "react";

// import { uploadFile } from "@/lib/uploadFile";
// import useCheckinStore, { CheckinAttribute } from "@/store/useCheck-inStore";
// import { getLocalStorageItem } from "@/utils/storageUtils";

// import DocumentValidation from "../../check-in/DocumentValidation";
// import { FormFieldRenderer } from "./FormFieldRenderer";
// import { compressImage, validateFile } from "./sharedFormUtils";

// interface DynamicFormBaseProps {
//   onValidationChange: (isValid: boolean) => void;
//   screenType: "Detail" | "Document";
//   useFormStore: () => any;
//   onSignatureChange?: (fieldName: string, dataUrl: string) => void;
// }

// const DynamicFormBase: React.FC<DynamicFormBaseProps> = ({
//   onValidationChange,
//   screenType,
//   useFormStore,
//   onSignatureChange,
// }) => {
//   const { checkinAttributes } = useCheckinStore();
//   const guest = getLocalStorageItem("guestData");

//   const documentAttributes = React.useMemo(() => {
//     const allAttributes = checkinAttributes.filter(
//       (attr) => attr.show_on_screen === screenType
//     );

//     return allAttributes.filter((attr) => {
//       if (!guest?.mainGuest) {
//         return attr.show_on_main_guest_form;
//       } else {
//         return attr.show_on_extra_guest_form;
//       }
//     });
//   }, [checkinAttributes, guest, screenType]);

//   const formStore = useFormStore(); // Get the store instance at component level
//   const {
//     formValues,
//     fileUploads,
//     phoneNumberValidity,
//     dropdownStates,
//     datePickerStates,
//     selectedCountry,
//     selectedRegion,
//     isCountryDropdownOpen,
//     isRegionDropdownOpen,
//     initializeForm,
//     handleValueChange,
//     handlePhoneNumberChange,
//     removeFile,
//     toggleDropdown,
//     toggleDatePicker,
//     setSelectedCountry,
//     setSelectedRegion,
//     setIsCountryDropdownOpen,
//     setIsRegionDropdownOpen,
//   } = formStore;

//   const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

//   useEffect(() => {
//     if (documentAttributes.length > 0 && Object.keys(formValues).length === 0) {
//       initializeForm(documentAttributes);
//     }
//   }, [documentAttributes, initializeForm, formValues]);

//   const sortedAttributes = useMemo(() => {
//     return [...documentAttributes].sort((a, b) => a.position - b.position);
//   }, [documentAttributes]);

//   const groupedAttributes = useMemo(() => {
//     const groups: Record<string, CheckinAttribute[]> = {};
//     sortedAttributes.forEach((attr) => {
//       if (!groups[attr.section]) {
//         groups[attr.section] = [];
//       }
//       groups[attr.section].push(attr);
//     });
//     return groups;
//   }, [sortedAttributes]);

//   const sectionOrder = useMemo(() => {
//     const order: string[] = [];
//     sortedAttributes.forEach((attr) => {
//       if (!order.includes(attr.section)) {
//         order.push(attr.section);
//       }
//     });
//     return order;
//   }, [sortedAttributes]);

//   // Helper function to convert file input to File object
//   const convertToFile = (
//     file: File | ArrayBuffer,
//     fieldName: string,
//     mimeType?: string
//   ): File | null => {
//     if (file instanceof File) {
//       return file;
//     }

//     if (file instanceof ArrayBuffer && mimeType) {
//       return new File([file], fieldName, { type: mimeType });
//     }

//     return null;
//   };

//   const getValidationErrorMessage = (
//     file: File,
//     fieldType: "Image" | "File"
//   ): string => {
//     if (fieldType === "Image") {
//       return !["image/jpeg", "image/png", "image/jpg"].includes(file.type)
//         ? "Invalid Image Format (Only JPG, JPEG, PNG allowed)"
//         : "Image Size Limit Exceeded (Max 10MB)";
//     }

//     return !["application/pdf", "application/msword"].includes(file.type)
//       ? "Invalid File Format (Only PDF, DOC, DOCX allowed)"
//       : "File Size Limit Exceeded (Max 10MB)";
//   };

//   const updateFileUploadState = (fieldName: string, updates: any) => {
//     formStore.setState((state: any) => ({
//       fileUploads: {
//         ...state.fileUploads,
//         [fieldName]: {
//           ...state.fileUploads[fieldName],
//           ...updates,
//         },
//       },
//     }));
//   };

//   const updateFormValueAfterUpload = (fieldName: string, url: string) => {
//     formStore.setState((state: any) => ({
//       fileUploads: {
//         ...state.fileUploads,
//         [fieldName]: {
//           ...state.fileUploads[fieldName],
//           uploadStatus: "success",
//           fileError: null,
//         },
//       },
//       formValues: {
//         ...state.formValues,
//         [fieldName]: {
//           value: url,
//           is_default: state.formValues[fieldName]?.is_default || false,
//         },
//       },
//     }));
//   };
//   const handleImageUpload = async (file: File, fieldName: string) => {
//     const MAX_SIZE_MB = 1;
//     const fileSizeMB = file.size / (1024 * 1024);

//     const fileToUpload =
//       fileSizeMB > MAX_SIZE_MB ? await compressImage(file) : file;
//     const result = await uploadFile(
//       fileToUpload,
//       fieldName,
//       "Image",
//       fileInputRefs
//     );

//     updateFormValueAfterUpload(fieldName, result.url);
//   };

//   const handleFileUpload = async (file: File, fieldName: string) => {
//     const result = await uploadFile(file, fieldName, "File", fileInputRefs);
//     updateFormValueAfterUpload(fieldName, result.url);
//   };

//   const processUploadByType = async (
//     file: File,
//     fieldName: string,
//     fieldType: "Image" | "File"
//   ) => {
//     const uploadHandler =
//       fieldType === "Image" ? handleImageUpload : handleFileUpload;
//     await uploadHandler(file, fieldName);
//   };

//   const compressAndUploadFile = async (
//     file: File | ArrayBuffer,
//     fieldName: string,
//     fieldType: "Image" | "File",
//     mimeType?: string
//   ) => {
//     const actualFile = convertToFile(file, fieldName, mimeType);

//     if (!actualFile) {
//       updateFileUploadState(fieldName, {
//         uploadStatus: "error",
//         fileError: "Invalid file data.",
//       });
//       return;
//     }

//     if (!validateFile(actualFile, fieldType)) {
//       const errorMessage = getValidationErrorMessage(actualFile, fieldType);
//       updateFileUploadState(fieldName, {
//         uploadStatus: "error",
//         fileError: errorMessage,
//       });
//       return;
//     }

//     try {
//       const previewUrl = URL.createObjectURL(actualFile);

//       updateFileUploadState(fieldName, {
//         preview: previewUrl,
//         uploadStatus: "uploading",
//         fileError: null,
//         file: actualFile,
//       });

//       await processUploadByType(actualFile, fieldName, fieldType);
//     } catch (error) {
//       console.error("Upload error:", error);
//       updateFileUploadState(fieldName, {
//         uploadStatus: "error",
//         fileError: "Upload failed. Please try again.",
//       });
//     }
//   };

//   return (
//     <div className="w-full px-6 mx-auto space-y-6 pb-24">
//       <DocumentValidation
//         documentAttributes={documentAttributes}
//         formValues={Object.fromEntries(
//           Object.entries(formValues).map(([k, v]) => [
//             k,
//             (v as { value: any }).value,
//           ])
//         )}
//         fileUploads={fileUploads}
//         phoneNumberValidity={phoneNumberValidity}
//         onValidationChange={onValidationChange}
//       />

//       {sectionOrder.map((section) => (
//         <React.Fragment key={section}>
//           {groupedAttributes[section]?.length > 0 && (
//             <h3 className="text-lg font-medium">{section}</h3>
//           )}
//           <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//             {groupedAttributes[section]?.map((attribute) => (
//               <FormFieldRenderer
//                 key={`${attribute.name}-${attribute.field_type}`}
//                 attribute={attribute}
//                 formValues={formValues}
//                 fileUploads={fileUploads}
//                 phoneNumberValidity={phoneNumberValidity}
//                 dropdownStates={dropdownStates}
//                 datePickerStates={datePickerStates}
//                 selectedCountry={selectedCountry}
//                 selectedRegion={selectedRegion}
//                 isCountryDropdownOpen={isCountryDropdownOpen}
//                 isRegionDropdownOpen={isRegionDropdownOpen}
//                 handleValueChange={handleValueChange}
//                 handlePhoneNumberChange={handlePhoneNumberChange}
//                 removeFile={removeFile}
//                 toggleDropdown={toggleDropdown}
//                 toggleDatePicker={toggleDatePicker}
//                 setSelectedCountry={setSelectedCountry}
//                 setSelectedRegion={setSelectedRegion}
//                 setIsCountryDropdownOpen={setIsCountryDropdownOpen}
//                 setIsRegionDropdownOpen={setIsRegionDropdownOpen}
//                 fileInputRefs={fileInputRefs}
//                 compressAndUploadFile={compressAndUploadFile}
//                 onSignatureChange={onSignatureChange}
//               />
//             ))}
//           </div>
//         </React.Fragment>
//       ))}
//     </div>
//   );
// };

// export default DynamicFormBase;
