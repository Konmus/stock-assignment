import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ConfirmationModal } from "../ConfirmationModal";
import useSWR, { mutate } from "swr";

// Define the schema for category validation
const validatedForm = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  description: z.string().nullish(),
});

export type TCategory = z.infer<typeof validatedForm> & { id?: string };

interface ModalProps {
  onClose: () => void;
  isModalOpen: boolean;
  data?: TCategory;
}

export const CategoryModal = ({ isModalOpen, onClose, data }: ModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TCategory>({
    resolver: zodResolver(validatedForm),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
    },
  });

  // SWR mutation for creating a new category
  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    "/api/category",
    async (url: string, { arg }: { arg: TCategory }) => {
      return fetcher(url, {
        method: "POST",
        body: JSON.stringify(arg),
      });
    },
    {
      onSuccess: () => {
        mutate("/api/category");
      },
    },
  );

  // SWR mutation for editing a category
  const { trigger: editTrigger, isMutating: isEditing } = useSWRMutation(
    `/api/category/${data?.id}`,
    async (url: string, { arg }: { arg: TCategory }) => {
      return fetcher(url, {
        method: "PATCH",
        body: JSON.stringify(arg),
      });
    },
    {
      onSuccess: () => {
        mutate("/api/category");
      },
    },
  );

  // Custom mutation hook for deleting a category
  const { trigger: deleteTrigger, isMutating: isDeleting } = useMutation(
    "delete",
    `/api/category/${data?.id}`,
    {
      onSuccess: () => {
        mutate("/api/category");
      },
    },
  );

  // Handle form submission for creating a new category
  const onSubmit = async (formData: TCategory) => {
    try {
      await addTrigger(formData);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully created category</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occurred while creating the category.");
      console.error(err);
    } finally {
      reset();
    }
  };

  // Handle form submission for editing a category
  const onEdit = async (formData: TCategory) => {
    try {
      await editTrigger(formData);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully updated category</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occurred while updating the category.");
      console.error(err);
    }
  };

  // Handle category deletion
  const onDelete = async () => {
    try {
      await deleteTrigger();
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully deleted category</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occurred while deleting the category.");
      console.error(err);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {data ? "Edit Category" : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to {data ? "update" : "create"} a category.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={data ? handleSubmit(onEdit) : handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Input
              name="name"
              type="text"
              label="Category Name:"
              register={register}
              watch={watch}
              errors={errors.name}
            />
          </div>
          <div className="space-y-2 w-full">
            <Input
              name="description"
              register={register}
              type="textarea"
              label="Description:"
              watch={watch}
              errors={errors.description}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {data && (
              <ConfirmationModal
                isClicked={isDeleting}
                trigger={onDelete}
                title="Delete Category"
              />
            )}
            <Button type="submit" disabled={isAdding || isEditing}>
              {isAdding
                ? "Saving..."
                : isEditing
                  ? "Updating..."
                  : data
                    ? "Update"
                    : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
