import React from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface RatingStarsProps {
  rating: number | null;
  onRatingChange: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, onRatingChange }) => {
  const { t } = useLanguage();

  return (
    <div>
      <label className="block mb-1 font-semibold text-gray-700">
        {t("Rating") || "التقييم"}
      </label>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className="focus:outline-none"
            onClick={() => onRatingChange(value)}
          >
            <Star
              className={`h-8 w-8 ${
                rating && value <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {rating && (
        <p className="text-sm text-gray-600">
          {rating} out of 5 stars
        </p>
      )}
    </div>
  );
};

export default RatingStars;
