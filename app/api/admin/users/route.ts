import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/access";
import { resolveReport } from "@/services/user.service";

const schema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["resolved", "dismissed"]),
});

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { reportId, status } = schema.parse(await request.json());
    await resolveReport(reportId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถอัปเดตรายงานได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
