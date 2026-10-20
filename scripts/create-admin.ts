import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { z } from "zod";

async function main() {
  const input = z
    .object({
      DATABASE_URL: z.string().min(1),
      ADMIN_EMAIL: z.email().transform((email) => email.toLowerCase()),
      ADMIN_NAME: z.string().trim().min(1),
      ADMIN_PASSWORD: z.string().min(12).max(128),
    })
    .safeParse(process.env);
  if (!input.success) {
    throw new Error(
      "Set DATABASE_URL, ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD (12–128 characters).",
    );
  }
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = input.data;
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  });
  try {
    const password = await hashPassword(ADMIN_PASSWORD);
    await prisma.$transaction(async (tx) => {
      // Serialize bootstrap attempts. This command only provisions the first admin.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(73619204)`;
      if (await tx.user.findFirst({ where: { role: "ADMIN" } })) {
        throw new Error(
          "An ADMIN already exists. Use the authenticated admin API to create users.",
        );
      }
      const id = randomUUID();
      await tx.user.create({
        data: {
          id,
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: "ADMIN",
          accounts: {
            create: {
              id: randomUUID(),
              accountId: id,
              providerId: "credential",
              password,
            },
          },
        },
      });
    });
    console.log("First administrator created.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Administrator creation failed.",
  );
  process.exitCode = 1;
});
