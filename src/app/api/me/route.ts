import { authErrorResponse, requireRole } from "@/lib/authorization";

export async function GET(request: Request) {
  try {
    const { user } = await requireRole("USER", request.headers);
    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
