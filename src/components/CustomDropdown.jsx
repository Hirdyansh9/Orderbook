import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

/**
 * CustomDropdown - A fully styled dropdown component that matches the website's dark theme
 *
 * @param {Object} props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.className - Additional classes for the container
 * @param {string} props.label - Optional label for the dropdown
 */
const CustomDropdown = React.memo(function CustomDropdown({
  value,
  onChange,
  options = [],
  className = "",
  label = null,
  placeholder = "Select...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get the label for the current value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="w-full appearance-none px-3 py-2 pr-10 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition-all duration-200 cursor-pointer hover:border-gray-700 hover:bg-gray-800 text-left"
        >
          {displayText}
        </button>

        {/* Chevron Icon */}
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
            <ul className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <li
                  key={option.value}
                  style={{
                    animationDelay: `${index * 20}ms`,
                  }}
                  className="animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm transition-all duration-150 ${
                      value === option.value
                        ? "bg-gray-800 text-blue-400"
                        : "text-gray-100 hover:bg-gray-800 hover:translate-x-1"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

export default CustomDropdown;
