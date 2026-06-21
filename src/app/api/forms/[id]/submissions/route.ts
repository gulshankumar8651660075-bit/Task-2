import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const { id } = params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (form.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const submissions = await prisma.submission.findMany({
      where: { formId: id },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({
      form: {
        title: form.title,
        description: form.description,
        fields: JSON.parse(form.fields || '[]'),
        theme: JSON.parse(form.theme || '{}'),
        views: form.views,
      },
      submissions: submissions.map((s) => ({
        id: s.id,
        submittedAt: s.submittedAt,
        answers: JSON.parse(s.data || '{}'),
      })),
    });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
