import Link from 'next/link';
import { ArrowRight, Sparkles, Layout, Share2, BarChart2, Shield, Settings, ArrowUpRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 bg-slate-950 text-white selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial from-teal-900/20 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* Decorative colored grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="font-black text-xl text-slate-950">F</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Form<span className="text-teal-400">Flow</span>
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition px-4 py-2 text-sm font-medium">
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all duration-300 shadow-md shadow-teal-500/10 hover:shadow-teal-500/20 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing FormFlow</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
            Create. Customize. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
              Collect Responses.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed mb-12 max-w-2xl mx-auto">
            Build beautiful, responsive, and secure dynamic forms in seconds. Collect responses in real-time, analyze submission trends, and export your data instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 hover:from-teal-400 hover:to-emerald-300 transition-all duration-300 shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Build a Form Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>Dashboard Demo</span>
              <ArrowUpRight className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative group overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-8 backdrop-blur-sm hover:border-teal-500/30 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-500" />
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">Dynamic Builder</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Add text, email, password, date, dropdowns, checkboxes, and radio fields with custom validation rules.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative group overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-8 backdrop-blur-sm hover:border-teal-500/30 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-500" />
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">Instant Form Sharing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate unique links for your forms immediately. Viewers can submit responses securely on any device.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative group overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-8 backdrop-blur-sm hover:border-teal-500/30 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-500" />
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">Analytics & CSV Export</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor form views, response rates, and view all data in a clear layout. Export results directly to CSV.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 FormFlow Corp. Empowering Skills, Building Futures.</p>
      </footer>
    </div>
  );
}
