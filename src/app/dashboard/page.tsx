import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-white flex flex-col">
      <DashboardClient username={user.username} />
    </div>
  );
}
