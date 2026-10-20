import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireRole } from "@/lib/authorization";

export async function GET(request: Request) {
  try {
    await requireRole("ADMIN", request.headers);
    const users = await prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, banned: true },
    });
    return Response.json(
      { users },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
