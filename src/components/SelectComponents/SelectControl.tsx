import React, { useEffect, useRef, useState } from "react";
import { components, ControlProps } from "react-select";

const CustomControl = (props: ControlProps) => {
  const placeholder = props.selectProps?.placeholder;
  const [labelWidth, setLabelWidth] = useState(0);
  const labelRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (labelRef.current) {
      setLabelWidth(labelRef.current.offsetWidth);
    }
  }, [labelRef]);
  return (
    <>
      <div className="relative z-[20]">
        {placeholder && (
          <>
            <label
              className={`absolute z-[10] pointer-events-none  px-[2px]  mt-1 text-gray-700 text-sm font-bold  transition-all ease-out duration-200 ${
                props.isFocused || props.hasValue
                  ? "-top-3.5 left-2 text-xs"
                  : "top-2 left-2"
              }`}
            >
              {placeholder}
            </label>
            {props.isFocused || props.hasValue ? (
              <span
                style={{
                  width: labelWidth + 14,
                  backgroundColor: "white",
                }}
                className="absolute z-[9] pointer-events-none top-0 left-[8px] h-1  bg-white "
              />
            ) : null}
            <label
              ref={labelRef}
              className="absolute opacity-0 pointer-events-none text-xs"
            >
              {placeholder}
            </label>
          </>
        )}

        <components.Control {...props}>{props.children}</components.Control>
      </div>
    </>
  );
};
export default CustomControl;
