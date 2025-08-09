import { FormField } from '../types';

interface FieldConfigDialogProps {
  open: boolean;
  field: FormField;
  allFields: FormField[];
  onSave: (field: FormField) => void;
  onClose: () => void;
}

export const FieldConfigDialog: React.FC<FieldConfigDialogProps> = ({
  open, field, allFields, onSave, onClose
}) => {
  return <div>Field Config Dialog</div>;
};