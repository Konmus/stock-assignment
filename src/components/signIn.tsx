"use client";
import React, { EventHandler, FormEventHandler, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./Input";

type IdentifierResponse = {
  username: string;
  email: string;
};
const signInSchema = z.object({
  password: z.string().nonempty("Enter an email or username"),
  username: z.string().nonempty("Enter a password"),
});

type TSignIn = z.infer<typeof signInSchema>;
const SignIn = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: TSignIn) => {
    try {
      const res = await signIn("credentials", {
        ...data,
        redirect: false,
      });
      if (res?.code === "invalid_password") {
        setError("password", { type: "custom", message: "Wrong password" });
      }
      if (res?.code !== "invalid_password") {
        //const decodedUrl = decodeURIComponent(callbackUrl ?? "");
        router.push(`/item`);
      }
    } catch (err) {
      return err;
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg px-8 py-6 max-w-md w-[350px]">
        <h1 className="text-2xl font-bold text-center mb-4 p-2 dark:text-gray-200">
          Welcome Back!
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Input
              type="text"
              register={register}
              name="username"
              errors={errors.username}
              label="Email or Username:"
            />
          </div>
          <div className="mb-4">
            <Input
              type="text"
              register={register}
              name="password"
              label="Password:"
              errors={errors.password}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
