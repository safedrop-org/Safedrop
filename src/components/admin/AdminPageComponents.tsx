import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/ui/language-context';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col lg:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {description}
          </p>
        </div>
        {children && (
          <div className="w-full lg:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

interface AdminTabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  defaultValue,
  children,
}) => {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      {children}
    </Tabs>
  );
};

interface AdminTabsListProps {
  children: React.ReactNode;
}

export const AdminTabsList: React.FC<AdminTabsListProps> = ({ children }) => {
  return (
    <TabsList className="mb-6 grid grid-cols-3 w-full max-w-none lg:max-w-2xl">
      {children}
    </TabsList>
  );
};

interface AdminTabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export const AdminTabsTrigger: React.FC<AdminTabsTriggerProps> = ({
  value,
  children,
}) => {
  return (
    <TabsTrigger
      value={value}
      className="text-xs sm:text-sm px-2 sm:px-4"
    >
      {children}
    </TabsTrigger>
  );
};

interface AdminTabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const AdminTabsContent: React.FC<AdminTabsContentProps> = ({
  value,
  children,
}) => {
  return (
    <TabsContent value={value} className="mt-0">
      {children}
    </TabsContent>
  );
};
