import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin-dashboard";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import { listRegistrations } from "@/lib/registrations";

export const metadata = {
  title: "Keller Party Admin",
  description: "Review and update Keller Party registrations."
};

export default async function AdminPage() {
  const sessionToken = cookies().get(adminSessionCookieName)?.value;

  if (!isValidAdminSessionToken(sessionToken)) {
    redirect("/admin/login?next=/admin");
  }

  const registrations = await listRegistrations();

  return (
    <main className="app-shell request-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />

      <section className="admin-layout">
        <div className="request-copy">
          <p className="eyebrow">Internal area</p>
          <h1>Guest review.</h1>
          <p className="hero-description">
            This internal view shows every access request and keeps the current status in sync.
          </p>
          <div className="request-actions">
            <Link href="/" className="secondary-button button-link">
              Back to invite
            </Link>
            <Link href="/request-access" className="secondary-button button-link">
              Open request form
            </Link>
          </div>
        </div>

        <AdminDashboard initialRegistrations={registrations} />
      </section>
    </main>
  );
}
