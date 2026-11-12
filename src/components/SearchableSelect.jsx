'use client';
import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder,
  disabled = false,
  required = true,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const displayValue = isOpen ? query : value;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => {
          if (!disabled) {
            setQuery('');
            setIsOpen(true);
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (e.target.value === '') {
            onChange('');
          }
        }}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 bg-white outline-none focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        required={required}
      />

      {!disabled && value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setQuery('');
            setIsOpen(true);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm font-bold"
        >
          ✕
        </button>
      )}

      {isOpen && !disabled && (
        <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-3.5 py-2 cursor-pointer text-sm hover:bg-green-50 hover:text-green-700 ${
                  opt === value ? 'bg-green-100 font-bold text-green-800' : 'text-gray-700'
                }`}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-3.5 py-2 text-sm text-gray-400">কোনো তথ্য পাওয়া যায়নি</li>
          )}
        </ul>
      )}
    </div>
  );
}
