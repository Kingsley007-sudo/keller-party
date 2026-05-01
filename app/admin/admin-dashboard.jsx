"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  buildAcceptedWhatsAppMessage,
  buildRejectedWhatsAppMessage
} from "@/lib/whatsapp-copy";

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

function getWhatsAppUrl(phoneNumber, message) {
  const trimmedPhoneNumber = typeof phoneNumber === "string" ? phoneNumber.trim() : "";
  const digits = trimmedPhoneNumber.replace(/[^\d]/g, "");
  const normalizedPhoneNumber =
    trimmedPhoneNumber.startsWith("+")
      ? digits
      : digits.startsWith("00")
        ? digits.slice(2)
        : digits.startsWith("0")
          ? `41${digits.slice(1)}`
          : digits;

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
  const pendingCount =
    registrations.filter((registration) => registration.status === "pending").length +
    registrations.reduce(
      (total, registration) =>
        total +
        registration.guests.filter((guest) => (guest.status || "pending") === "pending").length,
      0
    );
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
        guest.phoneNumber,
        guest.dateOfBirth,
        guest.instagramName,
        guest.status
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
    setRequestError(payload.messageWarning || "");
    setActiveId("");
  }

  async function handleGuestStatusChange(id, guestIndex, status) {
    setActiveId(`${id}:guest:${guestIndex}`);
    setRequestError("");

    const response = await fetch(`/api/registrations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ guestIndex, status })
    });

    const payload = await response.json();

    if (!response.ok) {
      setRequestError(payload.error || "The guest could not be updated.");
      setActiveId("");
      return;
    }

    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === id ? payload.registration : registration
      )
    );
    setRequestError(payload.messageWarning || "");
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
        "Guest name",
        "Guest phone",
        "Guest date of birth",
        "Guest Instagram",
        "Guest status",
        "Submitted",
        "Updated"
      ],
      ...visibleRegistrations.flatMap((registration) => {
        const baseRow = [
          registration.fullName,
          registration.phoneNumber,
          registration.dateOfBirth,
          registration.instagramName,
          statusLabels[registration.status],
          registration.bringingGuests
        ];

        if (registration.guests.length === 0) {
          return [[...baseRow, "", "", "", "", "", registration.createdAt, registration.updatedAt]];
        }

        return registration.guests.map((guest) => [
          ...baseRow,
          guest.fullName,
          guest.phoneNumber,
          guest.dateOfBirth,
          guest.instagramName,
          statusLabels[guest.status || "pending"],
          registration.createdAt,
          registration.updatedAt
        ]);
      })
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
                      <th scope="col">Fallback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRegistrations.map((registration) => {
                      const guestCount = registration.guests.length;
                      const fallbackMessage =
                        registration.status === "accepted"
                          ? buildAcceptedWhatsAppMessage(registration.fullName)
                          : buildRejectedWhatsAppMessage(registration.fullName);

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
                                <div className="guest-decision-list">
                                  {registration.guests.map((guest, guestIndex) => {
                                    const guestStatus = guest.status || "pending";
                                    const guestActiveId = `${registration.id}:guest:${guestIndex}`;
                                    const guestFallbackMessage =
                                      guestStatus === "accepted"
                                        ? buildAcceptedWhatsAppMessage(guest.fullName)
                                        : buildRejectedWhatsAppMessage(guest.fullName);

                                    return (
                                      <div
                                        key={`${registration.id}-${guest.fullName}-${guest.instagramName}-${guestIndex}`}
                                        className="guest-decision-card"
                                      >
                                        <div className="guest-decision-main">
                                          <strong>{guest.fullName}</strong>
                                          <span>{guest.instagramName}</span>
                                          <span>{guest.phoneNumber}</span>
                                          <span>{guest.dateOfBirth}</span>
                                          <span className={`status-badge status-${guestStatus}`}>
                                            {statusLabels[guestStatus]}
                                          </span>
                                        </div>
                                        <div className="table-actions guest-actions">
                                          <button
                                            type="button"
                                            className="compact-button compact-button-accept"
                                            disabled={activeId === guestActiveId}
                                            onClick={() =>
                                              handleGuestStatusChange(
                                                registration.id,
                                                guestIndex,
                                                "accepted"
                                              )
                                            }
                                          >
                                            Accept
                                          </button>
                                          <button
                                            type="button"
                                            className="compact-button compact-button-reject"
                                            disabled={activeId === guestActiveId}
                                            onClick={() =>
                                              handleGuestStatusChange(
                                                registration.id,
                                                guestIndex,
                                                "rejected"
                                              )
                                            }
                                          >
                                            Reject
                                          </button>
                                          {guestStatus === "accepted" ||
                                          guestStatus === "rejected" ? (
                                            <a
                                              className="compact-button compact-button-message button-link"
                                              href={getWhatsAppUrl(
                                                guest.phoneNumber,
                                                guestFallbackMessage
                                              )}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              Resend
                                            </a>
                                          ) : null}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
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
                                className="compact-button compact-button-accept"
                                disabled={activeId === registration.id}
                                onClick={() => handleStatusChange(registration.id, "accepted")}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="compact-button compact-button-reject"
                                disabled={activeId === registration.id}
                                onClick={() => handleStatusChange(registration.id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                          <td>
                            {registration.status === "accepted" ||
                            registration.status === "rejected" ? (
                              <a
                                className="compact-button compact-button-message button-link"
                                href={getWhatsAppUrl(
                                  registration.phoneNumber,
                                  fallbackMessage
                                )}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Manual resend
                              </a>
                            ) : (
                              <span className="muted-table-text">Decide first</span>
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
