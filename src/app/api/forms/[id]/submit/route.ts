import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function POST(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const { id } = params;
    const body = await request.json();
    const { answers } = body; // Map of fieldId -> value

    if (!answers) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.published) {
      return NextResponse.json({ error: 'Form is not accepting responses' }, { status: 403 });
    }

    // Validate fields based on form schema
    const fields = JSON.parse(form.fields || '[]');
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const value = answers[field.id];
      const isMissing = value === undefined || value === null || String(value).trim() === '';

      if (field.required && isMissing) {
        errors[field.id] = `${field.label} is required`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 });
    }

    // Save submission
    const submission = await prisma.submission.create({
      data: {
        formId: id,
        data: JSON.stringify(answers),
      },
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error('Submit response error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
