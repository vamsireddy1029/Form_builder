import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, Edit3, Trash2, ChevronUp, ChevronDown, 
  Eye, Layers, Settings, Sparkles, Code, FileText,
  Calendar, CheckSquare, Radio, Type, Hash, AlignLeft,
  AlertTriangle
} from 'lucide-react';

type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password';
  value?: number | string;
  message: string;
}

interface SelectOption {
  label: string;
  value: string;
}

interface FormField {
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

interface FormSchema {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
}

interface FormState {
  [fieldId: string]: string | string[];
}

interface FormErrors {
  [fieldId: string]: string;
}

const FormBuilderApp: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<'create' | 'preview' | 'myforms'>('create');
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [currentForm, setCurrentForm] = useState<FormSchema>({
    id: '',
    name: '',
    fields: [],
    createdAt: ''
  });
  const [previewForm, setPreviewForm] = useState<FormSchema | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = () => {
    const stored = sessionStorage.getItem('formBuilderSchemas');
    if (stored) {
      setForms(JSON.parse(stored));
    }
  };

  const saveForms = (updatedForms: FormSchema[]) => {
    sessionStorage.setItem('formBuilderSchemas', JSON.stringify(updatedForms));
    setForms(updatedForms);
  };

  const deleteForm = (formId: string) => {
    const updatedForms = forms.filter(form => form.id !== formId);
    saveForms(updatedForms);
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    successDiv.textContent = 'Form deleted successfully!';
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      successDiv.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(successDiv), 300);
    }, 3000);
  };

  const Navigation = () => (
    <nav className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-2xl">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Form Builder</h1>
          </div>
          <div className="flex items-center space-x-2">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'myforms', label: 'My Forms', icon: Layers }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentRoute(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentRoute === id
                    ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  if (currentRoute === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Navigation />
        <CreateForm 
          form={currentForm} 
          setForm={setCurrentForm}
          onSave={(form) => {
            const updatedForms = [...forms, form];
            saveForms(updatedForms);
          }}
        />
      </div>
    );
  }

  if (currentRoute === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navigation />
        <PreviewForm form={previewForm || currentForm} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navigation />
      <MyForms 
        forms={forms} 
        onPreview={(form) => {
          setPreviewForm(form);
          setCurrentRoute('preview');
        }}
        onDelete={deleteForm}
      />
    </div>
  );
};

