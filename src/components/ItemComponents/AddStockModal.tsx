import { TItem, TUser, users, ZItem, ZStock, ZUser } from "@/lib/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Suspense, useEffect } from "react";
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
import { roleOptions, statusOptions } from "@/const/selectConst";
import { ConfirmationModal } from "../ConfirmationModal";
import useSWR, { mutate } from "swr";
import { DateCalenderForm } from "../DateCalenderForm";
import { numberNaNToNull } from "@/lib/numberNaNToNull";
import { isRequired } from "@/utils/isRequired";
import { UploadForm } from "../UploadForm";
import { filetoBase64 } from "@/lib/binaryToBase64";
import { ISelect } from "@/types/SelectOptions";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

const validatedForm = ZStock.extend({
  inventoryItemId: z.string().min(1, "Item is required"),
  locationId: z.string().min(1, "Location is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be negative"),
  notes: z.string().nullish(),
  id: z.string().optional(),
  lastUpdated: z.string().optional(),
  status: z.string().nullish(),
});

const validatedFormImage = validatedForm.extend({});

export type TData = z.infer<typeof validatedForm>;
export type ItemData = z.infer<typeof validatedFormImage>;
interface ModalProps {
  onClose: () => void;
  isModalOpen: boolean;
  data?: ItemData;
}
export const AddStockModal = ({ isModalOpen, onClose, data }: ModalProps) => {
  const queryParams = useParams();
  const router = useRouter();
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
      inventoryItemId: data ? data.inventoryItemId : (queryParams.id as string),
    },
  });
  const { trigger, isMutating: isAdding } = useSWRMutation(
    "/api/stock/",
    async (url: string, { arg }: { arg: TData }) => {
      const requestData = {
        ...arg,
      };
      return fetcher(url, {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {
        mutate(`/api/item/${queryParams.id}`);
      },
    },
  );
  const { trigger: deleteTrigger, isMutating: isDeleting } = useMutation(
    "delete",
    `/api/stock/${data?.id}`,
    {
      onSuccess: () => {
        mutate(`/api/item/${queryParams.id}`);
      },
    },
  );
  const { trigger: editTrigger, isMutating: isEditting } = useSWRMutation(
    `/api/stock/${data?.id}`,
    async (url: string, { arg }: { arg: TData }) => {
      const requestData = {
        ...arg,
      };
      return fetcher(url, {
        method: "PUT",
        body: JSON.stringify(requestData),
      });
    },
    {
      onSuccess: () => {
        mutate(`/api/item/${queryParams.id}`);
      },
    },
  );
  const { data: quantityLeft } = useSWR<number>(
    `/api/item/${queryParams.id}?quantity=true`,
    fetcher,
    {
      suspense: true,
    },
  );
  const quantityLeftOptions = Array.from(
    { length: quantityLeft ?? 0 },
    (_, i) => ({ label: (i + 1).toString(), value: i + 1 }),
  );

  const onSubmit = async (data: TData) => {
    try {
      if (quantityLeft ?? 0 <= 0) {
        setError(
          "quantity",
          {
            type: "custom",
            message: "All Item Quantity have been used in each location",
          },
          { shouldFocus: true },
        );
      }
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
    } finally {
    }
  };
  console.log(errors);
  console.log(roleOptions);
  const { data: locationsOptions } = useSWR<ISelect[]>(
    `/api/location?selectOption=true`,
    fetcher,
    {
      suspense: true,
    },
  );

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
              <div className="space-y-2 z-[4000]">
                <SelectForm
                  name="locationId"
                  control={control}
                  placeholder="Location:"
                  isClearable={false}
                  options={locationsOptions}
                  errors={errors.locationId}
                />
              </div>
              <div className="space-y-2">
                <SelectForm
                  name="status"
                  control={control}
                  placeholder="Status:"
                  isClearable={false}
                  options={statusOptions}
                  errors={errors.status}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <SelectForm
                  name="quantity"
                  control={control}
                  isClearable={false}
                  placeholder="Quantity:"
                  options={
                    data
                      ? Array.from({ length: data.quantity }, (_, i) => ({
                          label: (i + 1).toString(),
                          value: i + 1,
                        }))
                      : quantityLeftOptions
                  }
                  errors={errors.quantity}
                />
              </div>
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
