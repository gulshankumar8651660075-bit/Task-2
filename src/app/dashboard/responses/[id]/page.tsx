import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';
import ResponsesClient from './ResponsesClient';

type Params = Promise<{ id: string }>;

export default async function ResponsesPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    redirect('/dashboard');
  }

  if (form.userId !== user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-white flex flex-col">
      <ResponsesClient formId={id} />
    </div>
  );
}
