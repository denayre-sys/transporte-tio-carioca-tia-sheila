import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.rotaItem.updateMany({ data: { status: "PENDENTE" } });
  return NextResponse.json({ ok: true });
}
