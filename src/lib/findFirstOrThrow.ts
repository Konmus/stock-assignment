export const firstFirstOrThrow = <T>(val: T[]): T => {
  if (val.length !== 1) {
    throw new Error("Not found");
  }
  return val[0]!;
};
