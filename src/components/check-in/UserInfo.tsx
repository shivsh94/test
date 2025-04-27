import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"
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
import countries from "world-countries";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import "react-phone-number-input/style.css";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

const getUniqueRegions = () => {
  const regions = countries.map((c) => c.region).filter(Boolean); 
  return Array.from(new Set(regions));
};

interface DetailsFormProps {
  onValidationChange: (isValid: boolean) => void;
}

export default function DetailsForm({ onValidationChange }: DetailsFormProps) {
  const [country, setCountry] = useState("India");
  const [region, setRegion] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const countryList = Object.values(countries).map((c) => ({
    value: c.name.common,
    label: c.name.common,
    key: c.cca3,
    region: c.region,
  }));

  const regionList = getUniqueRegions();

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    contact: "",
    age: "",
    gender: "",
    address: "",
    city: "",
    country: "India",
    region: "",
  });

  useEffect(() => {
    const isValid = 
      formData.name.trim() !== "" && 
      formData.email.trim() !== "" && 
      formData.age.trim() !== "" &&
      isPhoneNumberValid && 
      (validationResult?.valid ?? true);
    
    onValidationChange(isValid);
  }, [formData, isPhoneNumberValid, validationResult, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      console.log('Form Data Updated:', newData);
      return newData;
    });

    if (name === "email") {
      handleEmailChange(value);
    }
  };

  const handleGenderSelect = (gender: string) => {
    setFormData((prevData) => ({ ...prevData, gender }));
  };

  const handlePhoneNumberChange = (value?: string) => {
    try {
      setPhoneNumber(value || "");

      // Validate the phone number using react-phone-number-input
      if (value && isValidPhoneNumber(value)) {
        setIsPhoneNumberValid(true);
      } else if (value === "") {
        setIsPhoneNumberValid(true); // Allow empty value (if user removes number)
      } else {
        setIsPhoneNumberValid(false);
      }
    } catch (error) {
      console.error("Error during phone number validation:", error);
      setIsPhoneNumberValid(false); // If there's any error, set the validation as false
    }
  };

  const handleEmailChange = async (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setValidationResult(null); // Clear previous results

    if (!value) {
      setValidationResult(null);
      return;
    }

    try {
      const response = await fetch("/api/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate email");
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error("Error validating email:", error);
      setValidationResult({ valid: false, error: "Error Verifying" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isPhoneNumberValid) {
        console.log("Phone number is valid: ", phoneNumber);
      } else {
        console.log("Invalid phone number.");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
    console.log("Form Data:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6 mx-auto w-full">
      {/* Name, Last Name, and Email fields */}
      <div className="flex flex-col space-y-2">
        <Label className="block text-sm font-semibold">Name *</Label>
        <Input
          name="name"
          type="text"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">Last Name</label>
        <Input
          name="lastName"
          type="text"
          placeholder="Enter Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">Email Address *</label>
        <Input
          name="email"
          type="email"
          placeholder="Enter Valid Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validationResult && (
          <div className={`mt-2 ${validationResult.valid ? "text-green-600" : "text-red-600"}`}>
            {validationResult.valid
              ? "Email domain is valid!"
              : `Invalid: ${validationResult.error || "Unknown error"}`}
          </div>
        )}
      </div>

      {/* Contact Field with PhoneInput */}
      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">Contact *</label>
        <PhoneInput
          placeholder="Enter phone number"
          value={formData.contact}
          onChange={(value: string | undefined) => handlePhoneNumberChange(value || "")}
          defaultCountry="IN" 
          international
          countrySelectProps={{
            value: country,
            onChange: (value: string | undefined) => setCountry(value || "India"),
            className: "flex-1 px-3 py-2 bg-gray-200 rounded",
          }}
          inputComponent={Input as React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>}
          containerClassName="flex-1"
          className=""
          required
        />
        {!isPhoneNumberValid && (
          <span className="text-red-500 text-sm">Please enter a valid phone number.</span>
        )}
      </div>

      {/* Age, Gender, Address, and City Fields */}
      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">Age *</label>
        <Input
          name="age"
          type="number"
          placeholder="Enter Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">Gender</label>
        <div className="flex space-x-2">
          {["Male", "Female", "Other"].map((gender) => (
            <Button
              key={gender}
              type="button"
              className={` ${
                formData.gender === gender
                  ? "bg-blue-500 text-white hover:bg-blue-500"
                  : "bg-gray-200 text-foreground hover:bg-blue-300 hover:text-white"
              }`}
              onClick={() => handleGenderSelect(gender)}
            >
              {gender}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">Address</label>
        <Input
          name="address"
          type="text"
          placeholder="Enter Address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="block text-sm font-semibold">City</label>
        <Input
          name="city"
          type="text"
          placeholder="Enter City"
          value={formData.city}
          onChange={handleChange}
        />
      </div>

      {/* Country and State Dropdowns */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Country *</label>
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
                        setRegion(c.region); 
                        setIsCountryDropdownOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          country === c.value ? "opacity-100" : "opacity-0"
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

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">Region</label>
        <Popover open={isRegionDropdownOpen} onOpenChange={setIsRegionDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {region || "Select State / Region..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search state / region..." className="h-9" />
              <CommandList>
                <CommandEmpty>No Region found.</CommandEmpty>
                <CommandGroup>
                  {regionList.map((s) => (
                    <CommandItem
                      key={s}
                      onSelect={() => {
                        setRegion(s);
                        setIsRegionDropdownOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          region === s ? "opacity-100" : "opacity-0"
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
    </form>
  );
}