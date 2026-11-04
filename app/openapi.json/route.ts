import { discovery } from '@/lib/agent/discovery';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function GET(req:Request){return discovery(req,'openapi.json');}
