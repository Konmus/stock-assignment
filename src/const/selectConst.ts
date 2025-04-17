import { roleEnum } from "@/lib/db/schema";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { object } from "zod";

export const roleOptions = Object.values(roleEnum.enumValues).map((i) => {
  return {
    label: capitalizeFirstLetter(i),
    value: i,
  };
});
