import { z } from "zod";

export const numberNaNToNull = () =>
  z.preprocess((val) => {
    if (val === undefined || val === null || isNaN(Number(val))) {
      return null; // Return null for undefined, null, or NaN
    }
    return Number(val);
  }, z.number().nonnegative("Number must be positive").nullish());
