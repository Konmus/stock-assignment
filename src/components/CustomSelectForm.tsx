"use client";
import {
  Controller,
  UseControllerProps,
  FieldValues,
  FieldError,
  Path,
} from "react-hook-form";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import Select, {
  ActionMeta,
  GroupBase,
  OptionsOrGroups,
  Props,
  SelectInstance,
} from "react-select";
import { classNames } from "@/utils/classNames";
import CustomPlaceholder from "./SelectComponents/SelectPlaceholder";
import CustomClearIndicator from "./SelectComponents/SelectClearIndicator";
import CustomControl from "./SelectComponents/SelectControl";
type TSelectValue = {
  label: string;
  value: string;
};

interface SelectForm<T extends FieldValues> extends UseControllerProps<T> {
  errors?: FieldError;
  options: OptionsOrGroups<unknown, GroupBase<unknown>> | undefined;
  placeholder?: string;
  className?: string;
  //eslint-disable-next-line
  name: Path<T>;
  isClearable?: boolean;
  isMulti?: boolean;
  isSearchable?: boolean;
  menuIsOpen?: boolean;
  //eslint-disable-next-line
  onChange?: (val: any) => void;
  ref?: React.Ref<SelectInstance<unknown, boolean, GroupBase<unknown>>>;
  isDisabled?: boolean;
}
const FRCustomSelectForm = <T extends FieldValues>(
  {
    control,
    options,
    placeholder,
    name,
    errors,
    onChange,
    isMulti,
    className,
    isSearchable,
    isDisabled,
    menuIsOpen,
    isClearable = true,
  }: SelectForm<T>,
  ref?: React.Ref<SelectInstance<unknown, boolean, GroupBase<unknown>>>,
) => {
  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <Select
              isMulti={isMulti}
              isClearable={isClearable}
              placeholder={placeholder}
              menuIsOpen={menuIsOpen}
              isDisabled={isDisabled}
              ref={ref}
              styles={{
                menuPortal: (base: any) => ({
                  ...base,
                  zIndex: 9999,
                }),
                control: (props: any, state: any) => ({
                  ...props,
                  minHeight: "44px",
                  width: "100%",
                  color: "gray",
                  outline: "none",
                  boxShadow: state.isFocused
                    ? "0 0 0 3px rgba(118, 169, 250, 0)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                  borderColor: state.isFocused
                    ? "#9999FF"
                    : errors
                      ? "#Ef4444"
                      : "#E5E7EB",
                  borderRadius: "0.4rem",
                  backgroundColor: "white",
                  transition: "all ease-linear 300ms",
                  "&:hover": {
                    borderColor: "",
                  },
                }),
              }}
              onChange={(val: any) => {
                let values;
                if (isMulti && Array.isArray(val)) {
                  values = val
                    ? val.map((item: TSelectValue) => item.value)
                    : [];
                } else {
                  const { value } = val ?? "";
                  values = value;
                }

                field.onChange(values);
                console.log(field.value);
                if (onChange) onChange(val);
              }}
              defaultValue={() => {
                if (field.value)
                  return options?.find((i: any) => i.value === field.value);
              }}
              options={options}
              className={`${classNames(className, "z-20")}`}
              classNames={{ input: () => "" }}
              loadingMessage={undefined}
              noOptionsMessage={({ inputValue }: { inputValue: string }) =>
                !inputValue ? "" : "No Result Found"
              }
              components={{
                LoadingIndicator: undefined,
                ClearIndicator: CustomClearIndicator,
                Placeholder: CustomPlaceholder,
                Control: CustomControl,
              }}
              isSearchable={isSearchable}
            />
          </>
        )}
      />
      <div className="h-1">
        {errors && <p className="error-message">{errors.message}</p>}
      </div>
    </>
  );
};
//type assertion to use Generic on ForwardRef
export const SelectForm = React.forwardRef(FRCustomSelectForm) as <
  T extends FieldValues,
>(
  props: SelectForm<T> & {
    ref?: React.Ref<SelectInstance<unknown, boolean, GroupBase<unknown>>>;
  },
) => ReactElement;
