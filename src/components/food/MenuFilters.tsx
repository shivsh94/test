"use client";

import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { useLabelStore } from "@/store/useProjectStore";

interface FoodPreference {
  id: "Veg" | "NonVeg";
  label: string;
  activeColor: string;
}

interface DynamicTogglePreference {
  id: string;
  label: string;
  activeColor: string;
}

interface MenuFiltersProps {
  preferences: { [key: string]: boolean };
  toggleStates: { [key: string]: boolean };
  onPreferenceChange: (id: "Veg" | "NonVeg", checked: boolean) => void;
  onToggleChange: (id: string, pressed: boolean) => void;
  activeFilters: string[];
}

export function MenuFilters({
  preferences,
  toggleStates,
  onPreferenceChange,
  onToggleChange,
}: MenuFiltersProps) {
  const { labelItems } = useLabelStore();

  const foodPreferences: FoodPreference[] = [
    {
      id: "Veg",
      label: "Veg",
      activeColor:
        "data-[state=checked]:bg-green-500 data-[state=checked]:ring-green-500",
    },
    {
      id: "NonVeg",
      label: "Non-Veg",
      activeColor:
        "data-[state=checked]:bg-red-500 data-[state=checked]:ring-red-500",
    },
  ];

  const togglePreferences: DynamicTogglePreference[] = labelItems.map(
    (item) => ({
      id: item.id,
      label: item.text,
      activeColor: `data-[state=on]:bg-[${item.color}]`,
    })
  );

  return (
    <>
      <div className="flex flex-col gap-2 px-4">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {foodPreferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center space-x-2 border rounded-full p-2 min-w-fit"
              onClick={() => onPreferenceChange(pref.id, !preferences[pref.id])}
            >
              <Switch
                checked={preferences[pref.id]}
                onCheckedChange={(checked) =>
                  onPreferenceChange(pref.id, checked)
                }
                className={`${pref.activeColor} 
                          data-[state=unchecked]:bg-gray-200 data-[state=unchecked]:ring-gray-200 h-4 w-8`}
              />
              <label className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                {pref.label}
              </label>
            </div>
          ))}

          {togglePreferences.map((toggle) => (
            <div key={toggle.id} className="flex items-center"
            style={{
              backgroundColor: toggleStates[toggle.id]
                ? toggle.activeColor
                : "transparent",
            }}
            >
              <Toggle
                pressed={toggleStates[toggle.id]}
                onPressedChange={(pressed) =>
                  onToggleChange(toggle.id, pressed)
                }
                className={`${toggle.activeColor} 
                          px-4 py-2 rounded-full
                          data-[state=off]:background
                          font-semibold text-xs min-w-fit border`}
              >
                <label className="font-semibold text-gray-800 text-xs whitespace-nowrap">
                  {toggle.label}
                </label>
              </Toggle>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}