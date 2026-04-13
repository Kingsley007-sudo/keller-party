"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const statusLabels = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected"
};

const acceptanceMessage = `KELLER PARTY
You have been selected.
We look forward to welcoming you to the Icon Club Zurich on June 27.
Please arrive promptly at 23:00.
The dress code is Elegant and will be strictly enforced.
Photography and filming are prohibited throughout the evening.
This is a private event. Your invitation is personal and non-transferable.`;

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en-CH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function getWhatsAppUrl(phoneNumber, message) {
  const normalizedPhoneNumber = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${normalizedPhoneNumber}?text=${encodeURIComponent(message)}`;
}

function escapeCsvCell(value) {
  const cellValue = value == null ? "" : String(value);
  return `"${cellValue.replaceAll("\"", "\"\"")}"`;
}

function downloadCsv(filename, rows) {
  const csvContent = rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ initialRegistrations }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [activeId, setActiveId] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const totalPrimaryGuests = registrations.length;
  const totalAdditionalGuests = registrations.reduce(
    (total, registration) => total + registration.guests.length,
    0
  );
  const totalGuests = totalPrimaryGuests + totalAdditionalGuests;
  const pendingCount = registrations.filter(
    (registration) => registration.status === "pending"
  ).length;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleRegistrations = registrations.filter((registration) => {
    const matchesStatus =
      statusFilter === "all" || registration.status === statusFilter;

    if (!matchesStatus) {
      return false;
    }

    if (!normalizedSearchQuery) {
      return true;
    }

    const searchableText = [
      registration.fullName,
      registration.phoneNumber,
      registration.instagramName,
      registration.dateOfBirth,
      ...registration.guests.flatMap((guest) => [
        guest.fullName,
        guest.instagramName
      ])
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchQuery);
  });

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

  function handleExportCsv() {
    const rows = [
      [
        "Full name",
        "Phone number",
        "Date of birth",
        "Instagram",
        "Status",
        "Bringing guests",
        "Guests",
        "Submitted",
        "Updated"
      ],
      ...visibleRegistrations.map((registration) => [
        registration.fullName,
        registration.phoneNumber,
        registration.dateOfBirth,
        registration.instagramName,
        statusLabels[registration.status],
        registration.bringingGuests,
        registration.guests
          .map((guest) => `${guest.fullName} (${guest.instagramName})`)
          .join("; "),
        registration.createdAt,
        registration.updatedAt
      ])
    ];

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`keller-party-registrations-${dateStamp}.csv`, rows);
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-floating-menu" aria-label="Admin navigation">
        <button
          type="button"
          className="admin-menu-trigger"
          aria-expanded={isMenuOpen}
          aria-controls="admin-menu-popover"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          Menu
          <span aria-hidden="true">{isMenuOpen ? "Close" : "Open"}</span>
        </button>

        {isMenuOpen ? (
          <div id="admin-menu-popover" className="admin-menu-popover">
            <Link href="/" className="admin-menu-item">
              Back to invite
            </Link>
            <Link href="/request-access" className="admin-menu-item">
              Open request form
            </Link>
            <button
              type="button"
              className="admin-menu-item"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : null}
      </nav>

      <header className="admin-menu">
        <div className="admin-menu-title">
          <p className="flow-label">Registration admin</p>
          <strong>{totalGuests} total guest{totalGuests === 1 ? "" : "s"}</strong>
        </div>

        <div className="admin-menu-stats">
          <span>{totalPrimaryGuests} registrations</span>
          <span>{totalAdditionalGuests} additional guests</span>
          <span>{pendingCount} pending</span>
        </div>
      </header>

      {requestError ? <p className="field-error">{requestError}</p> : null}

      {registrations.length === 0 ? (
        <div className="admin-empty-state">
          <p className="flow-label">No submissions yet</p>
          <h3>Requests will appear here after the first form submission.</h3>
        </div>
      ) : (
        <div className="admin-table-stack">
          <div className="admin-filter-bar">
            <label className="admin-search-field">
              <span>Search registrations</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Name, phone, Instagram..."
              />
            </label>

            <label className="admin-status-filter">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <p className="admin-filter-count">
              {visibleRegistrations.length} shown
            </p>

            <button
              type="button"
              className="compact-button admin-export-button"
              disabled={visibleRegistrations.length === 0}
              onClick={handleExportCsv}
            >
              Export CSV
            </button>
          </div>

          {visibleRegistrations.length === 0 ? (
            <div className="admin-empty-state compact-empty-state">
              <p className="flow-label">No matching registrations</p>
              <h3>Adjust search or status filters.</h3>
            </div>
          ) : (
            <div className="admin-table-card">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Guest</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Birth date</th>
                      <th scope="col">Guests</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                      <th scope="col">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRegistrations.map((registration) => {
                      const guestCount = registration.guests.length;

                      return (
                        <tr key={registration.id}>
                          <td>
                            <div className="table-primary-cell">
                              <strong>{registration.fullName}</strong>
                              <span>{registration.instagramName}</span>
                            </div>
                          </td>
                          <td>
                            <a href={`tel:${registration.phoneNumber}`}>
                              {registration.phoneNumber}
                            </a>
                          </td>
                          <td>{registration.dateOfBirth}</td>
                          <td>
                            {guestCount > 0 ? (
                              <details className="guest-details">
                                <summary>{guestCount} guest{guestCount === 1 ? "" : "s"}</summary>
                                <ul>
                                  {registration.guests.map((guest) => (
                                    <li key={`${registration.id}-${guest.fullName}-${guest.instagramName}`}>
                                      {guest.fullName} <span>{guest.instagramName}</span>
                                    </li>
                                  ))}
                                </ul>
                              </details>
                            ) : (
                              <span className="muted-table-text">None</span>
                            )}
                          </td>
                          <td>{formatDate(registration.createdAt)}</td>
                          <td>
                            <span className={`status-badge status-${registration.status}`}>
                              {statusLabels[registration.status]}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="compact-button"
                                disabled={activeId === registration.id}
                                onClick={() => handleStatusChange(registration.id, "accepted")}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="compact-button"
                                disabled={activeId === registration.id}
                                onClick={() => handleStatusChange(registration.id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                          <td>
                            {registration.status === "accepted" ? (
                              <a
                                className="compact-button button-link"
                                href={getWhatsAppUrl(
                                  registration.phoneNumber,
                                  acceptanceMessage
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Message
                              </a>
                            ) : (
                              <span className="muted-table-text">Accept first</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
