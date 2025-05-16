"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item } from "@/store/useUpsellStore";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { getUpsellItemDetails } from "@/lib/upsellApis";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";

interface ActivityDialogProps {
  activity: Item | null;
  onClose: () => void;
  onBookNow: (bookingDetails: {
    activity: string;
    persons: number;
    date: string;
    slot: string;
    selectedSubItem?: string;
    selectedSubItemPrice?: number;
    formValues?: Record<string, any>;
  }) => void;
  entityId: string;
}

type FieldType =
  | "Text"
  | "Phone"
  | "Number"
  | "Amount"
  | "Date"
  | "Time"
  | "URL"
  | "Checkbox"
  | "Country"
  | "Dropdown"
  | "Multi Select Dropdown";

interface FormField {
  name: string;
  field_type: FieldType;
  label: string;
  placeholder?: string;
  max_length?: number;
  mandatory: boolean;
  options?: string[];
  price_vary?: boolean;
  factor?: number;
}

interface Timing {
  start: string;
  end: string;
  slot?: string;
}

interface Days {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

interface Context {
  timings?: Timing[];
  days?: Days;
  fields?: FormField[];
}

interface Tax {
  id: string;
  tax_type_id: string;
  tax_type_order: number;
}

interface SubItem {
  id: string;
  name: string;
  price: string;
  weekend_price: string;
  holiday_price: string;
  discount: string;
  position: number;
}

interface ItemDetails {
  name: string;
  category_id: string;
  description: string;
  is_multiple: boolean;
  is_open: boolean;
  is_tax_inclusive: boolean;
  price: string;
  weekend_price: string;
  holiday_price: string;
  discount: string;
  position: number;
  cover?: string;
  photos?: string[];
  labels?: string[];
  submit_button_text?: string;
  submit_button_url?: string;
  context?: Context;
  id: string;
  taxes?: Tax[];
  sub_items?: SubItem[];
}

export function ActivityDialog({
  activity,
  onClose,
  onBookNow,
  entityId,
}: ActivityDialogProps) {
  const [numPersons, setNumPersons] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const {
    data: itemDetails,
    isLoading,
    isError,
  } = useQuery<ItemDetails | null>({
    queryKey: ["upsellItemDetails", entityId, activity?.id],
    queryFn: () => {
      if (!activity || !activity.id) {
        return Promise.resolve(null);
      }
      return getUpsellItemDetails(entityId, activity.id);
    },
    enabled: !!activity,
    staleTime: 1000 * 60 * 5,
  });

  const hasSubItems = itemDetails?.sub_items && itemDetails.sub_items.length > 0;
  const isMultipleSelection = itemDetails?.is_multiple;
  const formFields = itemDetails?.context?.fields || [];

  const incrementPersons = () => setNumPersons((prev) => prev + 1);
  const decrementPersons = () =>
    setNumPersons((prev) => (prev > 1 ? prev - 1 : 1));

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleBookNow = () => {
    if (!activity || !itemDetails) return;

    // Get selected sub-item details if exists
    let subItemPrice = null;
    if (selectedSubItem && hasSubItems) {
      const subItem = itemDetails.sub_items?.find(
        (item) => item.id === selectedSubItem
      );
      subItemPrice = subItem ? parseFloat(subItem.price) : null;
    }

    onBookNow({
      activity: activity.name,
      persons: numPersons,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      slot: selectedSlot,
      ...(selectedSubItem && { selectedSubItem }),
      ...(subItemPrice !== null && { selectedSubItemPrice: subItemPrice }),
      formValues,
    });

    // Reset form
    setNumPersons(1);
    setSelectedDate(undefined);
    setSelectedSlot("");
    setSelectedSubItem(null);
    setFormValues({});
  };

  const renderFormField = (field: FormField) => {
    switch (field.field_type) {
      case "Text":
      case "Phone":
      case "URL":
        return (
          <div className="mb-4">
            <Label htmlFor={field.name}>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={
                field.field_type === "Phone"
                  ? "tel"
                  : field.field_type === "URL"
                    ? "url"
                    : "text"
              }
              placeholder={field.placeholder}
              maxLength={field.max_length}
              value={formValues[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.mandatory}
            />
          </div>
        );
      case "Number":
      case "Amount":
        return (
          <div className="mb-4">
            <Label htmlFor={field.name}>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder}
              value={formValues[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.mandatory}
            />
          </div>
        );
      case "Date":
        return (
          <div className="mb-4">
            <Label>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formValues[field.name] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formValues[field.name] ? (
                    format(new Date(formValues[field.name]), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formValues[field.name]
                      ? new Date(formValues[field.name])
                      : undefined
                  }
                  onSelect={(date) =>
                    handleFieldChange(field.name, date?.toISOString())
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      case "Time":
        return (
          <div className="mb-4">
            <Label>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type="time"
              value={formValues[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );
      case "Checkbox":
        return (
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!formValues[field.name]}
              onCheckedChange={(checked) =>
                handleFieldChange(field.name, checked)
              }
              required={field.mandatory}
            />
            <Label htmlFor={field.name}>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );
      case "Dropdown":
      case "Country":
        return (
          <div className="mb-4">
            <Label htmlFor={field.name}>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formValues[field.name] || ""}
              onValueChange={(value) => handleFieldChange(field.name, value)}
              required={field.mandatory}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={field.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "Multi Select Dropdown":
        return (
          <div className="mb-4">
            <Label htmlFor={field.name}>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formValues[field.name] || []}
              onValueChange={(value) => {
                const currentValues = formValues[field.name] || [];
                const newValues = currentValues.includes(value)
                  ? currentValues.filter((v: string) => v !== value)
                  : [...currentValues, value];
                handleFieldChange(field.name, newValues);
              }}
             
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={field.placeholder || "Select options"}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return (
          <div className="mb-4">
            <Label htmlFor={field.name}>
              {field.label}
              {field.mandatory && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={formValues[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.mandatory}
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Dialog open={!!activity} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto">
          <Skeleton className="h-48 w-full rounded-t-md" />
          <div className="px-4 space-y-4 pb-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={!!activity} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto">
          <div className="p-4 text-red-500">Error loading activity details</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Get first image (cover or first photo)
  const mainImage =
    itemDetails?.cover || (itemDetails?.photos && itemDetails.photos[0]);

  // Calculate price based on selected sub-item or main item
  const getCurrentPrice = (): number => {
    if (selectedSubItem && hasSubItems && itemDetails.sub_items) {
      const subItem = itemDetails.sub_items.find(
        (item) => item.id === selectedSubItem
      );
      return subItem ? parseFloat(subItem.price) : 0;
    }
    return parseFloat(itemDetails?.price || "0");
  };

  const getCurrentDiscount = (): number => {
    if (selectedSubItem && hasSubItems && itemDetails.sub_items) {
      const subItem = itemDetails.sub_items.find(
        (item) => item.id === selectedSubItem
      );
      return subItem ? parseFloat(subItem.discount || "0") : 0;
    }
    return parseFloat(itemDetails?.discount || "0");
  };

  const currentPrice = getCurrentPrice();
  const currentDiscount = getCurrentDiscount();

  // Get slots from context if available, otherwise use empty array
  const slots =
    itemDetails?.context?.timings?.map((timing) => `${timing.start} - ${timing.end}`) || [];

  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto">
        <div className="space-y-4">
          {mainImage && (
            <Image
              src={mainImage}
              alt={itemDetails?.name || "Activity image"}
              width={500}
              height={300}
              priority={true}
              className="w-full h-48 object-cover rounded-t-md"
            />
          )}

          <div className="px-4 space-y-4 pb-4">
            
              <DialogTitle className="text-start text-xl">
                {itemDetails?.name || activity?.name}
              </DialogTitle>
            

            <div className="text-lg font-bold">
              {currentDiscount > 0 && (
                <span className="text-sm line-through text-muted-foreground mr-2">
                  ${currentPrice.toFixed(2)}
                </span>
              )}
              $
              {(currentPrice - (currentPrice * currentDiscount) / 100).toFixed(
                2
              )}
              {currentDiscount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {currentDiscount}% OFF
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {itemDetails?.description || "No description available"}
            </p>

            {/* Sub-items selection */}
            {hasSubItems && itemDetails.sub_items && (
              <div className="mb-4">
                <Label className="block mb-2">
                  {isMultipleSelection ? "Select Options" : "Select Option"}
                </Label>
                <div className="space-y-2">
                  {itemDetails.sub_items.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedSubItem === subItem.id
                          ? "border-primary bg-primary/10"
                          : "border-input hover:bg-accent"
                      }`}
                      onClick={() => setSelectedSubItem(subItem.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subItem.name}</span>
                        <span className="font-bold">
                          ${parseFloat(subItem.price).toFixed(2)}
                          {subItem.discount &&
                            parseFloat(subItem.discount) > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {subItem.discount}% off
                              </Badge>
                            )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Form Fields */}
            {formFields.map((field) => (
              <div key={field.name}>{renderFormField(field)}</div>
            ))}

            {/* Number of Persons */}
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Number of Persons</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementPersons}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center">{numPersons}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementPersons}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Date Picker */}
            <div className="mb-4">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Slot Selection - only show if slots exist */}
            {slots.length > 0 && (
              <div className="mb-4">
                <Label>Select Slot</Label>
                <Select
                  value={selectedSlot}
                  onValueChange={setSelectedSlot}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((slot, index) => (
                      <SelectItem key={index} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Book Now Button */}
            <Button
              onClick={handleBookNow}
              className="w-full"
              disabled={hasSubItems && !selectedSubItem}
            >
              {itemDetails?.submit_button_text || "Book Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}