import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<boolean>;
}

export default function ConfirmAction({ open, onOpenChange, title, description, confirmLabel, destructive, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (await onConfirm()) onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={(value) => { if (!busy) onOpenChange(value); }}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Go back</Button>
          <Button variant={destructive ? "destructive" : "default"} disabled={busy} onClick={confirm}>
            {busy && <Loader2 className="animate-spin" />} {busy ? "Saving…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}