"use client";
import {
  Controller,
  UseControllerProps,
  FieldValues,
  FieldError,
} from "react-hook-form";
import React, { useEffect, useRef, useState } from "react";
import Datepicker from "@tarabao/react-tailwindcss-datepicker";
import {
  DateValueType,
  DateType,
} from "@tarabao/react-tailwindcss-datepicker/dist/types";
import { classNames } from "@/utils/classNames";

interface DateCalenderForm<T extends FieldValues>
  extends UseControllerProps<T> {
  errors?: FieldError;
  label: string;
  maxDate?: Date;
  initialDate: DateType | null;
  zindex?: number;
}

export const DateCalenderForm = <T extends FieldValues>({
  control,
  errors,
  zindex,
  label,
  initialDate,
  maxDate,
  name,
}: DateCalenderForm<T>) => {
  const [value, setValue] = useState<DateValueType>({
    startDate: initialDate,
    endDate: initialDate,
  });
  const [labelWidth, setLabelWidth] = useState(0);
  const labelRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (labelRef.current) {
      setLabelWidth(labelRef.current.offsetWidth);
    }
  }, []);
  return (
    <>
      <div className={classNames("relative z-[1000]")}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <>
              <label
                className={`absolute pointer-events-none z-[61]  ml-1 mt-1 text-gray-700  font-bold -top-3.5 left-2 text-xs transition-all ease-out duration-200 
                  `}
                ref={labelRef}
              >
                {label}
              </label>
              <span
                style={{
                  width: labelWidth + 14,
                  backgroundColor: "white",
                }}
                className="absolute z-[11] pointer-events-none top-0 left-[8px] h-1  bg-white "
              />
              <Datepicker
                primaryColor="indigo"
                toggleClassName="ring-none"
                classNames={{
                  container: () => "bg-black",
                  input: () =>
                    classNames(
                      errors
                        ? " border-red-500 focus:border-red-500 focus:ring-red-50   "
                        : "focus:border-indigo-400",
                      "w-full absolute shadow-md focus:outline-none border-gray-200  rounded-md  focus:ring-1 focus:ring-gray-200",
                    ),
                }}
                useRange={false}
                asSingle={true}
                maxDate={maxDate}
                value={value}
                onChange={(date) => {
                  setValue(date);
                  field.onChange(date?.startDate?.toISOString());
                }}
              />
            </>
          )}
        />
        <div className="h-1 mt-4">
          {errors && <p className="error-message">{errors.message}</p>}
        </div>
      </div>
    </>
  );
};
