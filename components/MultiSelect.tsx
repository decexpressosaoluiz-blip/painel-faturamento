import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  availableOptions: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ 
    label, 
    options, 
    selected, 
    availableOptions,
    onChange, 
    placeholder = "Selecionar..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string | number) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-semibold text-[#656683] mb-1.5 uppercase tracking-wide">{label}</label>
      <div 
        className={`
            w-full bg-white border rounded-xl px-3 py-2.5 min-h-[44px] flex items-center justify-between cursor-pointer transition-all shadow-sm
            ${isOpen ? 'border-[#2E31B4] ring-2 ring-[#BFC0EF]' : 'border-[#E8E8F9] hover:border-[#7E7FBB]'}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 items-center max-w-[calc(100%-28px)] overflow-hidden">
          {selected.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            selected.length <= 1 ? (
              selected.map(item => (
                <span key={item} className="bg-[#E8E8F9] text-[#2E31B4] text-sm px-2.5 py-0.5 rounded-md font-bold truncate max-w-full">
                  {item}
                </span>
              ))
            ) : (
              <span className="bg-[#E8E8F9] text-[#2E31B4] text-sm px-2.5 py-0.5 rounded-md font-bold">
                {selected.length} selecionados
              </span>
            )
          )}
        </div>
        <div className="flex items-center gap-1.5">
            {selected.length > 0 && (
                <div onClick={clearAll} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#EC1B23] transition-colors">
                    <X size={14} />
                </div>
            )}
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-[9999] w-full mt-1.5 bg-white border border-[#E8E8F9] rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 custom-scrollbar">
          {options.map(option => {
             const isAvailable = availableOptions.includes(option);
             const isSelected = selected.includes(option);
             
             return (
                <button
                key={option}
                disabled={!isAvailable}
                className={`
                    w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors border-b border-[#F2F2F8] last:border-0
                    ${isSelected ? 'bg-[#E8E8F9] text-[#2E31B4] font-bold' : 'text-[#0F103A] hover:bg-[#F2F2F8]'}
                    ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                `}
                onClick={() => isAvailable && toggleOption(option)}
                >
                <span className="truncate">{option}</span>
                {isSelected && <Check size={16} className="text-[#2E31B4]" />}
                </button>
            );
          })}
          {options.length === 0 && <div className="p-4 text-sm text-gray-400 text-center">Sem opções disponíveis</div>}
        </div>
      )}
    </div>
  );
};