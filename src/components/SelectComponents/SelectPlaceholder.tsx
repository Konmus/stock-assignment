import React from "react";
import { components, PlaceholderProps } from "react-select";

const CustomPlaceholder = (props: PlaceholderProps) => {
  return (
    <>
      <components.Placeholder {...props}>{""}</components.Placeholder>
    </>
  );
};

export default CustomPlaceholder;
