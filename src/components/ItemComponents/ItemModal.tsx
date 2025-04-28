import { TItem, TUser, users, ZItem, ZUser } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Suspense } from "react";
import { useForm } from "react-hook-form";
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
import { SelectForm } from "../CustomSelectForm";
import {
  categoryOptions,
  roleOptions,
  statusOptions,
} from "@/const/selectConst";
import { ConfirmationModal } from "../ConfirmationModal";
import useSWR, { mutate } from "swr";
import { DateCalenderForm } from "../DateCalenderForm";
import { numberNaNToNull } from "@/lib/numberNaNToNull";
import { isRequired } from "@/utils/isRequired";
import { UploadForm } from "../UploadForm";
import { filetoBase64 } from "@/lib/binaryToBase64";

const validatedForm = ZItem.extend({
  price: numberNaNToNull(),
  quantity: z.number({
    invalid_type_error: isRequired("Quantity"),
    required_error: isRequired("Quantity"),
  }),
  imageUrl: z
    .array(z.custom<File>())
    .min(1, "Please select one image")
    .refine((files) => files.every((file) => file.size <= 10 * 1024 * 1024), {
      message: "File size must be less than 10MB",
      path: ["imageUrl"],
    }),
});

const validatedFormImage = validatedForm.extend({
  imageUrl: z.string().nullish(),
});

export type TData = z.infer<typeof validatedForm>;
export type ItemData = z.infer<typeof validatedFormImage>;
interface ModalProps {
  onClose: () => void;
  isModalOpen: boolean;
  data?: ItemData;
}
export const ItemModal = ({ isModalOpen, onClose, data }: ModalProps) => {
  const imageUrl = data?.imageUrl
    ? `http://${process.env.NEXT_PUBLIC_BASE_URL}:9000/item-photo/${data.imageUrl}`
    : null;
  const { data: imageFile } = useSWR<File>(
    imageUrl ? [imageUrl, data?.imageUrl] : null, // Pass filename along with URL
    ([url, filename]) => fetcherBlob(url, filename as string), // Fetcher now receives both
    {
      suspense: true,
    },
  );
  console.log(imageFile);
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<TData>({
    resolver: zodResolver(validatedForm),
    defaultValues: {
      ...data,
      imageUrl: [imageFile],
    },
  });
  const { trigger, isMutating: isAdding } = useSWRMutation(
    "/api/item/",
    async (url: string, { arg }: { arg: TData }) => {
      const imageBase64 = await filetoBase64(arg.imageUrl);
      const requestData = {
        ...arg,
        imageUrl: imageBase64,
      };
      return fetcher(url, {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {
        mutate("/api/item");
      },
    },
  );
  const { trigger: deleteTrigger, isMutating: isDeleting } = useMutation(
    "delete",
    `/api/item/${data?.id}`,
    {
      onSuccess: () => {
        mutate("/api/item");
      },
    },
  );
  const { trigger: editTrigger, isMutating: isEditting } = useSWRMutation(
    `/api/item/${data?.id}`,
    async (url: string, { arg }: { arg: TData }) => {
      const imageBase64 = await filetoBase64(arg.imageUrl);
      const requestData = {
        ...arg,
        imageUrl: imageBase64,
      };
      return fetcher(url, {
        method: "PUT",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {
        mutate("/api/item");
      },
    },
  );

  const onSubmit = async (data: TData) => {
    try {
      console.log(data.imageUrl, "testing");
      await trigger(data);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully created data</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      console.log(err);
      toast.error("An error occured while creating the data.");
      return err;
    } finally {
      reset();
    }
  };
  const onEdit = async (data: TData) => {
    try {
      const res = await editTrigger(data);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully editted the data</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      toast.error("An error occured while creating the data.");
      return err;
    }
  };
  const onDelete = async (data: TData["id"]) => {
    try {
      console.log(data);
      const res = await deleteTrigger();
      console.log(res);
      toast.success(
        <div className="flex">
          <span className="mr-1">Successfully deleted the data</span>
          <>!</>
        </div>,
        { duration: 5000 },
      );
      onClose();
    } catch (err) {
      console.log(err);
      toast.error("An error occured while creating the data.");
      return err;
    }
  };
  console.log(errors);
  console.log(roleOptions);

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="min-w-[600px]">
          <DialogHeader>
            <DialogTitle>{data ? "Edit Item" : "Create New Item"}</DialogTitle>
            <DialogDescription>
              Fill in the details to {data ? "update" : "create"} item.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={data ? handleSubmit(onEdit) : handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  name="name"
                  type="text"
                  label="Name:"
                  register={register}
                  watch={watch}
                  errors={errors.name}
                />
              </div>
              <div className="space-y-2">
                <SelectForm
                  options={categoryOptions}
                  placeholder="Category:"
                  name="category"
                  control={control}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  name="quantity"
                  registerOptions={{ valueAsNumber: true }}
                  step="any"
                  type="number"
                  label="Quantity:"
                  register={register}
                  watch={watch}
                  errors={errors.quantity}
                />
              </div>
              <div className="space-y-2">
                <Input
                  name="price"
                  registerOptions={{ valueAsNumber: true }}
                  step="any"
                  type="number"
                  label="Purchased Price:"
                  register={register}
                  unit="$ per item"
                  watch={watch}
                  errors={errors.price}
                />
              </div>
            </div>
            <div className="gap-4">
              <UploadForm
                setError={setError}
                control={control}
                name="imageUrl"
                errors={errors.imageUrl && errors.imageUrl[0]}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {data && (
                <ConfirmationModal
                  isClicked={isDeleting}
                  trigger={() => onDelete(data?.id)}
                  title="Delete data"
                />
              )}
              <Button type="submit" disabled={isAdding || isEditting}>
                {isAdding
                  ? "Saving..."
                  : isEditting
                    ? "Updating..."
                    : data
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
