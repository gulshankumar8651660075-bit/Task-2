import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';
import BuilderClient from './BuilderClient';

type Params = Promise<{ id: string }>;

export default async function BuilderPage(segmentData: { params: Params }) {
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

  // Serialize models correctly
  const serializedForm = {
    id: form.id,
    title: form.title,
    description: form.description || '',
    fields: JSON.parse(form.fields || '[]'),
    theme: JSON.parse(form.theme || '{}'),
    published: form.published,
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 text-white flex flex-col">
      <BuilderClient initialForm={serializedForm} />
    </div>
  );
}
