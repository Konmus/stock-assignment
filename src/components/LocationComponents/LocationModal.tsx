import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import { fetcher, fetcherBlob } from "@/lib/fetcher";
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
import { SelectForm } from "../CustomSelectForm";
import { filetoBase64 } from "@/lib/binaryToBase64";
import { UploadForm } from "../UploadForm";
import { ZLocation } from "@/lib/db/schema";

// Define the schema for location validation
const validatedForm = ZLocation.extend({
  name: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Location name must be 100 characters or less"),
  description: z.string().nullish(),
  imageUrl: z
    .array(z.custom<File>())
    .min(1, "Can only upload 1 photo")
    .refine((files) => files.every((file) => file.size <= 10 * 1024 * 1024), {
      message: "File size must be less than 10MB",
      path: ["imageUrl"],
    }),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  id: z.string().optional(),
  itemCount: z.number().nullish(),
});
const validatedFormImage = validatedForm.extend({
  imageUrl: z.string().nullish(),
});

export type ItemData = z.infer<typeof validatedFormImage>;

export type TLocation = z.infer<typeof validatedForm> & { id?: string };

interface ModalProps {
  onClose: () => void;
  isModalOpen: boolean;
  data?: ItemData;
}

export const LocationModal = ({ isModalOpen, onClose, data }: ModalProps) => {
  const imageUrl = data?.imageUrl
    ? `http://${process.env.NEXT_PUBLIC_BASE_URL}:9000/item-photo/${data.imageUrl}`
    : undefined;
  const { data: imageFile } = useSWR<File>(
    imageUrl ? [imageUrl, data?.imageUrl] : undefined, // Pass filename along with URL
    ([url, filename]) => fetcherBlob(url, filename as string), // Fetcher now receives both
    {
      suspense: true,
    },
  );
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setError,
    setValue,
    formState: { errors },
  } = useForm<TLocation>({
    resolver: zodResolver(validatedForm),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      imageUrl: data ? [imageFile] : [],
    },
  });

  // SWR mutation for creating a new location
  const { trigger: addTrigger, isMutating: isAdding } = useSWRMutation(
    "/api/location",
    async (url: string, { arg }: { arg: TLocation }) => {
      let imageBaseUrl;
      if (arg.imageUrl) {
        const imageBase64 = await filetoBase64(arg.imageUrl);
        imageBaseUrl = imageBase64;
      }
      const requestData = {
        ...arg,
        imageUrl: imageBaseUrl,
      };
      return fetcher(url, {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {
        mutate("/api/location");
      },
    },
  );

  // SWR mutation for editing a location
  const { trigger: editTrigger, isMutating: isEditing } = useSWRMutation(
    data ? `/api/location/${data?.id}` : null,
    async (url: string, { arg }: { arg: TLocation }) => {
      let imageBaseUrl;
      if (arg.imageUrl) {
        const imageBase64 = await filetoBase64(arg.imageUrl);
        imageBaseUrl = imageBase64;
      }
      const requestData = {
        ...arg,
        imageUrl: imageBaseUrl,
      };
      return fetcher(url, {
        method: "PATCH",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {
        mutate("/api/location");
      },
    },
  );

  // Custom mutation hook for deleting a location
  const { trigger: deleteTrigger, isMutating: isDeleting } = useMutation(
    "delete",
    `/api/location/${data?.id}`,
    {
      onSuccess: () => {
        mutate("/api/location");
      },
    },
  );

  // Handle form submission for creating a new location
  const onSubmit = async (formData: TLocation) => {
    try {
      await addTrigger(formData);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully created location</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occurred while creating the location.");
      console.error(err);
    } finally {
      reset();
    }
  };

  // Handle form submission for editing a location
  const onEdit = async (formData: TLocation) => {
    try {
      await editTrigger(formData);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully updated location</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occurred while updating the location.");
      console.error(err);
    }
  };

  // Handle location deletion
  const onDelete = async () => {
    try {
      await deleteTrigger();
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully deleted location</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occurred while deleting the location.");
      console.error(err);
    }
  };
  console.log(errors);
  console.log(data);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="min-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {data ? "Edit Location" : "Create New Location"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details to {data ? "update" : "create"} a location.
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
              label="Location Name:"
              register={register}
              watch={watch}
              errors={errors.name}
            />
          </div>
          <div className="space-y-2">
            <Input
              name="description"
              register={register}
              type="textarea"
              label="Description:"
              watch={watch}
              errors={errors.description}
            />
          </div>
          <div className="gap-4">
            <UploadForm
              setError={setError}
              control={control}
              name="imageUrl"
              errors={errors.imageUrl && errors.imageUrl.message}
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
                title="Delete Location"
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
