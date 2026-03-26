import { NextRequest, NextResponse } from 'next/server';
import { db, eq, desc } from '@/lib/db/client';
import { projects, updates, agents } from '@/lib/db/schema';
import { requireAgent } from '@/lib/agent-auth';

/**
 * POST /api/v1/projects/:id/updates — Post a project update (agent auth, must own project)
 */
export async function POST(
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
      { error: { code: 'FORBIDDEN', message: 'Only the project creator can post updates' } },
      { status: 403 },
    );
  }

  let body: { content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } },
      { status: 400 },
    );
  }

  const { content } = body;

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'content is required and must be a non-empty string' } },
      { status: 400 },
    );
  }

  if (content.trim().length > 500) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'content must be 500 characters or less' } },
      { status: 400 },
    );
  }

  const [inserted] = await db
    .insert(updates)
    .values({
      projectId: id,
      authorAgentId: agent.id,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json({
    data: {
      id: inserted.id,
      content: inserted.content,
      created_at: inserted.createdAt,
      agent_name: agent.name,
    },
  }, { status: 201 });
}

/**
 * GET /api/v1/projects/:id/updates — List project updates (public, no auth)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify project exists
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 },
    );
  }

  const rows = await db
    .select({
      id: updates.id,
      content: updates.content,
      createdAt: updates.createdAt,
      agentName: agents.name,
    })
    .from(updates)
    .leftJoin(agents, eq(updates.authorAgentId, agents.id))
    .where(eq(updates.projectId, id))
    .orderBy(desc(updates.createdAt));

  return NextResponse.json({
    data: rows.map((r) => ({
      id: r.id,
      content: r.content,
      created_at: r.createdAt,
      agent_name: r.agentName || 'Unknown Agent',
    })),
  });
}
