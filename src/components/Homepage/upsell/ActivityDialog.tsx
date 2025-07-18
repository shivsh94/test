"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { convert } from "html-to-text";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useState } from "react";

import StripePaymentModal from "@/components/payment/StripePaymentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getStripeClientSecret,
  verifyRazorpayPayment,
  verifyStripePayment,
} from "@/lib/createOrderApi";
import { getUpsellItemDetails, useCreateUpsellOrder } from "@/lib/upsellApis";
import { cn } from "@/lib/utils";
import { useSlugStore } from "@/store/useProjectStore";
import { useReservationStore } from "@/store/useReservationStore";
import { Item } from "@/store/useUpsellStore";
import { getCaptchaToken } from "@/utils/captcha";
import { getSymbolFromCurrency } from "@/utils/currency";
import { getLocalStorageItem } from "@/utils/storageUtils";

interface ActivityDialogProps {
  activity: Item | null;
  onClose: () => void;
  onBookNow: (bookingDetails: {
    activity: string;
    persons?: number;
    date?: string;
    slot?: string;
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
  | "Email"
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
  price: string | null;
  weekend_price: string | null;
  holiday_price: string | null;
  discount: string | null;
  position: number | null;
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

// Add missing interfaces
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface StripeResponse {
  stripe_payment_intent_id: string;
}

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
    Stripe: any;
  }
}

const handleVerification = async (
  slugId: string,
  orderId: string,
  response: RazorpayResponse | StripeResponse,
  entityId: string,
  gateway: string = "razorpay"
) => {
  try {
    const token = await getCaptchaToken();
    if (!token) return;

    if (gateway === "stripe" && "stripe_payment_intent_id" in response) {
      const stripeResponse = await verifyStripePayment(
        entityId,
        orderId,
        response.stripe_payment_intent_id,
        "Upsell",
        token
      );
      return stripeResponse;
    } else if (gateway === "razorpay" && "razorpay_payment_id" in response) {
      const razorpayResponse = await verifyRazorpayPayment(
        entityId,
        orderId,
        response.razorpay_payment_id,
        response.razorpay_signature,
        "Upsell",
        response.razorpay_order_id,
        token
      );
      return razorpayResponse;
    }

    return null;
  } catch (err) {
    console.error("Verification failed:", err);
    return null;
  }
};

const getRazorpayOptions = (
  paymentData: any,
  totalAmount: number,
  slug: any,
  orderId: string,
  handleVerification: (res: any) => Promise<void>
) => {
  return {
    key: paymentData.key,
    amount: Math.round(totalAmount * 100),
    currency: paymentData.currency,
    name: slug?.company?.name ?? "Booking",
    description: paymentData.description ?? "Complete your payment",
    image: paymentData.logo ?? slug?.company?.logo ?? "",
    order_id: paymentData.order_id,
    handler: handleVerification,
    prefill: {
      name: "Guest User",
      email: "guest@example.com",
      contact: "0000000000",
    },
    notes: {
      order_id: orderId,
    },
    theme: {
      color: slug?.company?.primary_color ?? "#1e40af",
    },
    callback_url: paymentData.callback_url,
    redirect: false,
  };
};

const getPaymentThemeColor = (slug: any): string =>
  slug?.company?.primary_color ?? "#1e40af";

const getCurrentDay = (): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
};

const calculateDiscountedPrice = (
  price: string | number | null,
  discount: string | null | undefined
): number => {
  const priceNum = typeof price === "string" ? parseFloat(price) : (price ?? 0);
  const discountNum = discount ? parseFloat(discount) : 0;
  return priceNum - discountNum;
};

const getBasePrice = (item: SubItem | ItemDetails): string | number | null => {
  const currentDay = getCurrentDay();
  const isWeekend = ["sat", "sun"].includes(currentDay);
  const isHoliday = false;

  if (isHoliday && item.holiday_price) return item.holiday_price;
  if (isWeekend && item.weekend_price) return item.weekend_price;
  return item.price;
};

