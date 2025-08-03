import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUploadState } from './types';

interface FileUploadComponentProps {
  fileState: FileUploadState;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  t: (key: string) => string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  fileState,
  onFileChange,
  onRemoveFile,
  t,
}) => {
  const { file, progress } = fileState;

  if (!file) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          onChange={onFileChange}
          accept="image/*,.pdf,.txt"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-600">
            {t("clickToSelectFile")}
          </span>
          <span className="text-xs text-gray-500">
            {t("supportedFileTypes")}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">{file.name}</span>
          <span className="text-xs text-gray-500">
            ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemoveFile}
          className="h-auto p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {progress > 0 && progress < 100 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {t("uploadingFile")} {progress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
