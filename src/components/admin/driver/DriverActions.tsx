
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
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  
  return (
    <CardFooter className="flex justify-center gap-4 pt-4">
      <Button 
        variant="outline" 
        className="bg-green-50 hover:bg-green-100 border-green-200 disabled:opacity-50"
        onClick={onApprove}
        disabled={processingAction || isApproved}
      >
        <Check size={16} className="ml-1" />
        {isApproved ? "تم القبول" : "قبول"}
      </Button>
      
      <Button 
        variant="destructive"
        onClick={onReject}
        disabled={processingAction || isRejected}
        className="disabled:opacity-50"
      >
        <X size={16} className="ml-1" />
        {isRejected ? "تم الرفض" : "رفض"}
      </Button>
    </CardFooter>
  );
};
