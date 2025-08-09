export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number | string;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: string | string[];
  validationRules: ValidationRule[];
  options?: SelectOption[];
  isDerived?: boolean;
  parentFields?: string[];
  derivationFormula?: string;
}

export interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

export interface FormState {
  [fieldId: string]: string | string[];
}

export interface FormErrors {
  [fieldId: string]: string;
}