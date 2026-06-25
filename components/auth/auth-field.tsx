"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFieldProps {
  name: string;
  type: "email" | "password";
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  minLength?: number;
}

export function AuthField({
  name,
  type,
  placeholder,
  autoComplete,
  required,
  defaultValue,
  value,
  onChange,
  minLength,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const Icon = isPassword ? Lock : Mail;
  const inputProps =
    value !== undefined
      ? {
          value,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(event.target.value),
        }
      : { defaultValue };

  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#a39e97]"
        strokeWidth={1.5}
      />
      <input
        name={name}
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        {...inputProps}
        className={cn(
          "h-12 w-full rounded-2xl border border-[#e8e2d9] bg-white pr-12 pl-11 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#a39e97]",
          "focus-visible:border-[#c9bfb0] focus-visible:ring-2 focus-visible:ring-[#c9bfb0]/30"
        )}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-[#a39e97] transition-colors hover:text-[#6b6560]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" strokeWidth={1.5} />
          ) : (
            <Eye className="size-4" strokeWidth={1.5} />
          )}
        </button>
      )}
    </div>
  );
}
