import { getHealthPayload } from '../lib/dispatchCore.ts';

export async function GET(): Promise<Response> {
  return Response.json(getHealthPayload(), { status: 200 });
}
