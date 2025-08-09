import { FormSchema} from '../types';

interface CreateFormProps {
  form: FormSchema;
  setForm: (form: FormSchema) => void;
  onSave: (form: FormSchema) => void;
}

export const CreateForm: React.FC<CreateFormProps> = ({ form, setForm, onSave }) => {
  return <div>Create Form Component</div>;
};