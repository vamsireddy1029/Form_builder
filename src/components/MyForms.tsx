import React from 'react';
import { FormSchema } from '../types';

interface MyFormsProps {
  forms: FormSchema[];
  onPreview: (form: FormSchema) => void;
}

export const MyForms: React.FC<MyFormsProps> = ({ forms, onPreview }) => {
  return <div>My Forms Component</div>;
};