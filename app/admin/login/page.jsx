import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import LoginForm from "./login-form";

export const metadata = {
  title: "Keller Party Admin Login",
  description: "Authenticate to access the Keller Party admin area."
};

export default function AdminLoginPage({ searchParams }) {
  const sessionToken = cookies().get(adminSessionCookieName)?.value;

  const nextPath =
    typeof searchParams?.next === "string" && searchParams.next.startsWith("/")
      ? searchParams.next
      : "/admin";

  if (isValidAdminSessionToken(sessionToken)) {
    redirect(nextPath);
  }

  return (
    <main className="app-shell request-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />

      <section className="request-layout">
        <div className="request-copy">
          <p className="eyebrow">Internal access</p>
          <h1>Admin sign in.</h1>
          <p className="hero-description">
            Enter the admin password to review registrations and update guest status.
          </p>
          <div className="request-actions">
            <Link href="/" className="secondary-button button-link">
              Back to invite
            </Link>
          </div>
        </div>

        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
