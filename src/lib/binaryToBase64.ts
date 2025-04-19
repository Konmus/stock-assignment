export const filetoBase64 = (file: File[]) => {
  if (!file || file.length === 0) {
    return undefined;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file[0]);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
