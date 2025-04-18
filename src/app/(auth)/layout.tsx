import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="absolute left-[40%]    justify-center items-center flex  ">
        {children}
      </div>
    </>
  );
}
