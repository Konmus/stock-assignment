import { itemCategoryEnum, itemStatusEnum, roleEnum } from "@/lib/db/schema";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { object } from "zod";

export const roleOptions = Object.values(roleEnum.enumValues).map((i) => {
  return {
    label: capitalizeFirstLetter(i),
    value: i,
  };
});

export const categoryOptions = Object.values(itemCategoryEnum.enumValues).map(
  (i) => {
    return {
      label: i,
      value: i,
    };
  },
);
export const statusOptions = Object.values(itemStatusEnum.enumValues).map(
  (i) => {
    return {
      label: i,
      value: i,
    };
  },
);
