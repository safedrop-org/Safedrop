
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  processing: boolean;
}

export const RejectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  rejectionReason,
  onReasonChange,
  processing
}: RejectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-right">
        <DialogHeader>
          <DialogTitle className="text-center">رفض طلب السائق</DialogTitle>
          <DialogDescription className="text-center">
            الرجاء كتابة سبب الرفض ليتم إبلاغ السائق به
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            placeholder="سبب الرفض"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={4}
            className="text-right"
          />
        </div>
        
        <DialogFooter className="flex sm:justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? "جاري المعالجة..." : "تأكيد الرفض"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
