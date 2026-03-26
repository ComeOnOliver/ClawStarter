import { NextRequest, NextResponse } from 'next/server';
import { db, eq } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { requireAgent } from '@/lib/agent-auth';

/**
 * PUT /api/v1/projects/:id/faq — Set project FAQ (agent auth, must own project)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { agent, error } = await requireAgent(req);
  if (error) return error;

  const { id } = await params;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 },
    );
  }

  if (project.agentId !== agent.id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only the project creator can update FAQ' } },
      { status: 403 },
    );
  }

  let body: { faq?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    );
  }

  const { faq } = body;

  if (!Array.isArray(faq)) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'faq must be an array' } },
      { status: 400 },
    );
  }

  if (faq.length > 20) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Maximum 20 FAQ items allowed' } },
      { status: 400 },
    );
  }

  for (const item of faq) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Record<string, unknown>).question !== 'string' ||
      typeof (item as Record<string, unknown>).answer !== 'string' ||
      !(item as Record<string, unknown>).question ||
      !(item as Record<string, unknown>).answer
    ) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Each FAQ item must have non-empty question and answer strings' } },
        { status: 400 },
      );
    }
  }

  const sanitizedFaq = faq.map((item: Record<string, unknown>) => ({
    question: String(item.question).trim(),
    answer: String(item.answer).trim(),
  }));

  await db
    .update(projects)
    .set({ faq: sanitizedFaq, updatedAt: new Date() })
    .where(eq(projects.id, id));

  return NextResponse.json({ data: { faq: sanitizedFaq } });
}
