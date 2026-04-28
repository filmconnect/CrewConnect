import logger from "./logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`;

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export function getGoogleAuthUrl(mode: "login" | "signup" = "login"): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: mode,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error({ error }, "google:exchange_code_failed");
    throw new Error("Failed to exchange Google auth code");
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

export async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    logger.error("google:get_user_info_failed");
    throw new Error("Failed to get Google user info");
  }

  return response.json() as Promise<GoogleUserInfo>;
}
