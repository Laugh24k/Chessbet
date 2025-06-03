import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TimeControlOption {
  value: string;
  label: string;
  category: string;
}

const TIME_CONTROLS: TimeControlOption[] = [
  // Bullet
  { value: "1+0", label: "1+0", category: "Bullet" },
  { value: "1+1", label: "1+1", category: "Bullet" },
  { value: "2+1", label: "2+1", category: "Bullet" },
  
  // Blitz
  { value: "3+0", label: "3+0", category: "Blitz" },
  { value: "3+2", label: "3+2", category: "Blitz" },
  { value: "5+0", label: "5+0", category: "Blitz" },
  { value: "5+3", label: "5+3", category: "Blitz" },
  { value: "10+0", label: "10+0", category: "Blitz" },
  
  // Rapid
  { value: "15+10", label: "15+10", category: "Rapid" },
  { value: "30+0", label: "30+0", category: "Rapid" },
  { value: "30+20", label: "30+20", category: "Rapid" },
  
  // Classical
  { value: "60+30", label: "60+30", category: "Classical" },
  { value: "90+30", label: "90+30", category: "Classical" },
];

interface TimeControlSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TimeControlSelector({ value, onValueChange }: TimeControlSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = TIME_CONTROLS.find(option => option.value === value);
  const selectedLabel = selectedOption ? `${selectedOption.label} (${selectedOption.category})` : "Select time control";

  const groupedControls = TIME_CONTROLS.reduce((acc, control) => {
    if (!acc[control.category]) {
      acc[control.category] = [];
    }
    acc[control.category].push(control);
    return acc;
  }, {} as Record<string, TimeControlOption[]>);

  const handleOptionClick = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-dark-600 border-dark-500 hover:border-primary justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <i className={`fas fa-chevron-down transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-dark-600 border border-dark-500 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto scrollbar-thin animate-slide-up">
            {Object.entries(groupedControls).map(([category, controls]) => (
              <div key={category}>
                <div className="px-4 py-2 text-sm text-gray-400 border-b border-dark-500 bg-dark-700 sticky top-0">
                  {category}
                </div>
                {controls.map((control) => (
                  <button
                    key={control.value}
                    type="button"
                    className={`w-full text-left px-4 py-3 hover:bg-dark-500 transition-colors ${
                      value === control.value ? "bg-primary text-white" : ""
                    }`}
                    onClick={() => handleOptionClick(control.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{control.label}</span>
                      {value === control.value && (
                        <i className="fas fa-check text-sm" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
