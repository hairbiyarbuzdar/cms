import type { BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";
import { roles } from "./auth-roles";

// Shared by the production instance and adapter-independent security tests.
export const authOptions = {
  appName: "CMS",
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
    cookieCache: { enabled: false },
  },
  rateLimit: { enabled: true, storage: "database" },
  plugins: [admin({ defaultRole: "USER", adminRoles: ["ADMIN"], roles })],
} satisfies BetterAuthOptions;
