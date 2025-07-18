// import { format } from "date-fns";
// import {
//   Check,
//   CheckCircle,
//   ChevronsUpDown,
//   Clock,
//   Link as LinkIcon,
//   X,
// } from "lucide-react";
// import React from "react";
// import PhoneInput from "react-phone-number-input";
// import countries from "world-countries";

// import SignatureComponent from "@/components/check-in/Signature";
// import InfoTooltip from "@/components/InfoToolTip";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandItem,
//   CommandList,
//   CommandInput,
// } from "@/components/ui/command";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { CheckinAttribute } from "@/store/useCheck-inStore";

// import { FileUploadBox } from "./FileUploadBox";
// import { getDocumentTypes } from "./sharedFormUtils";

// interface FormFieldRendererProps {
//   attribute: CheckinAttribute;
//   formValues: Record<string, any>;
//   fileUploads: Record<string, any>;
//   phoneNumberValidity: Record<string, boolean>;
//   dropdownStates: Record<string, boolean>;
//   datePickerStates: Record<string, boolean>;
//   selectedCountry: string;
//   selectedRegion: string;
//   isCountryDropdownOpen: boolean;
//   isRegionDropdownOpen: boolean;
//   handleValueChange: (name: string, value: any, isDefault?: boolean) => void;
//   handlePhoneNumberChange: (name: string, value: string) => void;
//   removeFile: (name: string) => void;
//   toggleDropdown: (name: string, isOpen: boolean) => void;
//   toggleDatePicker: (name: string, isOpen: boolean) => void;
//   setSelectedCountry: (value: string) => void;
//   setSelectedRegion: (value: string) => void;
//   setIsCountryDropdownOpen: (isOpen: boolean) => void;
//   setIsRegionDropdownOpen: (isOpen: boolean) => void;
//   fileInputRefs: React.RefObject<Record<string, HTMLInputElement | null>>;
//   compressAndUploadFile: (
//     file: File | ArrayBuffer,
//     fieldName: string,
//     fieldType: "Image" | "File",
//     mimeType?: string
//   ) => Promise<void>;
//   onSignatureChange?: (fieldName: string, dataUrl: string) => void;
// }

// interface FieldRendererHelpers {
//   name: string;
//   fieldLabel: string;
//   value: any;
//   isRequired: boolean;
//   helpText?: string;
//   handleChange: (value: any) => void;
// }

// const renderLabel = ({
//   fieldLabel,
//   isRequired,
//   helpText,
// }: FieldRendererHelpers) => (
//   <Label className="font-semibold">
//     {fieldLabel} {isRequired && <span className="text-destructive">*</span>}
//     {helpText && <InfoTooltip helpText={helpText} />}
//   </Label>
// );

// const renderInputField = (
//   props: FieldRendererHelpers,
//   type = "text",
//   placeholder?: string,
//   additionalProps?: React.InputHTMLAttributes<HTMLInputElement>
// ) => (
//   <div className="flex flex-col space-y-2">
//     {renderLabel(props)}
//     <Input
//       type={type}
//       value={props.value ?? ""}
//       onChange={(e) => props.handleChange(e.target.value)}
//       placeholder={placeholder ?? `Enter ${props.name.toLowerCase()}`}
//       {...additionalProps}
//     />
//   </div>
// );

// const renderTextareaField = (props: FieldRendererHelpers) => (
//   <div className="flex flex-col space-y-2">
//     {renderLabel(props)}
//     <Textarea
//       value={props.value ?? ""}
//       onChange={(e) => props.handleChange(e.target.value)}
//       placeholder={`Enter ${props.name.toLowerCase()}`}
//       rows={4}
//     />
//   </div>
// );

// interface PhoneFieldProps extends FieldRendererHelpers {
//   selectedCountry: string;
//   setSelectedCountry: (value: string) => void;
//   isValid: boolean;
// }

// const renderPhoneField = ({
//   selectedCountry,
//   setSelectedCountry,
//   isValid,
//   ...props
// }: PhoneFieldProps) => (
//   <div className="flex flex-col space-y-2">
//     {renderLabel(props)}
//     <div className="react-phone-input-container">
//       <PhoneInput
//         placeholder="Enter phone number"
//         value={props.value ?? ""}
//         onChange={(value: string | undefined) =>
//           props.handleChange(value ?? "")
//         }
//         defaultCountry="IN"
//         international
//         countrySelectProps={{
//           value: selectedCountry,
//           onChange: (value: string | undefined) =>
//             setSelectedCountry(value ?? "India"),
//           className: "flex-1 px-3 py-2 bg-secondary rounded",
//         }}
//         inputComponent={
//           Input as React.ComponentType<
//             React.InputHTMLAttributes<HTMLInputElement>
//           >
//         }
//         required={props.isRequired}
//       />
//     </div>
//     {!isValid && (
//       <span className="text-destructive text-sm">
//         Please enter a valid phone number.
//       </span>
//     )}
//   </div>
// );

