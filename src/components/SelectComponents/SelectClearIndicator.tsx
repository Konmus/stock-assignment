"use client";
import React, { EventHandler, useContext, useEffect, useRef } from "react";
import Select, { ClearIndicatorProps, components } from "react-select";

const CustomClearIndicator = (props: ClearIndicatorProps) => {
  const {
    innerProps: { ...resInnerProps },
  } = props;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.clearValue();
  };
  return (
    <>
      <components.ClearIndicator
        {...props}
        innerProps={{
          onClick: (e) => {
            e.preventDefault;
            e.stopPropagation();
            props.clearValue();
            props.selectProps.onMenuClose();
          },
        }}
      />
    </>
  );
};

export default CustomClearIndicator;
