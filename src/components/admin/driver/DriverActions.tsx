
import React from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface DriverActionsProps {
  status?: string;
  onApprove: () => void;
  onReject: () => void;
  processingAction: boolean;
}

export const DriverActions = ({
  status,
  onApprove,
  onReject,
  processingAction
}: DriverActionsProps) => {
  return (
    <CardFooter className="flex justify-center gap-4 pt-4">
      <Button 
        variant="outline" 
        className="bg-green-50 hover:bg-green-100 border-green-200"
        onClick={onApprove}
        disabled={processingAction || status === "approved"}
      >
        <Check size={16} className="ml-1" /> قبول
      </Button>
      
      <Button 
        variant="destructive"
        onClick={onReject}
        disabled={processingAction || status === "rejected"}
      >
        <X size={16} className="ml-1" /> رفض
      </Button>
    </CardFooter>
  );
};
