import { processBookingDispatch } from '../../lib/dispatchCore.ts';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const result = await processBookingDispatch(body);
  return Response.json(result.payload, { status: result.statusCode });
}
