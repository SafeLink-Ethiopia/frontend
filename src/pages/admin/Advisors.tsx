import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/*
  Palette (soft leaf green)
  #FAFBF7  mist     - light page background
  #E7F1E3  mint     - soft green cards, highlights
  #2F8F4E  leaf     - accent, borders, light green
  #2F8F4E  green    - primary buttons, logo
  #176B3A  forest   - dark surfaces
  #173B28  ink      - body text
*/

interface Advisor {
  _id?: string;
  advisor_id?: string;
  name: string;
  email: string;
  gender: string;
  type: string;
  phone_number?: string;
  location?: string;
  working_hours?: {
    start: string;
    end: string;
  };
  active: boolean;
}

interface AdvisorsResponse {
  advisors: Advisor[];
}

export default function Advisors() {
  const navigate = useNavigate();

  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // For the 3-dot dropdown: track which advisor's menu is open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Admin authentication required.");
        return;
      }

      const response = await axios.get<AdvisorsResponse>(
        "http://localhost:5000/api/advisors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAdvisors(response.data.advisors || []);
    } catch (error) {
      console.error("Failed to fetch advisors:", error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to load advisors.");
      } else {
        setError("Something went wrong while loading advisors.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const handleToggleActive = async (advisor: Advisor) => {
    if (!advisor.advisor_id) {
      setError("Advisor ID is missing.");
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Admin authentication required.");
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/advisors/${advisor.advisor_id}/active`,
        {
          active: !advisor.active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedAdvisor = response.data.advisor || response.data;

      setAdvisors((currentAdvisors) =>
        currentAdvisors.map((item) =>
          item.advisor_id === advisor.advisor_id
            ? {
                ...item,
                active: updatedAdvisor.active ?? !advisor.active,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update advisor status:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Failed to update advisor status.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAdvisor = async () => {
    if (!advisorToDelete?.advisor_id) {
      setError("Advisor ID is missing.");
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Admin authentication required.");
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/advisors/${advisorToDelete.advisor_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAdvisors((currentAdvisors) =>
        currentAdvisors.filter(
          (advisor) => advisor.advisor_id !== advisorToDelete.advisor_id,
        ),
      );

      setAdvisorToDelete(null);
    } catch (error) {
      console.error("Failed to delete advisor:", error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to delete advisor.");
      } else {
        setError("Something went wrong while deleting advisor.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateAdvisor = async () => {
    if (!editingAdvisor?.advisor_id) {
      setError("Advisor ID is missing.");
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Admin authentication required.");
        return;
      }

      const response = await axios.patch(
        `http://localhost:5000/api/advisors/${editingAdvisor.advisor_id}`,
        {
          name: editingAdvisor.name,
          email: editingAdvisor.email,
          gender: editingAdvisor.gender,
          type: editingAdvisor.type,
          phone_number: editingAdvisor.phone_number,
          location: editingAdvisor.location,
          working_hours: editingAdvisor.working_hours,
          active: editingAdvisor.active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedAdvisor = response.data.advisor || response.data;

      setAdvisors((currentAdvisors) =>
        currentAdvisors.map((advisor) =>
          advisor.advisor_id === editingAdvisor.advisor_id
            ? {
                ...advisor,
                ...updatedAdvisor,
              }
            : advisor,
        ),
      );

      setEditingAdvisor(null);
    } catch (error) {
      console.error("Failed to update advisor:", error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to update advisor.");
      } else {
        setError("Something went wrong while updating advisor.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChat = (advisor: Advisor) => {
    if (!advisor.advisor_id) {
      setError("This advisor does not have an advisor ID.");
      return;
    }

    navigate(`/admin/advisors/${advisor.advisor_id}/chat`);
  };

  const getAdvisorKey = (advisor: Advisor) =>
    advisor.advisor_id || advisor._id || advisor.email;

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Header */}
        <header className="border-b border-[#E7F1E3] pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2F8F4E]">
            SafeLink Administration
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#176B3A] sm:text-4xl">
                Advisors
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#173B28]/65">
                Manage advisor accounts, availability, information, and
                communication from one place.
              </p>
            </div>

            <div className="border-l-2 border-[#2F8F4E] pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                Directory
              </p>

              <p className="mt-1 text-sm font-medium text-[#176B3A]">
                {advisors.length}{" "}
                {advisors.length === 1 ? "advisor" : "advisors"}
              </p>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-5 rounded-2xl border border-[#2F8F4E]/30 bg-[#E7F1E3] px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                Notice
              </p>

              <p className="mt-1 text-sm leading-6 text-[#173B28]">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xl leading-none text-[#2F8F4E] transition hover:text-[#176B3A]"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <section className="mt-10">
          {loading ? (
            <div className="rounded-2xl border border-[#E7F1E3] bg-white py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#E7F1E3] border-t-[#2F8F4E]" />

              <p className="mt-4 text-sm text-[#173B28]/65">
                Loading advisor directory...
              </p>
            </div>
          ) : advisors.length === 0 ? (
            <div className="rounded-2xl border border-[#E7F1E3] bg-white px-6 py-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                Directory
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#176B3A]">
                No advisors found
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#173B28]/65">
                There are currently no advisors available in the system.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    Directory
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#176B3A]">
                    Advisor accounts
                  </h2>
                </div>

                <p className="text-xs text-[#173B28]/65">
                  Click an advisor to view details, manage status, or open a
                  conversation.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#E7F1E3] bg-white">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-b border-[#E7F1E3]">
                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                        Advisor
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                        Contact
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                        Type
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                        Status
                      </th>

                      <th className="px-4 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                        {/* actions */}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {advisors.map((advisor) => {
                      const key = getAdvisorKey(advisor);
                      const isMenuOpen = openMenuId === key;

                      return (
                        <tr
                          key={key}
                          className="border-b border-[#E7F1E3]/60 last:border-b-0 transition-colors hover:bg-[#FAFBF7]"
                        >
                          {/* Advisor */}
                          <td className="px-4 py-5">
                            <button
                              type="button"
                              onClick={() => setSelectedAdvisor(advisor)}
                              className="flex items-center gap-3 text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2F8F4E] text-xs font-semibold text-white">
                                {advisor.name
                                  ? advisor.name
                                      .split(" ")
                                      .map((part) => part[0])
                                      .slice(0, 2)
                                      .join("")
                                      .toUpperCase()
                                  : "AD"}
                              </div>

                              <div>
                                <p className="text-sm font-medium text-[#176B3A]">
                                  {advisor.name}
                                </p>

                                {advisor.advisor_id && (
                                  <p className="mt-1 text-[11px] text-[#173B28]/55">
                                    {advisor.advisor_id}
                                  </p>
                                )}
                              </div>
                            </button>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-5">
                            <p className="text-sm text-[#173B28]">
                              {advisor.email}
                            </p>

                            {advisor.phone_number && (
                              <p className="mt-1 text-xs text-[#173B28]/55">
                                {advisor.phone_number}
                              </p>
                            )}
                          </td>

                          {/* Type */}
                          <td className="px-4 py-5">
                            <span className="inline-flex rounded-full border border-[#2F8F4E]/30 bg-[#E7F1E3] px-2.5 py-1 text-[11px] font-medium capitalize text-[#176B3A]">
                              {advisor.type}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-5">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(advisor)}
                              disabled={
                                isUpdating || isDeleting || !advisor.advisor_id
                              }
                              className="group flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  advisor.active
                                    ? "bg-[#2F8F4E]"
                                    : "bg-[#173B28]/30"
                                }`}
                              />

                              <span
                                className={`text-xs font-medium ${
                                  advisor.active
                                    ? "text-[#176B3A]"
                                    : "text-[#173B28]/55"
                                }`}
                              >
                                {advisor.active ? "Active" : "Inactive"}
                              </span>
                            </button>
                          </td>

                          {/* 3-dot menu */}
                          <td className="px-4 py-5 text-right">
                            <div
                              className="relative inline-block text-left"
                              ref={isMenuOpen ? menuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId(isMenuOpen ? null : key)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#173B28]/60 transition hover:border-[#E7F1E3] hover:bg-[#FAFBF7] hover:text-[#176B3A]"
                                aria-label="Open actions menu"
                                aria-haspopup="true"
                                aria-expanded={isMenuOpen}
                              >
                                <svg
                                  width="4"
                                  height="16"
                                  viewBox="0 0 4 16"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <circle cx="2" cy="2" r="1.6" />
                                  <circle cx="2" cy="8" r="1.6" />
                                  <circle cx="2" cy="14" r="1.6" />
                                </svg>
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-[#E7F1E3] bg-white shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setSelectedAdvisor(advisor);
                                    }}
                                    className="block w-full px-4 py-2.5 text-left text-sm text-[#173B28] transition hover:bg-[#FAFBF7] hover:text-[#176B3A]"
                                  >
                                    View details
                                  </button>

                                 
                                </div>
                              )}
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
        </section>

        {/* View Modal */}
        {selectedAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#E7F1E3] px-6 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    Advisor profile
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#176B3A]">
                    Advisor details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="text-2xl leading-none text-[#173B28]/40 transition hover:text-[#176B3A]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="divide-y divide-[#E7F1E3] px-6">
                {[
                  ["Advisor ID", selectedAdvisor.advisor_id || "—"],
                  ["Name", selectedAdvisor.name],
                  ["Email", selectedAdvisor.email],
                  ["Gender", selectedAdvisor.gender],
                  ["Type", selectedAdvisor.type],
                  ["Phone", selectedAdvisor.phone_number || "—"],
                  ["Location", selectedAdvisor.location || "—"],
                  [
                    "Working hours",
                    `${selectedAdvisor.working_hours?.start || "—"} - ${
                      selectedAdvisor.working_hours?.end || "—"
                    }`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-6 py-4"
                  >
                    <p className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#2F8F4E]">
                      {label}
                    </p>

                    <p className="max-w-[62%] break-words text-right text-sm text-[#173B28]">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-6 py-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Status
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedAdvisor.active
                          ? "bg-[#2F8F4E]"
                          : "bg-[#173B28]/30"
                      }`}
                    />

                    <p className="text-sm font-medium text-[#176B3A]">
                      {selectedAdvisor.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions inside view */}
              <div className="flex flex-wrap justify-end gap-3 border-t border-[#E7F1E3] px-6 py-5">
                <button
                  type="button"
                  onClick={() => {
                    setAdvisorToDelete(selectedAdvisor);
                    setSelectedAdvisor(null);
                  }}
                  disabled={!selectedAdvisor.advisor_id || isDeleting}
                  className="rounded-full border border-[#2F8F4E]/30 px-5 py-2.5 text-sm font-medium text-[#173B28]/70 transition hover:border-[#2F8F4E]/60 hover:bg-[#FAFBF7] hover:text-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingAdvisor({
                      ...selectedAdvisor,
                      working_hours: selectedAdvisor.working_hours || {
                        start: "",
                        end: "",
                      },
                    });
                    setSelectedAdvisor(null);
                  }}
                  disabled={!selectedAdvisor.advisor_id || isUpdating}
                  className="rounded-full border border-[#2F8F4E]/40 px-5 py-2.5 text-sm font-medium text-[#176B3A] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenChat(selectedAdvisor)}
                  disabled={!selectedAdvisor.advisor_id}
                  className="rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open chat
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="rounded-full border border-[#2F8F4E]/40 px-5 py-2.5 text-sm font-medium text-[#176B3A] transition hover:bg-[#E7F1E3]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#E7F1E3] px-6 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    Advisor management
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#176B3A]">
                    Edit advisor
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  className="text-2xl leading-none text-[#173B28]/40 transition hover:text-[#176B3A]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-x-6 gap-y-5 px-6 py-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Advisor ID
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.advisor_id || ""}
                    disabled
                    className="w-full rounded-xl border border-[#E7F1E3] bg-[#FAFBF7] px-3 py-2.5 text-sm text-[#173B28]/55 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Name
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.name}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Email
                  </label>

                  <input
                    type="email"
                    value={editingAdvisor.email}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        email: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Gender
                  </label>

                  <select
                    value={editingAdvisor.gender}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        gender: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Type
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.type}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        type: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Phone number
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.phone_number || ""}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        phone_number: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Location
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.location || ""}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        location: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Working hours start
                  </label>

                  <input
                    type="time"
                    value={editingAdvisor.working_hours?.start || ""}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        working_hours: {
                          start: event.target.value,
                          end: editingAdvisor.working_hours?.end || "",
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F4E]">
                    Working hours end
                  </label>

                  <input
                    type="time"
                    value={editingAdvisor.working_hours?.end || ""}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        working_hours: {
                          start: editingAdvisor.working_hours?.start || "",
                          end: event.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-[#E7F1E3] bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-1 focus:ring-[#2F8F4E]/20"
                  />
                </div>

                <div className="border-t border-[#E7F1E3] pt-5 md:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      id="advisor-active"
                      type="checkbox"
                      checked={editingAdvisor.active}
                      onChange={(event) =>
                        setEditingAdvisor({
                          ...editingAdvisor,
                          active: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-[#2F8F4E]"
                    />

                    <span>
                      <span className="block text-sm font-medium text-[#176B3A]">
                        Advisor is active
                      </span>

                      <span className="mt-0.5 block text-xs text-[#173B28]/55">
                        Active advisors can receive and manage conversations.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E7F1E3] px-6 py-5">
                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  disabled={isUpdating}
                  className="rounded-full border border-[#2F8F4E]/40 px-5 py-2.5 text-sm font-medium text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateAdvisor}
                  disabled={isUpdating}
                  className="rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {advisorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-[#E7F1E3] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                  Confirmation required
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#176B3A]">
                  Delete advisor
                </h2>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm leading-6 text-[#173B28]/65">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#176B3A]">
                    {advisorToDelete.name}
                  </span>
                  ?
                </p>

                <div className="mt-5 rounded-xl border border-[#2F8F4E]/30 bg-[#E7F1E3] px-4 py-3">
                  <p className="text-xs leading-5 text-[#176B3A]">
                    This action cannot be undone. The advisor will be removed
                    from the administration directory.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E7F1E3] px-6 py-5">
                <button
                  type="button"
                  onClick={() => setAdvisorToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-full border border-[#2F8F4E]/40 px-5 py-2.5 text-sm font-medium text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAdvisor}
                  disabled={isDeleting}
                  className="rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete advisor"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}