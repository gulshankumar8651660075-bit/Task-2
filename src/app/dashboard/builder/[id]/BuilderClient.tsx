'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Eye, Plus, ArrowUp, ArrowDown, Trash2, 
  Settings, Layers, Palette, EyeOff, CheckCircle2, ChevronRight, X 
} from 'lucide-react';

interface Field {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
}

interface InitialForm {
  id: string;
  title: string;
  description: string;
  fields: Field[];
  theme: FormTheme;
  published: boolean;
}

export default function BuilderClient({ initialForm }: { initialForm: InitialForm }) {
  const router = useRouter();
  
  // Form configuration state
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description);
  const [fields, setFields] = useState<Field[]>(initialForm.fields);
  const [theme, setTheme] = useState<FormTheme>(initialForm.theme);
  const [published, setPublished] = useState(initialForm.published);

  // Builder UI state
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'theme'>('fields');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Selected field details
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // Field Types definition
  const fieldTypes = [
    { type: 'text', label: 'Short Text', defaultPlaceholder: 'Enter your answer' },
    { type: 'textarea', label: 'Long Text', defaultPlaceholder: 'Type your message here' },
    { type: 'email', label: 'Email', defaultPlaceholder: 'name@example.com' },
    { type: 'number', label: 'Number', defaultPlaceholder: '0' },
    { type: 'dropdown', label: 'Dropdown Select', defaultPlaceholder: 'Select an option', options: ['Option 1', 'Option 2', 'Option 3'] },
    { type: 'radio', label: 'Radio Buttons', options: ['Option 1', 'Option 2'] },
    { type: 'checkbox', label: 'Checkboxes', options: ['Option 1'] },
    { type: 'date', label: 'Date Picker', defaultPlaceholder: 'Select date' },
  ];

  // Add field
  const handleAddField = (typeInfo: typeof fieldTypes[0]) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      type: typeInfo.type,
      label: `New ${typeInfo.label}`,
      placeholder: typeInfo.defaultPlaceholder || '',
      required: false,
      options: typeInfo.options ? [...typeInfo.options] : undefined,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  // Delete field
  const handleDeleteField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFields(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  // Move field up
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index - 1];
    newFields[index - 1] = temp;
    setFields(newFields);
  };

  // Move field down
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[index + 1];
    newFields[index + 1] = temp;
    setFields(newFields);
  };

  // Update selected field property
  const handleUpdateField = (updated: Partial<Field>) => {
    setFields(
      fields.map((f) => (f.id === selectedFieldId ? { ...f, ...updated } : f))
    );
  };

  // Save form configurations
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch(`/api/forms/${initialForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          fields,
          theme,
          published,
        }),
      });

      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-900 bg-slate-950 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              Form<span className="text-teal-400">Flow</span> Builder
            </span>
            <span className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Label */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <span className={`w-2.5 h-2.5 rounded-full ${published ? 'bg-teal-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-semibold text-slate-400">{published ? 'Live' : 'Draft'}</span>
          </div>

          <button
            onClick={() => window.open(`/share/${initialForm.id}`, '_blank')}
            disabled={!published}
            title={published ? 'Preview form' : 'Publish the form to enable preview'}
            className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/10 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* Save Success Toast */}
      {saveStatus === 'success' && (
        <div className="absolute top-20 right-6 z-50 px-4 py-3 bg-emerald-500 text-slate-950 rounded-xl font-bold shadow-2xl flex items-center gap-2 border border-emerald-400/20 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Form saved successfully!</span>
        </div>
      )}

      {/* Builder Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Field Library */}
        <aside className="w-72 bg-slate-950 border-r border-slate-900 overflow-y-auto p-5 space-y-6 hidden lg:block">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Input Field Types</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {fieldTypes.map((typeInfo) => (
                <button
                  key={typeInfo.type}
                  onClick={() => handleAddField(typeInfo)}
                  className="w-full text-left p-3.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition flex items-center justify-between group"
                >
                  <span>{typeInfo.label}</span>
                  <Plus className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:scale-110 transition" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Live Visual Canvas */}
        <main className="flex-1 bg-slate-900/20 overflow-y-auto p-6 md:p-12 flex justify-center">
          <div className="w-full max-w-2xl space-y-8">
            {/* Visual canvas alert if empty */}
            {fields.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
                <p className="text-slate-500 text-sm mb-4">No fields added yet. Click types on the left to add fields.</p>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto lg:hidden">
                  {fieldTypes.map((typeInfo) => (
                    <button
                      key={typeInfo.type}
                      onClick={() => handleAddField(typeInfo)}
                      className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold hover:border-teal-500 text-slate-300 hover:text-white transition"
                    >
                      + {typeInfo.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Simulated Live Form Viewer */}
            <div 
              style={{ 
                borderRadius: theme.borderRadius,
                fontFamily: theme.fontFamily === 'Inter' ? 'inherit' : theme.fontFamily 
              }}
              className="bg-white text-slate-950 p-8 shadow-2xl border border-slate-200 transition-all duration-300"
            >
              {/* Form Title & Description Header */}
              <div className="border-b border-slate-100 pb-6 mb-6">
                <h1 style={{ color: theme.textColor }} className="text-3xl font-extrabold mb-2">
                  {title || 'Untitled Form'}
                </h1>
                <p className="text-slate-500 text-sm">
                  {description || 'Provide form description...'}
                </p>
              </div>

              {/* Render Field Previews */}
              <div className="space-y-6">
                {fields.map((field, index) => {
                  const isSelected = field.id === selectedFieldId;
                  return (
                    <div
                      key={field.id}
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        setActiveTab('fields');
                      }}
                      className={`relative p-5 border rounded-xl cursor-pointer transition duration-200 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/20 shadow-md ring-1 ring-teal-500/20'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Field Action Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:opacity-100 transition duration-150">
                        <button
                          disabled={index === 0}
                          onClick={(e) => handleMoveUp(index, e)}
                          title="Move Up"
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === fields.length - 1}
                          onClick={(e) => handleMoveDown(index, e)}
                          title="Move Down"
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteField(field.id, e)}
                          title="Remove Field"
                          className="p-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Label */}
                      <label className="block text-slate-700 text-sm font-bold mb-2">
                        {field.label}
                        {field.required && <span className="text-rose-500 ml-1">*</span>}
                      </label>

                      {/* Inputs Previews */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          disabled
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm"
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          disabled
                          rows={2}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm resize-none"
                        />
                      )}

                      {field.type === 'email' && (
                        <input
                          type="email"
                          disabled
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm"
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          disabled
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm"
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          disabled
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-400"
                        />
                      )}

                      {field.type === 'dropdown' && (
                        <select disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-400">
                          <option>{field.placeholder || 'Select an option'}</option>
                          {field.options?.map((opt, i) => (
                            <option key={i}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'radio' && (
                        <div className="space-y-2">
                          {field.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="radio" disabled className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-200" />
                              <span className="text-slate-600 text-sm">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="space-y-2">
                          {field.options?.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="checkbox" disabled className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-200 rounded" />
                              <span className="text-slate-600 text-sm">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Settings & properties customizer */}
        <aside className="w-80 bg-slate-950 border-l border-slate-900 flex flex-col max-h-screen overflow-hidden">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-900 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 py-4 text-center font-bold tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition ${
                activeTab === 'fields'
                  ? 'border-teal-500 text-teal-400 bg-slate-900/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Properties</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-4 text-center font-bold tracking-wider uppercase border-b-2 flex items-center justify-center gap-2 transition ${
                activeTab === 'theme'
                  ? 'border-teal-500 text-teal-400 bg-slate-900/20'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Theme / Form</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'fields' && (
              <div className="space-y-6">
                {selectedField ? (
                  <div className="space-y-5">
                    {/* Header showing selected field type */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {selectedField.type.toUpperCase()} FIELD
                      </span>
                      <button
                        onClick={() => setSelectedFieldId(null)}
                        className="text-slate-500 hover:text-slate-300 p-1 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Property: Label */}
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => handleUpdateField({ label: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Property: Placeholder (for support types) */}
                    {['text', 'textarea', 'email', 'number', 'dropdown'].includes(selectedField.type) && (
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={selectedField.placeholder || ''}
                          onChange={(e) => handleUpdateField({ placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    )}

                    {/* Property: Options list (for selector types) */}
                    {['dropdown', 'radio', 'checkbox'].includes(selectedField.type) && (
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                          Options (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={selectedField.options?.join('\n') || ''}
                          onChange={(e) => 
                            handleUpdateField({ 
                              options: e.target.value.split('\n').filter((opt) => opt.trim() !== '') 
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    )}

                    {/* Property: Required toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-850 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200">Required Field</span>
                        <span className="text-xs text-slate-500">Validation forces submission data</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={(e) => handleUpdateField({ required: e.target.checked })}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-800 rounded bg-slate-900"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500">
                    <Settings className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Click a field in the form canvas to customize its parameters.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                {/* Section 1: Form Properties */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Form Header</h4>
                  
                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Form Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Form Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>
                </div>

                {/* Section 2: Visibility */}
                <div className="space-y-3 border-t border-slate-900 pt-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Form Status</h4>
                  <div className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-850 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-200">Published Status</span>
                      <span className="text-xs text-slate-500">If checked, form accepts public entries</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-800 rounded bg-slate-900"
                    />
                  </div>
                </div>

                {/* Section 3: Visual Styling */}
                <div className="space-y-4 border-t border-slate-900 pt-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Form Theme Colors</h4>
                  
                  {/* Colors selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Primary Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={theme.primaryColor}
                          onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-800 bg-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-400">{theme.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Text Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={theme.textColor}
                          onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-800 bg-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-400">{theme.textColor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Border Radius</label>
                    <select
                      value={theme.borderRadius}
                      onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="0px">Sharp (0px)</option>
                      <option value="4px">Soft (4px)</option>
                      <option value="8px">Standard (8px)</option>
                      <option value="16px">Rounded (16px)</option>
                      <option value="24px">Extra Rounded (24px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Font Family</label>
                    <select
                      value={theme.fontFamily}
                      onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-800 bg-slate-900 text-white rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="Inter">System (Inter)</option>
                      <option value="Georgia">Serif (Georgia)</option>
                      <option value="Courier New">Monospace</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
