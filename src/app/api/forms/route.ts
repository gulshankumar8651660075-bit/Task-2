import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';

// GET: List all forms for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forms = await prisma.form.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        published: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { submissions: true },
        },
      },
    });

    // Map _count.submissions to submissionCount for simpler frontend handling
    const formattedForms = forms.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      published: f.published,
      views: f.views,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      submissionCount: f._count.submissions,
    }));

    return NextResponse.json(formattedForms);
  } catch (error) {
    console.error('Fetch forms error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new form
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let title = 'Untitled Form';
    let description = 'Form description goes here...';

    try {
      const body = await request.json();
      if (body.title) title = body.title;
      if (body.description) description = body.description;
    } catch (e) {
      // Body might be empty, that's fine
    }

    const defaultFields = JSON.stringify([
      {
        id: 'f-email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        required: true,
      },
      {
        id: 'f-feedback',
        type: 'textarea',
        label: 'Feedback',
        placeholder: 'Tell us what you think...',
        required: false,
      }
    ]);

    const defaultTheme = JSON.stringify({
      primaryColor: '#0f766e', // Teal 700
      backgroundColor: '#f8fafc', // Slate 50
      textColor: '#0f172a', // Slate 900
      accentColor: '#14b8a6', // Teal 500
      borderRadius: '8px',
      fontFamily: 'Inter',
    });

    const form = await prisma.form.create({
      data: {
        title,
        description,
        fields: defaultFields,
        theme: defaultTheme,
        userId: user.id,
        published: false,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Create form error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
