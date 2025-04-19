import { base64ToBlob } from "./base64ToBlob";

export const uploadToMinio = async (file: string) => {
  const fileType = file.split(";")[0].split(":")[1];
  const blob = base64ToBlob(file);
  const uploadResponse = await fetch(
    `http://localhost:3000/api/upload?fileType=${fileType}`,
  );
  const uploadData = await uploadResponse.json();
  const { uploadUrl, Key } = uploadData;

  // Upload the file using the PUT method
  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: blob, // Pass the file blob
    headers: {
      "Content-Type": fileType, // Specify the file type
    },
  });
  return Key;
};
