import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function POST(request: Request, segmentData: { params: Params }) {
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

    const duplicatedForm = await prisma.form.create({
      data: {
        title: `Copy of ${form.title}`,
        description: form.description,
        fields: form.fields,
        theme: form.theme,
        userId: user.id,
        published: false,
      },
    });

    return NextResponse.json(duplicatedForm);
  } catch (error) {
    console.error('Duplicate form error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
