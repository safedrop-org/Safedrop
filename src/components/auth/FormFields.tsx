import React from "react";
import { useForm } from "react-hook-form";
import { LucideIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface FormFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: LucideIcon;
}

export const CustomFormField: React.FC<{
  control: ReturnType<typeof useForm>["control"];
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  icon?: LucideIcon;
  className?: string;
}> = ({ control, name, label, placeholder, type = "text", icon: Icon, className = "" }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="relative">
            {Icon && (
              <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            )}
            <Input
              type={type}
              placeholder={placeholder}
              className={Icon ? "pl-10" : ""}
              {...field}
            />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
