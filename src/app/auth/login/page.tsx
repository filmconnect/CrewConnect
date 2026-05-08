import { getGoogleAuthUrl } from "@/lib/google-oauth";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return <LoginForm googleAuthUrl={getGoogleAuthUrl("login")} />;
}
