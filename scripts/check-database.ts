import "dotenv/config";
import { Client } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    await client.query("SELECT 1");
    console.log("PostgreSQL connection successful.");
  } finally {
    await client.end();
  }
}

main().catch(() => {
  console.error(
    "PostgreSQL connection failed. Check DATABASE_URL and that the database is running.",
  );
  process.exitCode = 1;
});
