import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";

import { env } from "~/env";

export const STRAVA_SESSION_COOKIE = "strava-viewer-session";
export const STRAVA_STATE_COOKIE = "strava-oauth-state";

const SESSION_VERSION = 1;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.number().int().positive(),
  version: z.literal(SESSION_VERSION),
});

export type StravaViewerSession = z.infer<typeof sessionSchema>;

export const stravaCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
};

function getEncryptionKey() {
  return createHash("sha256")
    .update(`running-dashboard:strava-session:${env.CLIENT_SECRET}`)
    .digest();
}

export function createStravaViewerSession(
  session: Omit<StravaViewerSession, "version">,
) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const plaintext = Buffer.from(
    JSON.stringify({ ...session, version: SESSION_VERSION }),
  );
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    "base64url",
  );
}

export function readStravaViewerSession(value: string | undefined) {
  if (!value) return undefined;

  try {
    const sealed = Buffer.from(value, "base64url");

    if (sealed.length <= IV_LENGTH + AUTH_TAG_LENGTH) return undefined;

    const iv = sealed.subarray(0, IV_LENGTH);
    const authTag = sealed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = sealed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    const session = sessionSchema.parse(
      JSON.parse(plaintext.toString("utf8")) as unknown,
    );

    return session.expiresAt > Math.floor(Date.now() / 1000)
      ? session
      : undefined;
  } catch {
    return undefined;
  }
}

export function createOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function isValidOAuthState(
  expected: string | undefined,
  received: string | null,
) {
  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
