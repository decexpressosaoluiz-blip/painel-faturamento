import React from 'react';

interface FilterPillsProps {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  availableOptions: (string | number)[]; // New prop to check availability
  onChange: (selected: (string | number)[]) => void;
  canSelectAll?: boolean;
}

export const FilterPills: React.FC<FilterPillsProps> = ({ 
  label, 
  options, 
  selected, 
  availableOptions,
  onChange,
  canSelectAll = false
}) => {
  
  const toggleOption = (option: string | number) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const toggleAll = () => {
    // If all available options are selected, clear all. Otherwise, select all available.
    // We only care about available options for "Select All"
    const allAvailableSelected = availableOptions.every(opt => selected.includes(opt));
    
    if (allAvailableSelected) {
      onChange([]);
    } else {
      onChange([...availableOptions]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-xs font-semibold text-[#656683] uppercase tracking-wide">{label}</label>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {canSelectAll && (
            <button
              onClick={toggleAll}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${selected.length > 0 && availableOptions.every(opt => selected.includes(opt))
                  ? 'bg-[#2E31B4] text-white border-[#2E31B4] shadow-md' 
                  : 'bg-white text-[#0F103A] border-[#E8E8F9] hover:border-[#2E31B4] hover:bg-[#F2F2F8]'
                }
              `}
            >
              Todos
            </button>
        )}

        {options.map((option) => {
          const isSelected = selected.includes(option);
          const isAvailable = availableOptions.includes(option);

          return (
            <button
              key={option}
              disabled={!isAvailable && !isSelected} // Disable if not available and not currently selected
              onClick={() => toggleOption(option)}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all border
                ${!isAvailable 
                    ? 'opacity-40 bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' 
                    : isSelected 
                        ? 'bg-[#2E31B4] text-white border-[#2E31B4] shadow-md transform scale-105' 
                        : 'bg-white text-[#656683] border-[#E8E8F9] hover:border-[#8B8CC2] hover:bg-[#F2F2F8]'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};