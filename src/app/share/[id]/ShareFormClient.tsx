'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

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

interface FormConfig {
  id: string;
  title: string;
  description: string;
  fields: Field[];
  theme: FormTheme;
  published: boolean;
}

export default function ShareFormClient({ form }: { form: FormConfig }) {
  const { title, description, fields, theme, published } = form;

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Handle inputs changes
  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers({ ...answers, [fieldId]: value });
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  // Handle multi-checkbox changes
  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const currentList = answers[fieldId] || [];
    let newList;
    if (checked) {
      newList = [...currentList, option];
    } else {
      newList = currentList.filter((opt: string) => opt !== option);
    }
    handleInputChange(fieldId, newList);
  };

  // Validate form client-side
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const val = answers[field.id];
      const isMissing = val === undefined || val === null || String(val).trim() === '' || (Array.isArray(val) && val.length === 0);

      if (field.required && isMissing) {
        newErrors[field.id] = `${field.label} is required`;
      }
    }
    return newErrors;
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!published) {
      setGeneralError('This form is not accepting responses anymore.');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          setErrors(data.fields);
        } else {
          throw new Error(data.error || 'Failed to submit form');
        }
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while submitting your response.');
    } finally {
      setSubmitting(false);
    }
  };

  // Custom styling elements based on themes
  const customStyles = {
    fontFamily: theme.fontFamily === 'Inter' ? 'inherit' : theme.fontFamily,
    color: theme.textColor || '#0f172a',
  };

  const primaryBtnStyle = {
    backgroundColor: theme.primaryColor || '#0f766e',
    borderRadius: theme.borderRadius || '8px',
  };

  const inputStyle = {
    borderRadius: theme.borderRadius || '8px',
  };

  // Success state UI
  if (submitted) {
    return (
      <div 
        style={{ 
          ...customStyles,
          borderRadius: theme.borderRadius
        }}
        className={`w-full max-w-lg bg-white border border-slate-200 p-10 shadow-2xl text-center flex flex-col items-center gap-6 ${theme.borderRadius ? '' : 'rounded-2xl'}`}
      >
        <div 
          style={{ color: theme.primaryColor }}
          className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-2"
        >
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold" style={{ color: theme.textColor }}>Submission Success</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Thank you! Your response has been recorded in real-time. You may close this window.
        </p>
      </div>
    );
  }

  // General error state UI
  if (!published && !submitted) {
    return (
      <div className="w-full max-w-lg bg-white border border-slate-200 p-8 rounded-2xl shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Form Closed</h3>
        <p className="text-slate-500 text-sm">
          This form is currently a draft or has been unpublished by the creator.
        </p>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        borderRadius: theme.borderRadius,
        fontFamily: theme.fontFamily === 'Inter' ? 'inherit' : theme.fontFamily
      }}
      className="w-full max-w-xl bg-white border border-slate-200 p-8 md:p-10 shadow-2xl"
    >
      {/* Form Title & Description Header */}
      <div className="border-b border-slate-100 pb-6 mb-8">
        <h1 style={{ color: theme.textColor }} className="text-3xl font-extrabold mb-3">
          {title || 'Form'}
        </h1>
        {description && (
          <p className="text-slate-500 text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {generalError && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Interactive form body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col">
            <label className="block text-slate-700 text-sm font-bold mb-2">
              {field.label}
              {field.required && <span className="text-rose-500 ml-1">*</span>}
            </label>

            {/* Inputs based on type */}
            {field.type === 'text' && (
              <input
                type="text"
                required={field.required}
                disabled={submitting}
                style={inputStyle}
                placeholder={field.placeholder}
                value={answers[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-teal-500 text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 transition duration-200"
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                rows={3}
                required={field.required}
                disabled={submitting}
                style={inputStyle}
                placeholder={field.placeholder}
                value={answers[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-teal-500 text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 transition duration-200"
              />
            )}

            {field.type === 'email' && (
              <input
                type="email"
                required={field.required}
                disabled={submitting}
                style={inputStyle}
                placeholder={field.placeholder}
                value={answers[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-teal-500 text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 transition duration-200"
              />
            )}

            {field.type === 'number' && (
              <input
                type="number"
                required={field.required}
                disabled={submitting}
                style={inputStyle}
                placeholder={field.placeholder}
                value={answers[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-teal-500 text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 transition duration-200"
              />
            )}

            {field.type === 'date' && (
              <input
                type="date"
                required={field.required}
                disabled={submitting}
                style={inputStyle}
                value={answers[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-teal-500 text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 transition duration-200"
              />
            )}

            {field.type === 'dropdown' && (
              <select
                required={field.required}
                disabled={submitting}
                style={inputStyle}
                value={answers[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-teal-500 text-sm text-slate-700 bg-white focus:ring-1 focus:ring-teal-500 transition duration-200"
              >
                <option value="">{field.placeholder || 'Select an option'}</option>
                {field.options?.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {field.type === 'radio' && (
              <div className="space-y-2 mt-1">
                {field.options?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={field.id}
                      required={field.required && !answers[field.id]}
                      disabled={submitting}
                      value={opt}
                      checked={answers[field.id] === opt}
                      onChange={() => handleInputChange(field.id, opt)}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-200"
                    />
                    <span className="text-slate-600 text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="space-y-2 mt-1">
                {field.options?.map((opt, i) => {
                  const isChecked = (answers[field.id] || []).includes(opt);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={submitting}
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-200 rounded"
                      />
                      <span className="text-slate-600 text-sm">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error message */}
            {errors[field.id] && (
              <span className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors[field.id]}</span>
              </span>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          style={primaryBtnStyle}
          className="w-full py-4 text-white text-base font-bold transition duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.99]"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Submitting Response...</span>
            </span>
          ) : (
            <span>Submit Response</span>
          )}
        </button>
      </form>
    </div>
  );
}
