'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Copy, Check, Edit2, Trash2, Eye, FileText, 
  LogOut, BarChart2, Calendar, Clipboard, HelpCircle, RefreshCw 
} from 'lucide-react';

interface FormItem {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  views: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardClient({ username }: { username: string }) {
  const router = useRouter();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Fetch all forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/forms');
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setForms(data);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Create new form
  const handleCreateForm = async () => {
    try {
      setCreating(true);
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const newForm = await res.json();
        router.push(`/dashboard/builder/${newForm.id}`);
      }
    } catch (error) {
      console.error('Error creating form:', error);
    } finally {
      setCreating(false);
    }
  };

  // Duplicate form
  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDuplicatingId(id);
      const res = await fetch(`/api/forms/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        await fetchForms();
      }
    } catch (error) {
      console.error('Error duplicating form:', error);
    } finally {
      setDuplicatingId(null);
    }
  };

  // Delete form
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this form and all its submissions?')) return;

    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setForms(forms.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  // Copy public form link
  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Calculate quick stats
  const totalViews = forms.reduce((acc, curr) => acc + curr.views, 0);
  const totalSubmissions = forms.reduce((acc, curr) => acc + curr.submissionCount, 0);
  const avgConversionRate = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

  // Filtered forms
  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(search.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center">
              <span className="font-black text-slate-950 text-base">F</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Form<span className="text-teal-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Welcome, <span className="text-teal-400 font-semibold">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 rounded-xl text-sm font-medium transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Forms</div>
            <div className="text-3xl font-extrabold text-white">{forms.length}</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><FileText className="w-12 h-12" /></div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Views</div>
            <div className="text-3xl font-extrabold text-white">{totalViews}</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><Eye className="w-12 h-12" /></div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Submissions</div>
            <div className="text-3xl font-extrabold text-white">{totalSubmissions}</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><Clipboard className="w-12 h-12" /></div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg. Conversion Rate</div>
            <div className="text-3xl font-extrabold text-white">{avgConversionRate}%</div>
            <div className="absolute right-4 bottom-4 text-teal-500/10"><BarChart2 className="w-12 h-12" /></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl backdrop-blur-sm">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search forms..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <button
            onClick={handleCreateForm}
            disabled={creating}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Form</span>
          </button>
        </div>

        {/* Forms Table / Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
            <span className="text-slate-400 text-sm">Loading your forms...</span>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/5">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-600">
              <Clipboard className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">No forms found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              {search ? "No forms match your search query." : "Get started by building your very first dynamic form flow!"}
            </p>
            {!search && (
              <button
                onClick={handleCreateForm}
                className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-sm font-bold shadow-md shadow-teal-500/10"
              >
                Create a Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div 
                key={form.id} 
                className="group border border-slate-900 bg-slate-900/20 rounded-2xl hover:border-slate-800 transition duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Upper Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-100 text-lg leading-tight group-hover:text-teal-400 transition truncate pr-4">
                      {form.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      form.published 
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {form.published ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-2 h-10">
                    {form.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-900/60 pt-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{form.views} views</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{form.submissionCount} responses</span>
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-900/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/builder/${form.id}`)}
                      title="Edit Form"
                      className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300 hover:text-white rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/responses/${form.id}`)}
                      title="View Submissions"
                      className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300 hover:text-white rounded-lg transition"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                    {form.published && (
                      <button
                        onClick={(e) => handleCopyLink(form.id, e)}
                        title="Copy Public Link"
                        className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300 hover:text-white rounded-lg transition"
                      >
                        {copiedId === form.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDuplicate(form.id, e)}
                      disabled={duplicatingId === form.id}
                      title="Duplicate Form"
                      className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/40 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(form.id, e)}
                      title="Delete Form"
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
