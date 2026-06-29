"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthFieldType = "text" | "email" | "password";

interface AuthFieldProps {
  name: string;
  type: AuthFieldType;
  placeholder: string;
  label?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  minLength?: number;
}

const ICONS = {
  text: User,
  email: Mail,
  password: Lock,
} as const;

export function AuthField({
  name,
  type,
  placeholder,
  label,
  autoComplete,
  required,
  defaultValue,
  value,
  onChange,
  minLength,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const Icon = ICONS[type];
  const inputProps =
    value !== undefined
      ? {
          value,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange?.(event.target.value),
        }
      : { defaultValue };

  return (
    <div className={label ? "space-y-2" : undefined}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Icon
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint"
          strokeWidth={1.5}
        />
        <input
          id={name}
          name={name}
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        {...inputProps}
        className={cn(
          "h-12 w-full rounded-2xl border border-input bg-white pr-12 pl-11 text-sm text-foreground outline-none transition-colors placeholder:text-ink-faint",
          "focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-[#c9bfb0]/30"
        )}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-ink-faint transition-colors hover:text-muted-foreground"
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
    </div>
  );
}
