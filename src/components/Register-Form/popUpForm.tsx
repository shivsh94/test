import { useMutation } from "@tanstack/react-query"; 
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userInfo } from "@/lib/userApi";
import { useSlugStore } from "@/store/useProjectStore";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
});

interface PopUpFormProps {
  open: boolean;
  onClose: () => void;
}

export default function PopUpForm({ open, onClose }: PopUpFormProps) {
  const { data: slugData } = useSlugStore();
  // const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: { name: string; contact: string }) => {
      if (!slugData?.id || !slugData?.company_id) {
        throw new Error("Project ID or Company ID not available");
      }
      return userInfo(slugData.id, slugData.company_id, data.name, data.contact);
    },
    onSuccess: (response) => {
      // Save the response to local storage
      try {
        localStorage.setItem('formSubmissionResponse', JSON.stringify(response));
      } catch (err) {
        console.error("Failed to save to local storage:", err);
      }
      
      // setIsSubmitted(true);
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
    },
  });
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const formValues = watch();
  const isFormComplete = formValues.name && formValues.contact;

  const handleFormSubmit = (data: { name: string; contact: string }) => {
    mutate(data);
  };

  return (
    <Drawer 
      open={open} 
      onOpenChange={(open) => {
        if (!open && isFormComplete) {
          onClose();
        }
      }}
    >
      <DrawerContent className="max-w-sm mx-auto">
        <DrawerHeader>
          <DrawerTitle>Contact Information</DrawerTitle>
          <DrawerDescription>
            Please provide your name and contact details.
          </DrawerDescription>
        </DrawerHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-4 space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error.message}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Name"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              placeholder="Phone number"
              {...register("contact")}
              className={errors.contact ? "border-red-500" : ""}
            />
            {errors.contact && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contact.message as string}
              </p>
            )}
          </div>
          
          <DrawerFooter className="px-0 pb-5 pt-4 gap-2">
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}