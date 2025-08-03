import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/ui/language-context";

interface CommentInputProps {
  comment: string;
  onCommentChange: (comment: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  comment,
  onCommentChange,
}) => {
  const { t } = useLanguage();

  return (
    <div>
      <label
        htmlFor="comment"
        className="block mb-1 font-semibold text-gray-700"
      >
        {t("Comments (optional)") || "تعليقات (اختياري)"}
      </label>
      <Textarea
        id="comment"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder={
          t("Add your comments about the service here") ||
          "أضف تعليقاتك حول الخدمة هنا"
        }
        rows={4}
      />
    </div>
  );
};

export default CommentInput;
