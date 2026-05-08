import { getGoogleAuthUrl } from "@/lib/google-oauth";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return <RegisterForm googleAuthUrl={getGoogleAuthUrl("signup")} />;
}
