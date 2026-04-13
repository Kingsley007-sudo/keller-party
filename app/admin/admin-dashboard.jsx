"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected"
};

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en-CH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

export default function AdminDashboard({ initialRegistrations }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [activeId, setActiveId] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [requestError, setRequestError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleStatusChange(id, status) {
    setActiveId(id);
    setRequestError("");

    const response = await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    const payload = await response.json();

    if (!response.ok) {
      setRequestError(payload.error || "The registration could not be updated.");
      setActiveId("");
      return;
    }

    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === id ? payload.registration : registration
      )
    );
    setActiveId("");
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-summary-card">
        <p className="flow-label">Admin</p>
        <h2>Registrations</h2>
        <p className="hero-description">
          Review every request, then mark each guest as accepted or rejected.
        </p>
        <div className="hero-meta">
          <span>{registrations.length} total</span>
          <span>
            {registrations.filter((registration) => registration.status === "pending").length} pending
          </span>
        </div>
        <button
          type="button"
          className="secondary-button"
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {requestError ? <p className="field-error">{requestError}</p> : null}

      {registrations.length === 0 ? (
        <div className="admin-empty-state">
          <p className="flow-label">No submissions yet</p>
          <h3>Requests will appear here after the first form submission.</h3>
        </div>
      ) : (
        <div className="admin-list">
          {registrations.map((registration) => {
            const guestCount = registration.guests.length;

            return (
              <article key={registration.id} className="admin-entry-card">
                <div className="admin-entry-topline">
                  <div>
                    <p className="flow-label">{statusLabels[registration.status]}</p>
                    <h3>{registration.fullName}</h3>
                  </div>
                  <span className={`status-badge status-${registration.status}`}>
                    {statusLabels[registration.status]}
                  </span>
                </div>

                <div className="admin-entry-grid">
                  <div>
                    <p className="admin-meta-label">Phone</p>
                    <p>{registration.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="admin-meta-label">Instagram</p>
                    <p>{registration.instagramName}</p>
                  </div>
                  <div>
                    <p className="admin-meta-label">Date of birth</p>
                    <p>{registration.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="admin-meta-label">Submitted</p>
                    <p>{formatDate(registration.createdAt)}</p>
                  </div>
                  <div>
                    <p className="admin-meta-label">Guests</p>
                    <p>{guestCount > 0 ? `${guestCount} attached` : "No guests"}</p>
                  </div>
                  <div>
                    <p className="admin-meta-label">Updated</p>
                    <p>{formatDate(registration.updatedAt)}</p>
                  </div>
                </div>

                {guestCount > 0 ? (
                  <div className="admin-guests">
                    <p className="admin-meta-label">Guest list</p>
                    <ul className="details-list admin-guest-list">
                      {registration.guests.map((guest) => (
                        <li key={`${registration.id}-${guest.fullName}-${guest.instagramName}`}>
                          {guest.fullName} · {guest.instagramName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="admin-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={activeId === registration.id}
                    onClick={() => handleStatusChange(registration.id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={activeId === registration.id}
                    onClick={() => handleStatusChange(registration.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
