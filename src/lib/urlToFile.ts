export async function urlToFile(imageUrl: string, fileName: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type });
  return file;
}
