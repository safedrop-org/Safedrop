import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SecurityQuestionFieldProps {
  questionId: string;
  answerId: string;
  questionLabel: string;
  answerLabel: string;
  questionValue: string;
  answerValue: string;
  questionPlaceholder: string;
  answerPlaceholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SecurityQuestionField: React.FC<SecurityQuestionFieldProps> = ({
  questionId,
  answerId,
  questionLabel,
  answerLabel,
  questionValue,
  answerValue,
  questionPlaceholder,
  answerPlaceholder,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={questionId}>{questionLabel}</Label>
        <Input
          id={questionId}
          name={questionId}
          value={questionValue}
          onChange={onChange}
          placeholder={questionPlaceholder}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor={answerId}>{answerLabel}</Label>
        <Input
          id={answerId}
          name={answerId}
          value={answerValue}
          onChange={onChange}
          placeholder={answerPlaceholder}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default SecurityQuestionField;
