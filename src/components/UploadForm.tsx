"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, X } from "lucide-react";
import * as React from "react";
import {
  Controller,
  FieldError,
  FieldValues,
  Path,
  UseControllerProps,
  useForm,
  UseFormSetError,
} from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import toast from "react-hot-toast";
import { GroupBase, OptionsOrGroups, SelectInstance } from "react-select";
import { Label } from "@radix-ui/react-dropdown-menu";

const formSchema = z.object({
  files: z
    .array(z.custom<File>())
    .min(1, "Please select at least one file")
    .max(2, "Please select up to 2 files")
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "File size must be less than 5MB",
      path: ["files"],
    }),
});

type FormValues = z.infer<typeof formSchema>;
interface UploadFormProps<T extends FieldValues> extends UseControllerProps<T> {
  errors?: FieldError;
  placeholder?: string;
  className?: string;
  //eslint-disable-next-line
  name: Path<T>;
  setError: UseFormSetError<T>;
  isClearable?: boolean;
  isMulti?: boolean;
  //eslint-disable-next-line
  onChange?: (val: any) => void;
  isDisabled?: boolean;
}

export function UploadForm<T extends FieldValues>({
  control,
  name,
  setError,
  errors,
}: UploadFormProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          <Label className="font-semibold font-xl mb-1">Image:</Label>
          <FileUpload
            value={field.value}
            onValueChange={field.onChange}
            multiple={false}
            accept="image/*"
            maxFiles={1}
            maxSize={5 * 1024 * 1024}
            onFileReject={(_, message) => {
              setError(name, {
                message,
              });
            }}
          >
            <FileUploadDropzone className="flex-row border-dotted">
              <CloudUpload className="size-4" />
              Drag and drop or
              <FileUploadTrigger asChild>
                <Button variant="link" size="sm" className="p-0">
                  choose image
                </Button>
              </FileUploadTrigger>
              to upload
            </FileUploadDropzone>
            {errors && (
              <div className="mt-1 mb-1">
                {errors && <p className="error-message">{errors.message}</p>}
              </div>
            )}
            <FileUploadList>
              {field?.value?.map((file: File, index: number) => (
                <FileUploadItem key={index} value={file}>
                  <FileUploadItemPreview />
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <X />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        </>
      )}
    />
  );
}