const getPriceInfo = (item: SubItem | ItemDetails) => {
  const basePrice = getBasePrice(item);
  const priceValue =
    typeof basePrice === "string" ? parseFloat(basePrice) : (basePrice ?? 0);
  const discountValue = item.discount ? parseFloat(item.discount) : 0;
  const discountedPrice = calculateDiscountedPrice(priceValue, item.discount);
  const hasDiscount = discountValue > 0 && discountedPrice !== priceValue;

  const currentDay = getCurrentDay();
  const isWeekend = ["sat", "sun"].includes(currentDay);
  const isHoliday = false;

  return {
    originalPrice: priceValue.toFixed(2),
    discountedPrice: discountedPrice.toFixed(2),
    hasDiscount,
    discountValue,
    isWeekendPrice: isWeekend && !!item.weekend_price,
    isHolidayPrice: isHoliday && !!item.holiday_price,
  };
};

const getInputType = (fieldType: FieldType): string => {
  const typeMap: Record<string, string> = {
    Phone: "tel",
    URL: "url",
    Email: "email",
  };
  return typeMap[fieldType] || "text";
};

export function ActivityDialog({
  activity,
  onClose,
  entityId,
}: Readonly<ActivityDialogProps>) {
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeData, setStripeData] = useState<{
    stripe: any;
    elements: any;
    orderResponse: any;
  } | null>(null);

  const { toast } = useToast();
  const slugStore = useSlugStore().data;
  const formSubmissionResponse = getLocalStorageItem("formSubmissionResponse");
  const { reservation: reservationData } = useReservationStore();

  const { mutate: createOrder, isPending: isCreatingOrder } =
    useCreateUpsellOrder();
  const primary_text_color =
    slugStore?.company?.primary_text_color || "#ffffff";

  const currencySymbol = getSymbolFromCurrency(slugStore?.currency || "INR");

  // Add Stripe payment handlers
  const handleStripePayment = async (paymentData: any, orderResponse: any) => {
    try {
      const stripe = window.Stripe(paymentData.publishable_key);

      const clientSecretResponse = await getStripeClientSecret(
        slugStore?.id ?? "",
        paymentData.payment_intent_id
      );

      if (
        !clientSecretResponse.success ||
        !clientSecretResponse.client_secret
      ) {
        showErrorToast("Failed to initialize payment");
        return;
      }

      const elements = stripe.elements({
        clientSecret: clientSecretResponse.client_secret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: getPaymentThemeColor(slugStore),
          },
        },
      });

      const paymentElement = elements.create("payment");

      setStripeData({ stripe, elements, orderResponse });
      setShowStripeModal(true);

      setTimeout(async () => {
        try {
          await paymentElement.mount("#stripe-payment-element-mount");
          console.log("Payment element mounted successfully");
        } catch (error) {
          console.error("Error mounting payment element:", error);
          showErrorToast("Failed to load payment form");
          setShowStripeModal(false);
        }
      }, 100);
    } catch (error) {
      console.error("Stripe payment error:", error);
      showErrorToast("Stripe payment initialization failed");
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!stripeData) return;

    const stripeResponse = {
      stripe_payment_intent_id: paymentIntentId,
    };

    const verification = await handleVerification(
      slugStore?.id ?? "",
      stripeData.orderResponse.id,
      stripeResponse,
      entityId,
      "stripe"
    );

    if (verification?.success) {
      toast({
        title: "Payment Success",
        description: "Your booking is confirmed! 🎉",
        duration: 2000,
      });
      setSelectedSubItem(null);
      setFormValues({});
      setShowStripeModal(false);
      setStripeData(null);
      setTimeout(onClose, 1500);
    } else {
      showErrorToast("Payment verification failed");
      setShowStripeModal(false);
      setStripeData(null);
    }
  };

  const handleStripeClose = () => {
    setShowStripeModal(false);
    setStripeData(null);
  };

  const renderPriceDisplay = (currentPriceInfo: any) => {
    if (!currentPriceInfo) return null;

    return (
      <div className="text-lg font-bold">
        {currentPriceInfo.hasDiscount && (
          <span className="text-sm line-through text-muted-foreground mr-2">
            {currencySymbol}
            {currentPriceInfo.originalPrice}
          </span>
        )}
        {currencySymbol}
        {currentPriceInfo.discountedPrice}
        {(currentPriceInfo.isWeekendPrice ||
          currentPriceInfo.isHolidayPrice) && (
          <Badge variant="outline" className="ml-2">
            {currentPriceInfo.isHolidayPrice
              ? "Holiday Price"
              : "Weekend Price"}
          </Badge>
        )}
      </div>
    );
  };

  const renderSubItemsSelection = (
    hasSubItems: boolean,
    itemDetails: ItemDetails | null,
    isMultipleSelection: boolean,
    selectedSubItem: string | null,
    setSelectedSubItem: (value: string) => void
  ) => {
    if (!hasSubItems || !itemDetails?.sub_items) return null;

    return (
      <div className="mb-4 relative">
        <Label className="block mb-2">
          {isMultipleSelection ? "Select Options" : "Select Option"}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select
          value={selectedSubItem ?? ""}
          onValueChange={setSelectedSubItem}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            sideOffset={5}
            align="start"
            className="max-h-[180px] overflow-y-auto w-[var(--radix-select-trigger-width)]"
            avoidCollisions={false}
          >
            {itemDetails.sub_items.map((subItem) => {
              const subItemPriceInfo = getPriceInfo(subItem);
              return (
                <SelectItem key={subItem.id} value={subItem.id}>
                  <div className="flex justify-between items-center">
                    <span>{subItem.name}</span>
                    <div className="flex items-center ml-2">
                      {subItemPriceInfo.hasDiscount && (
                        <span className="text-xs line-through text-muted-foreground mr-1">
                          {currencySymbol}
                          {subItemPriceInfo.originalPrice}
                        </span>
                      )}
                      <span>
                        {currencySymbol}
                        {subItemPriceInfo.discountedPrice}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  const {
    data: itemDetails,
    isLoading,
    isError,
  } = useQuery<ItemDetails | null>({
    queryKey: ["upsellItemDetails", entityId, activity?.id],
    queryFn: () => {
      if (!activity?.id) return Promise.resolve(null);
      return getUpsellItemDetails(entityId, activity.id);
    },
    enabled: !!activity,
    staleTime: 1000 * 60 * 5,
  });

  const hasSubItems = !!itemDetails?.sub_items?.length;
  const isMultipleSelection = itemDetails?.is_multiple;
  const formFields = itemDetails?.context?.fields ?? [];

  const getLowestPriceInfo = () => {
    if (!hasSubItems || !itemDetails?.sub_items) {
      return itemDetails ? getPriceInfo(itemDetails) : null;
    }

    const subItemsWithPrices = itemDetails.sub_items.map(getPriceInfo);
    return subItemsWithPrices.reduce((lowest, current) =>
      parseFloat(current.discountedPrice) < parseFloat(lowest.discountedPrice)
        ? current
        : lowest
    );
  };

  const lowestPriceInfo = getLowestPriceInfo();
  const selectedSubItemInfo =
    hasSubItems && selectedSubItem
      ? itemDetails?.sub_items?.find((item) => item.id === selectedSubItem)
      : null;

  const currentPriceInfo = selectedSubItemInfo
    ? getPriceInfo(selectedSubItemInfo)
    : lowestPriceInfo;

  const calculateTotalPrice = (): number => {
    if (!currentPriceInfo) return 0;

    let totalPrice = parseFloat(currentPriceInfo.discountedPrice);

    formFields.forEach((field) => {
      if (!field.price_vary || !formValues[field.name]) return;

      if (field.field_type === "Checkbox") {
        totalPrice += field.factor ?? 0;
      } else {
        const fieldValue = parseFloat(formValues[field.name]) ?? 0;
        const factor = field.factor ?? 1;
        totalPrice *= fieldValue * factor;
      }
    });

    return totalPrice;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const customer_id = formSubmissionResponse?.id;
  const reservation_id = reservationData?.id;

  const showErrorToast = (description: string) => {
    toast({
      title: "Validation Error",
      description,
      variant: "destructive",
      className:
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm",
      duration: 1500,
    });
  };

  const validateForm = (): boolean => {
    const mandatoryFields = formFields.filter((field) => field.mandatory);

    for (const field of mandatoryFields) {
      const value = formValues[field.name];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        showErrorToast(`${field.label} is required`);
        return false;
      }
    }

    if (hasSubItems && !selectedSubItem) {
      showErrorToast("Please select an option to continue");
      return false;
    }

    return true;
  };

  const handleBookNow = async () => {
    if (!activity || !itemDetails) return;
    if (!validateForm()) return;

    const token = await getCaptchaToken();
    if (!token) {
      showErrorToast("Captcha verification failed");
      return;
    }

    const orderDetails = {
      name: activity.name,
      customer_id: customer_id ?? "",
      reservation_id,
      location: "",
      item_id: activity.id,
      ...(selectedSubItem && { sub_item_id: selectedSubItem }),
      context: {
        details: formFields.map((field) => ({
          name: field.name,
          label: field.label,
          value: formValues[field.name] ?? "",
          price_vary: field.price_vary ?? false,
          factor: field.factor ?? 1,
        })),
      },
    };

    onClose();

    createOrder(
      {
        entity_id: entityId,
        pay_later: false,
        orderDetails,
      },
      {
        onSuccess: async (orderResponse: any) => {
          console.log("✅ orderResponse:", orderResponse);
          if (!orderResponse?.payment_data) {
            showErrorToast("Missing payment data from server");
            return;
          }

          const gateway = orderResponse.payment_data?.gateway?.toLowerCase();
          console.log("Payment gateway:", gateway);

          if (gateway === "razorpay") {
            const razorpayOptions = getRazorpayOptions(
              orderResponse.payment_data,
              calculateTotalPrice(),
              slugStore,
              orderResponse.id,
              async (response: RazorpayResponse) => {
                const verification = await handleVerification(
                  slugStore?.id ?? "",
                  orderResponse.id,
                  response,
                  entityId,
                  "razorpay"
                );

                if (verification?.success) {
                  toast({
                    title: "Payment Success",
                    description: "Your booking is confirmed! 🎉",
                    duration: 2000,
                  });
                  setSelectedSubItem(null);
                  setFormValues({});
                  setTimeout(onClose, 1500);
                } else {
                  showErrorToast("Payment verification failed");
                }
              }
            );

            const rzp = new window.Razorpay(razorpayOptions);
            rzp.open();
          } else if (gateway === "stripe") {
            await handleStripePayment(
              orderResponse.payment_data,
              orderResponse
            );
          } else {
            showErrorToast("Unknown or unsupported payment gateway");
          }
        },
        onError: (error: any) => {
          console.error("Order creation failed:", error);
          const errorMessage =
            error?.response?.data?.message ??
            error?.message ??
            "Something went wrong. Please try again.";
          showErrorToast(errorMessage);
        },
      }
    );
  };

  const renderTextInputField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.label}
        placeholder={field.placeholder}
        value={formValues[field.name] ?? ""}
        required={field.mandatory}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        type={getInputType(field.field_type)}
        maxLength={field.max_length}
      />
    </div>
  );

  const renderNumberInputField = (field: FormField) => (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={field.label}>
          {field.label}
          {field.mandatory && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              const currentValue = parseFloat(formValues[field.name] ?? 1);
              const newValue = Math.max(1, currentValue - 1);
              handleFieldChange(field.name, newValue.toString());
            }}
          >
            -
          </Button>
          <Input
            id={field.label}
            type="number"
            min="1"
            value={formValues[field.name] ?? "1"}
            className="text-center w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder=""
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.mandatory}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              const currentValue = parseFloat(formValues[field.name] ?? 1);
              handleFieldChange(field.name, (currentValue + 1).toString());
            }}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDateInputField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
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

  const renderCheckboxField = (field: FormField) => (
    <div className="mb-4 flex items-center space-x-2">
      <Checkbox
        id={field.label}
        checked={!!formValues[field.name]}
        onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
        required={field.mandatory}
      />
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
    </div>
  );

  const renderDropdownField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={formValues[field.name] ?? ""}
        onValueChange={(value) => handleFieldChange(field.name, value)}
        required={field.mandatory}
      >
        <SelectTrigger>
          <SelectValue placeholder={field.placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderAmountField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.label}
        placeholder={field.placeholder}
        value={formValues[field.name] ?? ""}
        required={field.mandatory}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        type="number"
        min="1"
      />
    </div>
  );

  const renderTimeField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={field.label}
        placeholder={field.placeholder}
        value={formValues[field.name] ?? ""}
        required={field.mandatory}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        type="time"
      />
    </div>
  );

  const renderMultiSelectField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={formValues[field.name] ?? []}
        onValueChange={(value) => {
          const currentValues = formValues[field.name] ?? [];
          const newValues = currentValues.includes(value)
            ? currentValues.filter((v: string) => v !== value)
            : [...currentValues, value];
          handleFieldChange(field.name, newValues);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={field.placeholder ?? "Select options"} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderTextAreaField = (field: FormField) => (
    <div className="mb-4">
      <Label htmlFor={field.label}>
        {field.label}
        {field.mandatory && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={field.label}
        placeholder={field.placeholder}
        value={formValues[field.name] ?? ""}
        required={field.mandatory}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
      />
    </div>
  );

  const renderFormField = (field: FormField) => {
    const fieldRenderers = {
      Text: renderTextInputField,
      Phone: renderTextInputField,
      URL: renderTextInputField,
      Email: renderTextInputField,
      Number: renderNumberInputField,
      Amount: renderAmountField,
      Date: renderDateInputField,
      Time: renderTimeField,
      Checkbox: renderCheckboxField,
      Dropdown: renderDropdownField,
      Country: renderDropdownField,
      "Multi Select Dropdown": renderMultiSelectField,
    };

    const renderer = fieldRenderers[field.field_type];
    return renderer ? renderer(field) : renderTextAreaField(field);
  };

  if (isLoading) {
    return (
      <Dialog open={!!activity} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto">
          <DialogTitle>
            <Skeleton className="h-48 w-full rounded-t-md" />
            <div className="px-4 space-y-4 pb-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={!!activity} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto">
          <DialogTitle className="text-start text-xl">
            Error loading activity details
            <div className="p-4 text-red-500">
              Error loading activity details
            </div>
          </DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  const mainImage = itemDetails?.cover ?? itemDetails?.photos?.[0];

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => console.log("Razorpay SDK loaded")}
      />
      <Script
        id="stripe-js"
        src="https://js.stripe.com/v3/"
        onLoad={() => console.log("Stripe SDK loaded")}
      />

      {/* Stripe Payment Modal */}
      {showStripeModal && stripeData && (
        <StripePaymentModal
          stripe={stripeData.stripe}
          elements={stripeData.elements}
          orderResponse={stripeData.orderResponse}
          slug={slugStore}
          onSuccess={handleStripeSuccess}
          onClose={handleStripeClose}
          themeColor={getPaymentThemeColor(slugStore)}
        />
      )}

      <Dialog open={!!activity} onOpenChange={onClose}>
        <DialogContent className="w-[90%] max-w-lg p-0 max-h-[80vh] rounded-md overflow-y-auto">
          <div className="space-y-4">
            {mainImage && (
              <Image
                src={mainImage}
                alt={itemDetails?.name ?? "Activity image"}
                width={500}
                height={300}
                priority={true}
                unoptimized
                className="w-full h-48 object-cover rounded-t-md"
              />
            )}

            <div className="px-4 space-y-4">
              <DialogTitle className="text-start text-xl">
                {itemDetails?.name ?? activity?.name}
              </DialogTitle>

              {renderPriceDisplay(currentPriceInfo)}

              <p className="text-sm text-muted-foreground break-words whitespace-pre-line max-w-md">
                {convert(itemDetails?.description ?? "") ??
                  "No description available"}
              </p>

              {renderSubItemsSelection(
                hasSubItems,
                itemDetails ?? null,
                isMultipleSelection ?? false,
                selectedSubItem,
                setSelectedSubItem
              )}

              {formFields.map((field) => (
                <div key={field.name}>{renderFormField(field)}</div>
              ))}

              <div className="sticky bottom-0 right-0 pb-4 bg-background pt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold">
                    {currencySymbol}
                    {calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleBookNow}
                  style={{
                    backgroundColor:
                      slugStore?.company?.primary_color ?? "#1e40af",
                    color: primary_text_color,
                  }}
                  className="w-full mt-3"
                  disabled={isCreatingOrder}
                >
                  {isCreatingOrder
                    ? "Processing..."
                    : (itemDetails?.submit_button_text ?? "Book Now")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
