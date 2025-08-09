import { FormSchema} from '../types';

interface PreviewFormProps {
  form: FormSchema;
}
export const PreviewForm: React.FC<PreviewFormProps> = ({ form }) => {
  return <div>Preview Form Component</div>;
};