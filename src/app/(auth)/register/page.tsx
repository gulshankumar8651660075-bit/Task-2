'use server';

import { Suspense } from 'react';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage() {
  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <Suspense fallback={
        <div className="text-center text-slate-400 text-sm animate-pulse">
          Loading registration portal...
        </div>
      }>
        <RegisterFormClient />
      </Suspense>
    </div>
  );
}
