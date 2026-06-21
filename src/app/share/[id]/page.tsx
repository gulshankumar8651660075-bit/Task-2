import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ShareFormClient from './ShareFormClient';

type Params = Promise<{ id: string }>;

export default async function SharePage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;

  const form = await prisma.form.findUnique({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  // Increment view count if it's a public access
  // Since this is a public page rendering, we can increment views
  await prisma.form.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  // Serialize properties
  const serializedForm = {
    id: form.id,
    title: form.title,
    description: form.description || '',
    fields: JSON.parse(form.fields || '[]'),
    theme: JSON.parse(form.theme || '{}'),
    published: form.published,
  };

  return (
    <div 
      style={{ backgroundColor: serializedForm.theme.backgroundColor || '#f8fafc' }}
      className="flex-1 min-h-screen flex flex-col justify-center items-center py-12 px-6"
    >
      <ShareFormClient form={serializedForm} />
    </div>
  );
}
