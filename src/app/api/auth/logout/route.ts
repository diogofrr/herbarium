import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "herbarium_session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true });
}
