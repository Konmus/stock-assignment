import { TUser, users, ZUser } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import { fetcher } from "@/lib/fetcher";
import toast from "react-hot-toast";
import { Input } from "../Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

const userFormSchema = ZUser.extend({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(255, "Username must be less than 255 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  // Use any type for the file input and handle validation separately
  image: z.any().optional(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      !data.image || (data.image instanceof FileList && data.image.length > 0),
    {
      message: "Please upload a valid image file",
      path: ["image"],
    },
  );
interface UserModalProps {
  onClose: () => void;
  isModalOpen: boolean;
  user?: TUser;
}
export const UserModal = ({ isModalOpen, onClose, user }: UserModalProps) => {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TUser>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      ...user,
    },
  });
  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    "/api/assessment/",
    async (url: string, { arg }: { arg: TUser }) => {
      const requestData = {
        ...arg,
      };
      return fetcher(url, {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {},
    },
  );
  const onSubmit = async (data: TUser) => {
    try {
      console.log(data);
      const res = await addTrigger(data);
      console.log(res);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully Created User</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      console.log(err);
      toast.error("An error occured while creating the User.");
      return err;
    }
  };
  console.log(errors);

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              Fill in the details to {user ? "update" : "create"} a user
              account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  name="username"
                  type="text"
                  register={register}
                  label="Username:"
                  errors={errors.username}
                />
              </div>

              <div className="space-y-2">
                <Input
                  name="name"
                  label="Name:"
                  type="text"
                  register={register}
                  errors={errors.name}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                label="Email:"
                register={register}
                errors={errors.email}
              />
            </div>

            <div className="space-y-2">
              <Input
                name="password"
                label="Password:"
                type="password"
                register={register}
                errors={errors.password}
              />
            </div>

            <div className="space-y-2">
              <Input
                name="image"
                type="file"
                register={register}
                errors={errors.image}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Saving..." : user ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
        )
      </Dialog>
    </>
  );
};
