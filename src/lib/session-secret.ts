const LOCAL_SESSION_SECRET = "valoria-local-session-secret-for-development-only";

type SessionEnvironment = Readonly<{
  NODE_ENV?: string;
  AUTH_SECRET?: string;
  NEXTAUTH_SECRET?: string;
  JWT_SECRET?: string;
}>;

export function getSessionSecret(environment: SessionEnvironment = process.env) {
  const configured = environment.AUTH_SECRET || environment.NEXTAUTH_SECRET || environment.JWT_SECRET;
  const secret = configured?.trim() || (environment.NODE_ENV === "production" ? "" : LOCAL_SESSION_SECRET);

  if (!secret) {
    throw new Error("Configure AUTH_SECRET with a strong random value before starting Valoria in production.");
  }

  if (environment.NODE_ENV === "production" && (secret.length < 32 || /change-me|troque|example|fallback/i.test(secret))) {
    throw new Error("AUTH_SECRET must contain at least 32 characters and must not be a placeholder.");
  }

  return secret;
}
