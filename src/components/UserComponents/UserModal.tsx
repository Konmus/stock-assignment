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
import { useMutation } from "@/hooks/useMutation";
import { SelectForm } from "../CustomSelectForm";
import { roleOptions } from "@/const/selectConst";
import { ConfirmationModal } from "../ConfirmationModal";
import { mutate } from "swr";

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
  // Use any type for the file input and handle validation separately
  image: z.any().optional(),
});
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
    watch,
    setError,
    formState: { errors },
  } = useForm<TUser>({
    resolver: zodResolver(
      user ? userFormSchema.omit({ password: true }) : userFormSchema,
    ),
    defaultValues: {
      ...user,
    },
  });
  const { trigger, isMutating: isAdding } = useMutation(
    "create",
    `/api/account`,
    {
      onSuccess: () => {
        console.log("Hi");
      },
    },
  );
  const { trigger: deleteTrigger, isMutating: isDeleting } = useMutation(
    "delete",
    `/api/account/${user?.id}`,
    {
      onSuccess: () => {
        mutate("/api/account");
      },
    },
  );
  const { trigger: editTrigger, isMutating: isEditting } = useMutation(
    "update",
    `/api/account/${user?.id}`,
    {
      onSuccess: () => {
        mutate("/api/account");
      },
    },
  );

  const onSubmit = async (data: TUser) => {
    try {
      console.log(data);
      const resIdentifier = await fetch("/api/auth/identifier", {
        body: JSON.stringify(data),
        method: "POST",
      });
      if (resIdentifier.status === 404) {
        setError(
          `username`,
          {
            type: "custom",
            message: "Username already exist",
          },
          {
            shouldFocus: true,
          },
        );
      }
      if (resIdentifier.status === 400) {
        setError(
          `email`,
          {
            type: "custom",
            message: "Email already exist",
          },
          {
            shouldFocus: true,
          },
        );
      }
      if (resIdentifier.ok) {
        await trigger(data);
        toast.success(
          <div className="flex">
            <span className="mr-1">Successfully created User</span>
            <>!</>
          </div>,
          { duration: 5000 },
        );
        onClose();
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occured while creating the User.");
      return err;
    }
  };
  const onEdit = async (data: TUser) => {
    try {
      const res = await editTrigger(data);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully editted the User</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occured while creating the User.");
      return err;
    }
  };
  const onDelete = async (data: TUser["id"]) => {
    try {
      console.log(data);
      const res = await deleteTrigger();
      console.log(res);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully deleted the User</span>
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
  console.log(roleOptions);

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
          <form
            onSubmit={user ? handleSubmit(onEdit) : handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  name="username"
                  type="text"
                  register={register}
                  watch={watch}
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
                  watch={watch}
                  errors={errors.name}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                watch={watch}
                label="Email:"
                register={register}
                errors={errors.email}
              />
            </div>
            {!user && (
              <div className="space-y-2">
                <Input
                  name="password"
                  label="Password:"
                  watch={watch}
                  type="password"
                  register={register}
                  errors={errors.password}
                />
              </div>
            )}

            <SelectForm
              options={roleOptions}
              onChange={() => console.log("hi")}
              placeholder="Role:"
              name="role"
              control={control}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {user && (
                <ConfirmationModal
                  isClicked={isDeleting}
                  trigger={() => onDelete(user?.id)}
                  title="Delete User"
                />
              )}
              <Button type="submit" disabled={isAdding || isEditting}>
                {isAdding
                  ? "Saving..."
                  : isEditting
                    ? "Updating..."
                    : user
                      ? "Update"
                      : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
