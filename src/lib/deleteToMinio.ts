export const deleteToMinio = async (key: string) => {
  const deleteResponse = await fetch(
    `http://localhost:3000/api/upload?id=${key}`,
    {
      method: "DELETE",
    },
  );
  const deleteRes = await deleteResponse.json();

  return deleteRes;
};
