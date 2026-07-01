import { z } from "zod";

const appEnvironmentSchema = z.enum([
  "local",
  "development",
  "staging",
  "production",
  "test",
]);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("Request Web"),
  NEXT_PUBLIC_APP_ENV: appEnvironmentSchema.default("local"),
  NEXT_PUBLIC_API_BASE_URL: z.union([z.url(), z.literal("")]).default(""),
});

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env["NEXT_PUBLIC_APP_NAME"],
  NEXT_PUBLIC_APP_ENV: process.env["NEXT_PUBLIC_APP_ENV"],
  NEXT_PUBLIC_API_BASE_URL: process.env["NEXT_PUBLIC_API_BASE_URL"],
});

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("Server environment cannot be read in the browser.");
  }

  return serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
  });
}
