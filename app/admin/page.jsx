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

  let registrations = [];
  let loadError = "";

  try {
    registrations = await listRegistrations();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "The registrations could not be loaded right now.";
  }

  return (
    <main className="app-shell request-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />

      <section className="admin-page">
        <div className="request-copy admin-heading">
          <p className="eyebrow">Internal area</p>
          <h1>Guest review.</h1>
          <p className="hero-description">
            This internal view shows every access request and keeps the current status in sync.
          </p>
        </div>

        {loadError ? (
          <div className="admin-empty-state">
            <p className="flow-label">Data connection problem</p>
            <h3>The admin area could not load registrations.</h3>
            <p className="hero-description">{loadError}</p>
          </div>
        ) : (
          <AdminDashboard initialRegistrations={registrations} />
        )}
      </section>
    </main>
  );
}
