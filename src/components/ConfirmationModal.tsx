import React from "react";
import {
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
interface ConfirmationProps {
  trigger: () => void;
  title: string;
  isClicked: boolean;
}

export const ConfirmationModal = ({
  trigger,
  title,
  isClicked,
}: ConfirmationProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="font-semibold font-xl">
          Are you sure you want to delete?
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isClicked}
            onClick={trigger}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
