"use client";
import React, { InputHTMLAttributes, useEffect, useRef, useState } from "react";
import {
  FieldValues,
  UseFormRegister,
  Path,
  FieldError,
  RegisterOptions,
} from "react-hook-form";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IInput<T extends FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  register: UseFormRegister<T>;
  name: Path<T>;
  type?: React.HTMLInputTypeAttribute | "textarea";
  className?: string;
  label?: string;
  errors?: FieldError;
  unit?: string;
  defaultValue?: string | number | readonly string[];
  watch?: (name: Path<T>) => boolean;
  registerOptions?: RegisterOptions<T, Path<T>> | undefined;
  onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting?: boolean;
  checkBoxLabel?: string;
  disablePlaceholderEffect?: boolean;
}

export const Input = <T extends FieldValues>({
  register,
  name,
  label,
  isSubmitting,
  type,
  defaultValue,
  errors,
  unit,
  className,
  registerOptions,
  disablePlaceholderEffect = false,
  watch,
  checkBoxLabel,
  readOnly,
  value,
  onchange,
  disabled,
  ...rest
}: IInput<T>) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);
  const labelRef = useRef<HTMLLabelElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    if (labelRef.current) {
      setLabelWidth(labelRef.current.offsetWidth);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value !== "");
  };

  useEffect(() => {
    if (watch) {
      setHasValue(!!watch(name));
    }
    if (
      type === "date" ||
      type === "datetime-local" ||
      type === "file" ||
      type === "time" ||
      readOnly ||
      disablePlaceholderEffect === true
    ) {
      setIsFocused(true);
    }
  }, [type, name, watch, errors, readOnly, disablePlaceholderEffect]);

  return (
    <div className="relative ">
      {label && (
        <>
          <label
            className={`absolute z-[1] pointer-events-none  ml-1 mt-1 text-gray-700 text-sm font-bold  transition-all ease-out duration-200  ${
              isFocused || hasValue
                ? "-top-3.5 left-2 text-xs"
                : type === "file"
                  ? "top-5 "
                  : "top-2 left-2"
            }`}
          >
            {label}
          </label>
          {isFocused || hasValue ? (
            <span
              style={{
                width: labelWidth + 14,
                backgroundColor: type === "file" ? "" : "white",
              }}
              className={"absolute pointer-events-none top-0 left-[8px] h-1  "}
            />
          ) : null}
          <label
            ref={labelRef}
            className="absolute opacity-0 pointer-events-none text-xs"
          >
            {label}
          </label>
          <span className="absolute items-center right-0 pr-3 pt-2.5 text-zinc-400 pointer-events-none">
            {unit}
          </span>
        </>
      )}
      {type !== "textarea" && type !== "file" && type !== "checkbox" && (
        <input
          className={`${`${cn(
            className,
            errors
              ? "  border-red-500 focus:border-red-500 focus:ring-red-50   "
              : " focus:border-indigo-400",
            "w-full text-gray-700 placeholder:text-sm placeholder:text-right shadow-md focus:ring focus:outline-none focus:ring-indigo-200 focus:ring-opacity-0 border-gray-200  rounded-md bg-white transition-all ease-linear duration-300",
          )}`}`}
          type={type}
          {...register(name, registerOptions)}
          onFocus={handleFocus}
          autoComplete="off"
          defaultValue={defaultValue}
          onBlur={
            type === "date" ||
            type === "datetime-local" ||
            type === "time" ||
            readOnly
              ? undefined
              : handleBlur
          }
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />
      )}
      {type === "checkbox" && (
        <>
          <div className="flex items-center">
            <input
              value={value}
              type="checkbox"
              className={cn(
                "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600",
                className,
              )}
              {...register(name, registerOptions)}
              onChange={(e) => {
                const { onChange } = register(name, registerOptions);
                onChange(e);
                if (onchange) onchange(e);
              }}
              disabled={disabled}
              {...rest}
            />
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {checkBoxLabel}
            </label>
          </div>
        </>
      )}
      {type === "textarea" && (
        <>
          <textarea
            className={`${cn(
              className,
              errors
                ? "  border-red-500 focus:border-red-500 focus:ring-red-50   "
                : " focus:border-indigo-400",
              "w-full text-sm min-h-[90px]  text-gray-700 placeholder:text-sm placeholder:text-right shadow-md focus:ring focus:outline-none focus:ring-indigo-200 focus:ring-opacity-0 border-gray-200  rounded-md bg-white transition-all ease-linear duration-300",
            )}`}
            {...register(name, registerOptions)}
            onFocus={handleFocus}
            autoComplete="off"
            defaultValue={defaultValue}
          ></textarea>
        </>
      )}

      <div className="h-1">
        {errors && <p className="error-message">{errors.message}</p>}
      </div>
    </div>
  );
};
