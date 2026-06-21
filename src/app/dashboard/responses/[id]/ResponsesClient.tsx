'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Download, Search, Calendar, FileText, 
  Eye, BarChart2, QrCode, Copy, Check, RefreshCw, Info, AlertCircle 
} from 'lucide-react';

interface Field {
  id: string;
  type: string;
  label: string;
}

interface Submission {
  id: string;
  submittedAt: string;
  answers: Record<string, any>;
}

interface FormInfo {
  title: string;
  description: string | null;
  fields: Field[];
  theme: any;
  views: number;
}

export default function ResponsesClient({ formId }: { formId: string }) {
  const router = useRouter();
  
  const [form, setForm] = useState<FormInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${formId}` : '';

  // Fetch submissions and form configuration
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forms/${formId}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setForm(data.form);
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formId]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!form || submissions.length === 0) return;

    // Header row
    const headers = ['Submission Date', ...form.fields.map((f) => f.label)];
    
    // Content rows
    const rows = submissions.map((sub) => {
      const date = new Date(sub.submittedAt).toLocaleString();
      const answers = form.fields.map((f) => {
        const val = sub.answers[f.id];
        if (Array.isArray(val)) return `"${val.join(', ')}"`;
        return `"${String(val || '').replace(/"/g, '""')}"`;
      });
      return [date, ...answers];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title.toLowerCase().replace(/\s+/g, '_')}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter submissions by searching answers
  const filteredSubmissions = submissions.filter((sub) => {
    if (!search) return true;
    return Object.values(sub.answers).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate stats
  const submissionCount = submissions.length;
  const views = form?.views || 0;
  const conversionRate = views > 0 ? Math.round((submissionCount / views) * 100) : 0;

  // Custom Chart Analytics (Count occurrences for multiple choice fields)
  const getChoiceAnalytics = () => {
    if (!form) return [];
    
    const choiceFields = form.fields.filter((f: any) => 
      ['dropdown', 'radio', 'checkbox'].includes(f.type)
    );

    return choiceFields.map((field: any) => {
      const optionCounts: Record<string, number> = {};
      
      // Initialize options
      const options = field.options || [];
      options.forEach((opt: string) => {
        optionCounts[opt] = 0;
      });

      // Count entries
      submissions.forEach((sub) => {
        const val = sub.answers[field.id];
        if (Array.isArray(val)) {
          val.forEach((opt) => {
            if (optionCounts[opt] !== undefined) optionCounts[opt]++;
          });
        } else if (val) {
          if (optionCounts[val] !== undefined) optionCounts[val]++;
        }
      });

      return {
        fieldLabel: field.label,
        data: Object.entries(optionCounts).map(([option, count]) => ({
          option,
          count
        }))
      };
    });
  };

  const choiceAnalytics = getChoiceAnalytics();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
        <span className="text-slate-400 text-sm">Loading submissions dashboard...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold">Failed to load form responses</h3>
          <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-teal-400 tracking-widest uppercase">Form Responses</span>
              <h1 className="text-lg font-extrabold text-white truncate max-w-[200px] sm:max-w-md">{form.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className={`p-2 border rounded-xl transition ${
                showQR 
                  ? 'border-teal-500 bg-teal-500/10 text-teal-400' 
                  : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Show QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">Copy Link</span>
            </button>
          </div>
        </div>
      </header>

      {/* QR Code Container */}
      {showQR && (
        <div className="bg-slate-900/40 border-b border-slate-900 py-6 px-6 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-xl">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f766e&data=${encodeURIComponent(shareUrl)}`} 
              alt="Form QR Code" 
              className="w-44 h-44"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-200">Scan to fill out form</p>
            <p className="text-xs text-slate-500 select-all font-mono mt-1">{shareUrl}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Views</div>
            <div className="text-3xl font-extrabold text-white">{views}</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><Eye className="w-12 h-12" /></div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Submissions Collected</div>
            <div className="text-3xl font-extrabold text-white">{submissionCount}</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><FileText className="w-12 h-12" /></div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Conversion Rate</div>
            <div className="text-3xl font-extrabold text-white">{conversionRate}%</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><BarChart2 className="w-12 h-12" /></div>
          </div>
        </div>

        {/* Choice Fields Charts Section */}
        {choiceAnalytics.length > 0 && submissions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-teal-500" />
              <span>Interactive Field Analytics</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {choiceAnalytics.map((analysis, index) => (
                <div key={index} className="bg-slate-900/35 border border-slate-900 p-6 rounded-2xl backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-slate-300 mb-4">{analysis.fieldLabel}</h3>
                  <div className="space-y-3">
                    {analysis.data.map((item, idx) => {
                      const percentage = submissionCount > 0 ? Math.round((item.count / submissionCount) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">{item.option}</span>
                            <span className="text-teal-400 font-semibold">{item.count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              style={{ width: `${percentage}%` }}
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions List Container */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              <span>Responses ({filteredSubmissions.length})</span>
            </h2>

            {submissions.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search answers..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-800 bg-slate-950/60 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition rounded-xl"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 flex items-center gap-1.5 shrink-0 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Submissions Table / Empty State */}
          {submissions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-850 rounded-3xl bg-slate-900/5">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-650">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-300 mb-1">No responses yet</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">
                Share your public link and collect responses to see them populate here in real-time.
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 border border-slate-900 rounded-2xl bg-slate-900/10">
              <p className="text-slate-500 text-xs">No responses match your search term.</p>
            </div>
          ) : (
            <div className="border border-slate-900 rounded-2xl overflow-hidden bg-slate-900/10 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold shrink-0">Submission Date</th>
                      {form.fields.map((field) => (
                        <th key={field.id} className="px-6 py-4 font-semibold min-w-[150px]">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-900/30 transition">
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        {form.fields.map((field) => {
                          const val = sub.answers[field.id];
                          let displayValue = '';

                          if (Array.isArray(val)) {
                            displayValue = val.join(', ');
                          } else if (val !== undefined && val !== null) {
                            displayValue = String(val);
                          } else {
                            displayValue = '-';
                          }

                          return (
                            <td key={field.id} className="px-6 py-4 text-slate-200">
                              {displayValue}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
