import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Country {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
}

const countries: Country[] = [
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "Singapore", dial_code: "+65", code: "SG", flag: "🇸🇬" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "South Korea", dial_code: "+82", code: "KR", flag: "🇰🇷" },
  { name: "Philippines", dial_code: "+63", code: "PH", flag: "🇵🇭" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
  { name: "Russia", dial_code: "+7", code: "RU", flag: "🇷🇺" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "United Arab Emirates", dial_code: "+971", code: "AE", flag: "🇦🇪" },
  { name: "Saudi Arabia", dial_code: "+966", code: "SA", flag: "🇸🇦" },
  { name: "Turkey", dial_code: "+90", code: "TR", flag: "🇹🇷" },
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "Pakistan", dial_code: "+92", code: "PK", flag: "🇵🇰" },
];

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

// Function to detect user's country based on timezone (simple heuristic)
const detectUserCountry = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Simple timezone-based detection
    if (timezone.includes("America/New_York") || timezone.includes("America/Chicago") || 
        timezone.includes("America/Denver") || timezone.includes("America/Los_Angeles")) {
      return "+1"; // US
    }
    if (timezone.includes("Europe/London")) return "+44"; // UK
    if (timezone.includes("Asia/Kolkata")) return "+91"; // India
    if (timezone.includes("Asia/Singapore")) return "+65"; // Singapore
    if (timezone.includes("Asia/Tokyo")) return "+81"; // Japan
    if (timezone.includes("Europe/Berlin")) return "+49"; // Germany
    if (timezone.includes("Europe/Paris")) return "+33"; // France
    if (timezone.includes("Australia/")) return "+61"; // Australia
    
    // Default to US
    return "+1";
  } catch {
    return "+1";
  }
};

export function CountrySelector({ value, onValueChange, disabled }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Auto-detect country on mount
  useEffect(() => {
    if (!value) {
      const detectedCountry = detectUserCountry();
      onValueChange(detectedCountry);
    }
  }, [value, onValueChange]);

  const selectedCountry = useMemo(() => {
    return countries.find(country => country.dial_code === value) || countries[0];
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!searchValue) return countries;
    
    const search = searchValue.toLowerCase();
    return countries.filter(country => 
      country.name.toLowerCase().includes(search) ||
      country.dial_code.includes(search) ||
      country.code.toLowerCase().includes(search)
    );
  }, [searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-auto justify-between px-3 py-2 h-10"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="font-mono text-sm">{selectedCountry.dial_code}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search country or dial code..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dial_code} ${country.code}`}
                  onSelect={() => {
                    onValueChange(country.dial_code);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{country.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{country.dial_code}</span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.dial_code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}