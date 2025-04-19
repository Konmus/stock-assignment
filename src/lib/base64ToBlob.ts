export function base64ToBlob(base64Data: string) {
  const base64 = base64Data.split(",")[1];
  const arrayBuffer = Buffer.from(base64, "base64");
  return arrayBuffer;
}