const CreateForm: React.FC<{
  form: FormSchema;
  setForm: (form: FormSchema) => void;
  onSave: (form: FormSchema) => void;
}> = ({ form, setForm, onSave }) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldConfigOpen, setFieldConfigOpen] = useState(false);

  const fieldTypes = [
    { value: 'text' as FieldType, label: 'Text Field', icon: Type, color: 'from-blue-500 to-blue-600' },
    { value: 'number' as FieldType, label: 'Number', icon: Hash, color: 'from-emerald-500 to-emerald-600' },
    { value: 'textarea' as FieldType, label: 'Text Area', icon: AlignLeft, color: 'from-purple-500 to-purple-600' },
    { value: 'select' as FieldType, label: 'Dropdown', icon: Code, color: 'from-orange-500 to-orange-600' },
    { value: 'radio' as FieldType, label: 'Radio', icon: Radio, color: 'from-pink-500 to-pink-600' },
    { value: 'checkbox' as FieldType, label: 'Checkbox', icon: CheckSquare, color: 'from-indigo-500 to-indigo-600' },
    { value: 'date' as FieldType, label: 'Date', icon: Calendar, color: 'from-red-500 to-red-600' }
  ];

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      validationRules: [],
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? [
        { label: 'Option 1', value: 'option1' }
      ] : undefined
    };
    setEditingField(newField);
    setFieldConfigOpen(true);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const deleteField = (fieldId: string) => {
    setForm({
      ...form,
      fields: form.fields.filter(field => field.id !== fieldId)
    });
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = form.fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= form.fields.length) return;

    const newFields = [...form.fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    
    setForm({ ...form, fields: newFields });
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    const savedForm: FormSchema = {
      ...form,
      id: `form_${Date.now()}`,
      name: formName,
      createdAt: new Date().toISOString()
    };

    onSave(savedForm);
    setSaveDialogOpen(false);
    setFormName('');
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    successDiv.textContent = 'Form saved successfully!';
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      successDiv.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(successDiv), 300);
    }, 3000);
  };

  const saveField = (field: FormField) => {
    if (form.fields.find(f => f.id === field.id)) {
      updateField(field.id, field);
    } else {
      setForm({ ...form, fields: [...form.fields, field] });
    }
    setFieldConfigOpen(false);
    setEditingField(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Forms
          </h2>
          <p className="text-gray-600 mt-2">Drag, drop, and design forms...</p>
        </div>
        <button
          onClick={() => setSaveDialogOpen(true)}
          disabled={form.fields.length === 0}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Field Types Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-purple-600" />
              Add Fields
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {fieldTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => addField(type.value)}
                    className={`group relative overflow-hidden bg-gradient-to-r ${type.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Fields Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-purple-600" />
              Form Fields ({form.fields.length})
            </h3>
            
            {form.fields.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-purple-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-700 mb-2">No fields yet</h4>
                <p className="text-gray-500">Start building your form by adding fields from the left panel</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.fields.map((field, index) => (
                  <div key={field.id} className="group bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                          <h4 className="font-semibold text-gray-800">{field.label}</h4>
                        </div>
                        <div className="flex items-center space-x-2 ml-5">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              Required
                            </span>
                          )}
                          {field.isDerived && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Derived
                            </span>
                          )}
                          {field.validationRules.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              {field.validationRules.length} rules
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => moveField(field.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveField(field.id, 'down')}
                          disabled={index === form.fields.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingField(field);
                            setFieldConfigOpen(true);
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform scale-100 transition-transform">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Save Your Form</h3>
            <input
              type="text"
              placeholder="Enter form name..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSaveDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Save Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Config Dialog */}
      {editingField && (
        <FieldConfigDialog
          open={fieldConfigOpen}
          field={editingField}
          allFields={form.fields}
          onSave={saveField}
          onClose={() => {
            setFieldConfigOpen(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

const FieldConfigDialog: React.FC<{
  open: boolean;
  field: FormField;
  allFields: FormField[];
  onSave: (field: FormField) => void;
  onClose: () => void;
}> = ({ open, field, allFields, onSave, onClose }) => {
  const [localField, setLocalField] = useState<FormField>(field);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const updateField = (updates: Partial<FormField>) => {
    setLocalField(prev => ({ ...prev, ...updates }));
  };

  const addValidationRule = (type: ValidationRule['type']) => {
    const rule: ValidationRule = {
      type,
      message: `Invalid ${type}`,
      ...(type === 'minLength' || type === 'maxLength' ? { value: 0 } : {})
    };
    updateField({
      validationRules: [...localField.validationRules, rule]
    });
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const newRules = [...localField.validationRules];
    newRules[index] = { ...newRules[index], ...updates };
    updateField({ validationRules: newRules });
  };

  const removeValidationRule = (index: number) => {
    updateField({
      validationRules: localField.validationRules.filter((_, i) => i !== index)
    });
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    const options = localField.options || [];
    updateField({
      options: [...options, { label: newOption, value: newOption.toLowerCase().replace(/\s+/g, '') }]
    });
    setNewOption('');
  };

  const removeOption = (index: number) => {
    const options = localField.options || [];
    updateField({
      options: options.filter((_, i) => i !== index)
    });
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Configure Field
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Field Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
            <input
              type="text"
              value={localField.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-800">Required Field</h4>
              <p className="text-sm text-gray-600">Make this field mandatory</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localField.required}
                onChange={(e) => updateField({ required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Default Value */}
          {(localField.type === 'text' || localField.type === 'textarea' || localField.type === 'number') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Value</label>
              <input
                type="text"
                value={localField.defaultValue || ''}
                onChange={(e) => updateField({ defaultValue: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          {/* Options */}
          {(localField.type === 'select' || localField.type === 'radio' || localField.type === 'checkbox') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="space-y-2 mb-4">
                {localField.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const options = [...(localField.options || [])];
                        options[index] = { ...options[index], label: e.target.value };
                        updateField({ options });
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="New option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Validation Rules */}
          {!localField.isDerived && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Validation Rules</label>
              <div className="space-y-2 mb-4">
                {localField.validationRules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {rule.type}
                    </span>
                    {(rule.type === 'minLength' || rule.type === 'maxLength') && (
                      <input
                        type="number"
                        value={rule.value || 0}
                        onChange={(e) => updateValidationRule(index, { value: parseInt(e.target.value) })}
                        className="w-20 p-1 border border-gray-300 rounded text-sm"
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Error message"
                      value={rule.message}
                      onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                      className="flex-1 p-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => removeValidationRule(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['required', 'minLength', 'maxLength', 'email', 'password'].map(type => (
                  <button
                    key={type}
                    onClick={() => addValidationRule(type as ValidationRule['type'])}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(localField)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Save Field
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewForm: React.FC<{ form: FormSchema }> = ({ form }) => {
  const [formState, setFormState] = useState<FormState>({});
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const initialState: FormState = {};
    form.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialState[field.id] = field.defaultValue;
      } else if (field.type === 'checkbox') {
        initialState[field.id] = [];
      } else {
        initialState[field.id] = '';
      }
    });
    setFormState(initialState);
  }, [form]);

  useEffect(() => {
    const derivedFields = form.fields.filter(f => f.isDerived);
    const newState = { ...formState };

    derivedFields.forEach(field => {
      if (field.parentFields && field.derivationFormula) {
        try {
          const parentValues: { [key: string]: any } = {};
          field.parentFields.forEach(parentId => {
            const parentField = form.fields.find(f => f.id === parentId);
            if (parentField) {
              parentValues[`parentField${field.parentFields?.indexOf(parentId)! + 1}`] = formState[parentId];
            }
          });
          const result = new Function(...Object.keys(parentValues), `return ${field.derivationFormula}`)(...Object.values(parentValues));
          newState[field.id] = String(result);
        } catch (error) {
          newState[field.id] = 'Error';
        }
      }
    });

    if (JSON.stringify(newState) !== JSON.stringify(formState)) {
      setFormState(newState);
    }
  }, [formState, form.fields]);

  const validateField = (field: FormField, value: string | string[]): string => {
    for (const rule of field.validationRules) {
      switch (rule.type) {
        case 'required':
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return rule.message;
          }
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < (rule.value as number)) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > (rule.value as number)) {
            return rule.message;
          }
          break;
        case 'email':
          if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return rule.message;
          }
          break;
        case 'password':
          if (typeof value === 'string' && (value.length < 8 || !/\d/.test(value))) {
            return rule.message;
          }
          break;
      }
    }
    return '';
  };

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setFormState(prev => ({ ...prev, [fieldId]: value }));
    
    const field = form.fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldId]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    form.fields.forEach(field => {
      if (!field.isDerived) {
        const error = validateField(field, formState[field.id]);
        if (error) newErrors[field.id] = error;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm';
      successDiv.innerHTML = `
        <div class="bg-white rounded-2xl p-8 shadow-2xl transform scale-100 transition-transform max-w-md mx-4 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Form Submitted!</h3>
          <p class="text-gray-600">Your form has been successfully submitted.</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Close
          </button>
        </div>
      `;
      document.body.appendChild(successDiv);
    }
  };

  const renderField = (field: FormField) => {
    const value = formState[field.id];
    const error = errors[field.id];

    const fieldClasses = `w-full p-4 border-2 rounded-xl transition-all duration-300 ${
      error 
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200' 
        : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200'
    } ${field.isDerived ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'} outline-none`;

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.isDerived}
              className={fieldClasses}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.isDerived}
              className={fieldClasses}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              rows={4}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.isDerived}
              className={fieldClasses}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.isDerived}
              className={fieldClasses}
            />
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={field.isDerived}
              className={fieldClasses}
            >
              <option value="">Choose an option...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name={field.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      disabled={field.isDerived}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-all duration-200 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={checkboxValues.includes(option.value)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...checkboxValues, option.value]
                          : checkboxValues.filter(v => v !== option.value);
                        handleFieldChange(field.id, newValues);
                      }}
                      disabled={field.isDerived}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-all duration-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm flex items-center mt-2">⚠️ {error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (!form.fields || form.fields.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Form to Preview</h3>
          <p className="text-gray-600 mb-6">Create a form first, then come back to see how it looks!</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Go Back to Create
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-4">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {form.name || 'Form Preview'}
        </h2>
        <p className="text-gray-600">Fill out the form below to see how it works</p>
      </div>

      {/* Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2"></div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {form.fields.map(field => (
              <div key={field.id} className="group">
                {field.isDerived && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🤖 Auto-calculated
                    </span>
                  </div>
                )}
                {renderField(field)}
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <span>Submit Form</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmDeleteDialog: React.FC<{
  isOpen: boolean;
  formName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, formName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform scale-100 transition-transform">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Form</h3>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete "<span className="font-semibold text-gray-800">{formName}</span>"? 
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Delete Form
          </button>
        </div>
      </div>
    </div>
  );
};

const MyForms: React.FC<{
  forms: FormSchema[];
  onPreview: (form: FormSchema) => void;
  onDelete: (formId: string) => void;
}> = ({ forms, onPreview, onDelete }) => {
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; formId: string; formName: string }>({
    isOpen: false,
    formId: '',
    formName: ''
  });

  const handleDeleteClick = (form: FormSchema) => {
    setDeleteDialog({
      isOpen: true,
      formId: form.id,
      formName: form.name
    });
  };

  const handleDeleteConfirm = () => {
    onDelete(deleteDialog.formId);
    setDeleteDialog({ isOpen: false, formId: '', formName: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, formId: '', formName: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4">
          <Layers className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          My Forms ({forms.length})
        </h2>
        <p className="text-gray-600">Manage and preview your created forms</p>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Forms Yet</h3>
          <p className="text-gray-600 mb-6">Start creating beautiful forms to see them here</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Create Your First Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forms.map((form, index) => (
            <div
              key={form.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-2"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {form.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Created {new Date(form.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{form.fields.length}</div>
                      <div className="text-xs text-gray-500">fields</div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(form)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Delete form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {form.fields.slice(0, 4).map(field => (
                      <span
                        key={field.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {field.label.length > 10 ? field.label.substring(0, 10) + '...' : field.label}
                      </span>
                    ))}
                    {form.fields.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{form.fields.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onPreview(form)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Form</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialog.isOpen}
        formName={deleteDialog.formName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default FormBuilderApp;