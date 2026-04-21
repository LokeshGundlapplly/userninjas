import React, { useRef, useEffect, useState } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  isLoading = false,
  error,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      onChange(pastedData);
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  // Handle individual input change
  const handleChange = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, '');
    
    if (sanitized.length > 1) {
      // If multiple digits pasted
      const remainingDigits = sanitized.slice(1);
      const newValue = value.slice(0, index) + sanitized[0] + remainingDigits;
      const finalValue = newValue.slice(0, length);
      onChange(finalValue);
      
      // Focus on last digit or next available input
      const nextIndex = Math.min(index + 1, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (finalValue.length === length && onComplete) {
        onComplete(finalValue);
      }
      return;
    }

    // Single digit
    const newValue = value.slice(0, index) + sanitized + value.slice(index + 1);
    onChange(newValue);

    // Auto-move to next input
    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger complete if all fields filled
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChange(newValue);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-3 justify-center mb-4">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={isLoading}
            className={`
              w-14 h-14 text-center text-2xl font-bold font-mono
              border-2 rounded-lg transition-all
              ${focusedIndex === index
                ? 'border-indigo-600 ring-2 ring-indigo-300 bg-white'
                : error
                ? 'border-red-400 bg-red-50'
                : value[index]
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300 bg-white'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              focus:outline-none
            `}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-center text-xs text-gray-500 mt-4">
        {value.length === 0 ? (
          'Enter the 6-digit code'
        ) : value.length === length ? (
          <span className="text-green-600 font-semibold">✓ Code complete</span>
        ) : (
          `${length - value.length} more digit${length - value.length !== 1 ? 's' : ''}`
        )}
      </p>
    </div>
  );
}
