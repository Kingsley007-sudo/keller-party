"use client";

import Link from "next/link";
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

function shouldConfirmStatusChange(currentStatus, nextStatus) {
  return (
    currentStatus !== "pending" &&
    nextStatus !== currentStatus &&
    (nextStatus === "accepted" || nextStatus === "rejected")
  );
}

function getStatusChangeConfirmation(name, currentStatus, nextStatus) {
  const currentLabel = statusLabels[currentStatus] || currentStatus;
  const nextLabel = statusLabels[nextStatus] || nextStatus;

  return `${name} is already ${currentLabel.toLowerCase()}. Changing to ${nextLabel.toLowerCase()} will send a new email. Continue?`;
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
      registration.email,
      registration.instagramName,
      registration.dateOfBirth,
      ...registration.guests.flatMap((guest) => [
        guest.fullName,
        guest.phoneNumber,
        guest.email,
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
    const registration = registrations.find((item) => item.id === id);

    if (
      registration &&
      shouldConfirmStatusChange(registration.status, status) &&
      !window.confirm(
        getStatusChangeConfirmation(
          registration.fullName,
          registration.status,
          status
        )
      )
    ) {
      return;
    }

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
    const registration = registrations.find((item) => item.id === id);
    const guest = registration?.guests?.[guestIndex];
    const guestStatus = guest?.status || "pending";

    if (
      guest &&
      shouldConfirmStatusChange(guestStatus, status) &&
      !window.confirm(
        getStatusChangeConfirmation(guest.fullName, guestStatus, status)
      )
    ) {
      return;
    }

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
        "Email",
        "Date of birth",
        "Instagram",
        "Status",
        "Bringing guests",
        "Guest name",
        "Guest phone",
        "Guest email",
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
          registration.email,
          registration.dateOfBirth,
          registration.instagramName,
          statusLabels[registration.status],
          registration.bringingGuests
        ];

        if (registration.guests.length === 0) {
          return [[...baseRow, "", "", "", "", "", "", registration.createdAt, registration.updatedAt]];
        }

        return registration.guests.map((guest) => [
          ...baseRow,
          guest.fullName,
          guest.phoneNumber,
          guest.email,
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
                placeholder="Name, email, phone, Instagram..."
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
                            <div className="table-primary-cell">
                              <a href={`mailto:${registration.email}`}>
                                {registration.email}
                              </a>
                              <a href={`tel:${registration.phoneNumber}`}>
                                {registration.phoneNumber}
                              </a>
                            </div>
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

                                    return (
                                      <div
                                        key={`${registration.id}-${guest.fullName}-${guest.instagramName}-${guestIndex}`}
                                        className="guest-decision-card"
                                      >
                                        <div className="guest-decision-main">
                                          <strong>{guest.fullName}</strong>
                                          <span>{guest.instagramName}</span>
                                          <span>{guest.email}</span>
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
                                            disabled={
                                              activeId === guestActiveId ||
                                              guestStatus === "accepted"
                                            }
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
                                            disabled={
                                              activeId === guestActiveId ||
                                              guestStatus === "rejected"
                                            }
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
                                disabled={
                                  activeId === registration.id ||
                                  registration.status === "accepted"
                                }
                                onClick={() => handleStatusChange(registration.id, "accepted")}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="compact-button compact-button-reject"
                                disabled={
                                  activeId === registration.id ||
                                  registration.status === "rejected"
                                }
                                onClick={() => handleStatusChange(registration.id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
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