// interface DateFieldProps extends FieldRendererHelpers {
//   isOpen: boolean;
//   toggleOpen: (isOpen: boolean) => void;
// }

// const renderDateField = ({ isOpen, toggleOpen, ...props }: DateFieldProps) => {
//   const [view, setView] = React.useState<"year" | "month" | "day">("year");
//   const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
//   const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

//   const handleYearSelect = (year: number) => {
//     setSelectedYear(year);
//     setView("month");
//   };

//   const handleMonthSelect = (month: number) => {
//     setSelectedMonth(month);
//     setView("day");
//   };

//   const handleDaySelect = (day: Date | undefined) => {
//     if (!day) return;
//     props.handleChange(day);
//     toggleOpen(false);
//     setView("year");
//     setSelectedYear(null);
//     setSelectedMonth(null);
//   };

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
//   const months = Array.from({ length: 12 }, (_, i) => i);

//   return (
//     <div className="flex flex-col space-y-2">
//       {renderLabel(props)}
//       <Popover open={isOpen} onOpenChange={toggleOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className="w-full justify-start text-left font-normal"
//           >
//             <div className="flex items-center">
//               <Calendar className="mr-2 h-4 w-4 opacity-50" />
//               {props.value ? (
//                 format(new Date(props.value), "PPP")
//               ) : (
//                 <span className="text-muted-foreground">Select date...</span>
//               )}
//             </div>
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           {view === "year" && (
//             <div className="grid grid-cols-4 gap-1 p-2 w-64">
//               {years.map((year) => (
//                 <Button
//                   key={year}
//                   variant="ghost"
//                   onClick={() => handleYearSelect(year)}
//                   className="w-full"
//                 >
//                   {year}
//                 </Button>
//               ))}
//             </div>
//           )}

//           {view === "month" && selectedYear && (
//             <div className="grid grid-cols-3 gap-1 p-2 w-48">
//               {months.map((month) => (
//                 <Button
//                   key={month}
//                   variant="ghost"
//                   onClick={() => handleMonthSelect(month)}
//                   className="w-full"
//                 >
//                   {format(new Date(selectedYear, month, 1), "MMM")}
//                 </Button>
//               ))}
//             </div>
//           )}

//           {view === "day" && selectedYear !== null && selectedMonth !== null && (
//             <Calendar
//               mode="single"
//               selected={props.value ? new Date(props.value) : undefined}
//               onSelect={handleDaySelect}
//               month={new Date(selectedYear, selectedMonth)}
//               defaultMonth={new Date(selectedYear, selectedMonth)}
//             />
//           )}
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// };

// interface DropdownFieldProps extends FieldRendererHelpers {
//   options: { value: string; label: string }[];
//   isOpen: boolean;
//   toggleOpen: (isOpen: boolean) => void;
//   placeholder?: string;
// }

// const renderDropdownField = ({
//   options,
//   isOpen,
//   toggleOpen,
//   placeholder,
//   ...props
// }: DropdownFieldProps) => (
//   <div className="flex flex-col space-y-2">
//     {renderLabel(props)}
//     <Popover open={isOpen} onOpenChange={toggleOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className="w-full justify-between">
//           {options.find((opt) => opt.value === props.value)?.label ??
//             placeholder ??
//             `Select ${props.name}...`}
//           <ChevronsUpDown className="opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         align="start"
//         className="w-[var(--radix-popover-trigger-width)] p-0"
//       >
//         <Command>
//           <CommandInput
//             placeholder={placeholder ?? `Search ${props.name.toLowerCase()}...`}
//             className="h-9"
//           />
//           <CommandList>
//             <CommandEmpty>No option found.</CommandEmpty>
//             <CommandGroup>
//               {options.map((option) => (
//                 <CommandItem
//                   key={option.value}
//                   onSelect={() => {
//                     props.handleChange(option.value);
//                     toggleOpen(false);
//                   }}
//                   className="cursor-pointer"
//                 >
//                   <Check
//                     className={cn(
//                       "mr-2 h-4 w-4",
//                       props.value === option.value ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                   {option.label}
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   </div>
// );

// export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
//   attribute,
//   formValues,
//   fileUploads,
//   phoneNumberValidity,
//   dropdownStates,
//   datePickerStates,
//   selectedCountry,
//   isCountryDropdownOpen,
//   isRegionDropdownOpen,
//   handleValueChange,
//   handlePhoneNumberChange,
//   removeFile,
//   toggleDropdown,
//   toggleDatePicker,
//   setSelectedCountry,
//   setSelectedRegion,
//   setIsCountryDropdownOpen,
//   setIsRegionDropdownOpen,
//   fileInputRefs,
//   compressAndUploadFile,
//   onSignatureChange,
// }) => {
//   const {
//     name,
//     label: fieldLabel,
//     field_type,
//     is_required,
//     help_text,
//     context,
//     is_default,
//   } = attribute;

//   const value = formValues[name]?.value;
//   const handleChange = (val: any) => handleValueChange(name, val, is_default);
//   const handleDropdownToggle = (isOpen: boolean) =>
//     toggleDropdown(name, isOpen);
//   const handleDatePickerToggle = (isOpen: boolean) =>
//     toggleDatePicker(name, isOpen);

//   const fieldProps: FieldRendererHelpers = {
//     name,
//     fieldLabel,
//     value,
//     isRequired: is_required,
//     helpText: help_text,
//     handleChange,
//   };

//   const getFileUploadLabel = () => {
//     const isFrontSide = name.toLowerCase().includes("front");
//     const isBackSide = name.toLowerCase().includes("back");
//     return isFrontSide ? "Front Side" : isBackSide ? "Back Side" : fieldLabel;
//   };

//   switch (field_type) {
//     case "Text":
//       return renderInputField(fieldProps);

//     case "Long Text":
//       return renderTextareaField(fieldProps);

//     case "Email":
//       return renderInputField({ ...fieldProps }, "email", "example@domain.com");

//     case "Phone":
//       return renderPhoneField({
//         ...fieldProps,
//         selectedCountry,
//         setSelectedCountry,
//         isValid: phoneNumberValidity[name],
//         handleChange: (val) => handlePhoneNumberChange(name, val),
//       });

//     case "Number":
//     case "Amount":
//       return renderInputField(
//         {
//           ...fieldProps,
//           handleChange: (val) => handleChange(parseFloat(val)),
//         },
//         "number",
//         undefined,
//         {
//           step: field_type === "Amount" ? "0.01" : "1",
//         }
//       );

//     case "Date":
//       return renderDateField({
//         ...fieldProps,
//         isOpen: datePickerStates[name],
//         toggleOpen: handleDatePickerToggle,
//       });

//     case "Time":
//       return (
//         <div className="flex flex-col space-y-2">
//           {renderLabel(fieldProps)}
//           <div className="relative">
//             <Input
//               type="time"
//               value={value ?? ""}
//               onChange={(e) => handleChange(e.target.value)}
//             />
//             <Clock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
//           </div>
//         </div>
//       );

//     case "Image":
//     case "File":
//       return (
//         <div key={name}>
//           <FileUploadBox
//             preview={fileUploads[name]?.preview || null}
//             onFileChange={(file) =>
//               compressAndUploadFile(file, name, field_type)
//             }
//             onRemove={() => removeFile(name)}
//             label={getFileUploadLabel()}
//             inputRef={(el) => {
//               if (fileInputRefs.current) {
//                 fileInputRefs.current[name] = el;
//               }
//             }}
//             uploadStatus={fileUploads[name]?.uploadStatus || "idle"}
//             fileError={fileUploads[name]?.fileError || null}
//             isRequired={is_required}
//             fieldType={field_type}
//             mimeType={fileUploads[name]?.mimeType}
//           />
//         </div>
//       );

//     case "URL":
//       return (
//         <div className="flex flex-col space-y-2">
//           {renderLabel(fieldProps)}
//           <div className="relative">
//             <Input
//               type="url"
//               value={value ?? ""}
//               onChange={(e) => handleChange(e.target.value)}
//               placeholder="https://example.com"
//             />
//             <LinkIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
//           </div>
//         </div>
//       );

//     case "Checkbox":
//       return (
//         <div className="flex items-center space-x-2">
//           <Switch
//             id={name}
//             checked={value || false}
//             onCheckedChange={handleChange}
//           />
//           {renderLabel(fieldProps)}
//         </div>
//       );

//     case "Country": {
//       const countryList = Object.values(countries).map((c) => ({
//         value: c.cca2,
//         label: c.name.common,
//         key: c.cca2,
//         region: c.region,
//       }));

//       return renderDropdownField({
//         ...fieldProps,
//         options: countryList,
//         isOpen: isCountryDropdownOpen,
//         toggleOpen: setIsCountryDropdownOpen,
//         placeholder: "Select Country...",
//         handleChange: (val) => {
//           const country = countryList.find((c) => c.value === val);
//           if (country) {
//             setSelectedCountry(country.label);
//             setSelectedRegion(country.region);
//           }
//           handleChange(val);
//         },
//       });
//     }

//     case "State": {
//       const regionList = Array.from(
//         new Set(countries.map((c) => c.region).filter(Boolean))
//       ).map((region: string) => ({
//         value: region,
//         label: region,
//       }));

//       return renderDropdownField({
//         ...fieldProps,
//         options: regionList,
//         isOpen: isRegionDropdownOpen,
//         toggleOpen: setIsRegionDropdownOpen,
//         placeholder: "Select State / Region...",
//         handleChange: (val) => {
//           setSelectedRegion(val);
//           handleChange(val);
//         },
//       });
//     }

//     case "Dropdown": {
//       if (name === "Document Type") {
//         const country = formValues["Document Issuing Country"]?.value || "";
//         const documentTypes = getDocumentTypes(country).map((type) => ({
//           value: type,
//           label: type,
//         }));

//         return renderDropdownField({
//           ...fieldProps,
//           options: documentTypes,
//           isOpen: dropdownStates[name],
//           toggleOpen: handleDropdownToggle,
//           placeholder: "Select Document Type...",
//         });
//       }

//       const options = context?.options ?? {};
//       const optionList = Object.keys(options).map((key) => ({
//         value: key,
//         label: options[key],
//       }));

//       return renderDropdownField({
//         ...fieldProps,
//         options: optionList,
//         isOpen: dropdownStates[name],
//         toggleOpen: handleDropdownToggle,
//       });
//     }

//     case "Multi Select Dropdown": {
//       const multiOptions = context?.options ?? {};
//       const multiOptionList = Object.keys(multiOptions).map((key) => ({
//         value: key,
//         label: multiOptions[key],
//       }));

//       return (
//         <div className="flex flex-col space-y-2">
//           {renderLabel(fieldProps)}
//           <Popover
//             open={dropdownStates[name]}
//             onOpenChange={handleDropdownToggle}
//           >
//             <PopoverTrigger asChild>
//               <Button variant="outline" className="w-full justify-between">
//                 {(value?.length || 0) > 0
//                   ? `${value.length} selected`
//                   : `Select ${name}...`}
//                 <ChevronsUpDown className="opacity-50" />
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent
//               align="start"
//               className="w-[var(--radix-popover-trigger-width)] p-0"
//             >
//               <Command>
//                 <CommandInput
//                   placeholder={`Search ${name.toLowerCase()}...`}
//                   className="h-9"
//                 />
//                 <CommandList>
//                   <CommandEmpty>No option found.</CommandEmpty>
//                   <CommandGroup>
//                     {multiOptionList.map((option) => {
//                       const isSelected = value?.includes(option.label) || false;
//                       return (
//                         <CommandItem
//                           key={option.value}
//                           onSelect={() => {
//                             const newValues = isSelected
//                               ? value.filter((v: string) => v !== option.label)
//                               : [...(value || []), option.label];
//                             handleChange(newValues);
//                           }}
//                           className="cursor-pointer"
//                         >
//                           <div className="flex items-center">
//                             <div
//                               className={cn(
//                                 "mr-2 h-4 w-4 border rounded flex items-center justify-center",
//                                 isSelected
//                                   ? "bg-primary border-primary"
//                                   : "border-border"
//                               )}
//                             >
//                               {isSelected && (
//                                 <CheckCircle className="h-3 w-3 text-white" />
//                               )}
//                             </div>
//                             {option.label}
//                           </div>
//                         </CommandItem>
//                       );
//                     })}
//                   </CommandGroup>
//                 </CommandList>
//               </Command>
//             </PopoverContent>
//           </Popover>
//           {(value?.length || 0) > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {value.map((val: string) => (
//                 <div
//                   key={val}
//                   className="flex items-center bg-secondary px-2 py-1 rounded text-sm"
//                 >
//                   {val}
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => {
//                       const newValues = value.filter((v: string) => v !== val);
//                       handleChange(newValues);
//                     }}
//                     className="ml-1 h-4 w-4"
//                   >
//                     <X className="h-3 w-3" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       );
//     }

//     case "Sign":
//       if (!onSignatureChange) return null;

//       return (
//         <div className="flex flex-col space-y-2">
//           {renderLabel(fieldProps)}
//           <SignatureComponent
//             fieldName={name}
//             defaultValue={value || ""}
//             onValidationChange={() => {}}
//             onSignatureChange={(dataUrl) => {
//               onSignatureChange(name, dataUrl);
//             }}
//           />
//         </div>
//       );

//     default:
//       return null;
//   }
// };
