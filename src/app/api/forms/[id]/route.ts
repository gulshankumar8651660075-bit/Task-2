import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/db';

type Params = Promise<{ id: string }>;

// GET: Retrieve a specific form configuration
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const { id } = params;
    
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true }
        }
      }
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check if user is the owner
    const user = await getCurrentUser();
    const isOwner = user?.id === form.userId;

    if (!form.published && !isOwner) {
      return NextResponse.json({ error: 'Form is not published' }, { status: 403 });
    }

    return NextResponse.json({
      ...form,
      isOwner,
    });
  } catch (error) {
    console.error('Fetch form detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update a form configuration
export async function PATCH(request: Request, segmentData: { params: Params }) {
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

    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.fields !== undefined) updateData.fields = typeof body.fields === 'string' ? body.fields : JSON.stringify(body.fields);
    if (body.theme !== undefined) updateData.theme = typeof body.theme === 'string' ? body.theme : JSON.stringify(body.theme);
    if (body.published !== undefined) updateData.published = body.published;

    const updatedForm = await prisma.form.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('Update form error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a form
export async function DELETE(request: Request, segmentData: { params: Params }) {
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

    await prisma.form.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete form error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
