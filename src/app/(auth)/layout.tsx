import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className=" h-screen  justify-center items-center flex  ">
        {children}
      </div>
    </>
  );
}
