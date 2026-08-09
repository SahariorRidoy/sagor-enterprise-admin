"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputOTPProps {
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

interface InputOTPGroupProps {
  children: React.ReactNode;
}

interface InputOTPSlotProps {
  index: number;
}

const InputOTPContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
} | null>(null);

export function InputOTP({ maxLength, value, onChange, children }: InputOTPProps) {
  return (
    <InputOTPContext.Provider value={{ value, onChange, maxLength }}>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </InputOTPContext.Provider>
  );
}

export function InputOTPGroup({ children }: InputOTPGroupProps) {
  return (
    <div className="flex items-center gap-2">
      {children}
    </div>
  );
}

export function InputOTPSlot({ index }: InputOTPSlotProps) {
  const context = React.useContext(InputOTPContext);
  if (!context) {
    throw new Error("InputOTPSlot must be used within InputOTP");
  }

  const { value, onChange, maxLength } = context;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
      const newOtp = value.split('');
      newOtp[index] = newValue;
      onChange(newOtp.join('').slice(0, maxLength));
      
      // Auto-focus next input
      if (newValue && index < maxLength - 1) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLength);
    onChange(pastedData);
    
    // Focus the last filled input or the next empty one
    const nextIndex = Math.min(pastedData.length, maxLength - 1);
    const nextInput = document.querySelector(`input[data-index="${nextIndex}"]`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  };

  return (
    <input
      ref={inputRef}
      data-index={index}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value[index] || ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={cn(
        "w-12 h-12 text-center text-lg font-semibold",
        "border border-gray-300 rounded-lg",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "transition-all duration-200",
        value[index] ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
      )}
    />
  );
}