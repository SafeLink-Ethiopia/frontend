import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Header */}
        <header className="border-b border-[#a79093]/30 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a79093]">
            SafeLink Administration
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#3e1919] sm:text-4xl">
                Advisors
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a79093]">
                Manage advisor accounts, availability, information, and
                communication from one place.
              </p>
            </div>

            <div className="border-l-2 border-[#3e1919] pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                Directory
              </p>

              <p className="mt-1 text-sm font-medium text-[#3e1919]">
                {advisors.length}{" "}
                {advisors.length === 1 ? "advisor" : "advisors"}
              </p>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-5 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                Notice
              </p>

              <p className="mt-1 text-sm leading-6 text-[#3e1919]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xl leading-none text-[#a79093] transition hover:text-[#3e1919]"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <section className="mt-10">
          {loading ? (
            <div className="border-y border-[#a79093]/30 py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#a79093]/30 border-t-[#3e1919]" />

              <p className="mt-4 text-sm text-[#a79093]">
                Loading advisor directory...
              </p>
            </div>
          ) : advisors.length === 0 ? (
            <div className="border-y border-[#a79093]/30 py-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Directory
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#3e1919]">
                No advisors found
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#a79093]">
                There are currently no advisors available in the system.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                    Directory
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
                    Advisor accounts
                  </h2>
                </div>

                <p className="text-xs text-[#a79093]">
                  Manage status, profile information, and communication.
                </p>
              </div>

              <div className="overflow-x-auto border-y border-[#a79093]/30">
                <table className="min-w-[1100px] w-full">
                  <thead>
                    <tr className="border-b border-[#a79093]/30">
                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                        Advisor
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                        Contact
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                        Type
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                        Location
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                        Status
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {advisors.map((advisor) => (
                      <tr
                        key={
                          advisor.advisor_id || advisor._id || advisor.email
                        }
                        className="border-b border-[#a79093]/15 last:border-b-0 transition-colors hover:bg-[#f0e2d6]/40"
                      >
                        {/* Advisor */}
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#3e1919] text-xs font-semibold text-[#f7f5f6]">
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
                              <p className="text-sm font-medium text-[#3e1919]">
                                {advisor.name}
                              </p>

                              {advisor.advisor_id && (
                                <p className="mt-1 text-[11px] text-[#a79093]">
                                  {advisor.advisor_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-5">
                          <p className="text-sm text-[#3e1919]">
                            {advisor.email}
                          </p>

                          {advisor.phone_number && (
                            <p className="mt-1 text-xs text-[#a79093]">
                              {advisor.phone_number}
                            </p>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-5">
                          <span className="border border-[#a79093]/35 bg-[#f0e2d6] px-2.5 py-1 text-[11px] font-medium capitalize text-[#3e1919]">
                            {advisor.type}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-5 text-sm text-[#a79093]">
                          {advisor.location || "—"}
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
                              className={`h-2 w-2 ${
                                advisor.active
                                  ? "bg-[#3e1919]"
                                  : "bg-[#a79093]"
                              }`}
                            />

                            <span
                              className={`text-xs font-medium ${
                                advisor.active
                                  ? "text-[#3e1919]"
                                  : "text-[#a79093]"
                              }`}
                            >
                              {advisor.active ? "Active" : "Inactive"}
                            </span>

                            <span className="text-[10px] text-[#a79093] opacity-0 transition group-hover:opacity-100">
                              Toggle
                            </span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedAdvisor(advisor)}
                              className="border border-[#a79093]/35 px-3 py-1.5 text-xs font-medium text-[#3e1919] transition hover:border-[#3e1919] hover:bg-[#f0e2d6]"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenChat(advisor)}
                              disabled={
                                isUpdating ||
                                isDeleting ||
                                !advisor.advisor_id
                              }
                              className="bg-[#3e1919] px-3 py-1.5 text-xs font-medium text-[#f7f5f6] transition hover:bg-[#3e1919]/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Chat
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingAdvisor({
                                  ...advisor,
                                  working_hours: advisor.working_hours || {
                                    start: "",
                                    end: "",
                                  },
                                })
                              }
                              disabled={
                                isUpdating ||
                                isDeleting ||
                                !advisor.advisor_id
                              }
                              className="border border-[#a79093]/35 px-3 py-1.5 text-xs font-medium text-[#3e1919] transition hover:border-[#3e1919] hover:bg-[#f0e2d6] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => setAdvisorToDelete(advisor)}
                              disabled={
                                isUpdating ||
                                isDeleting ||
                                !advisor.advisor_id
                              }
                              className="px-3 py-1.5 text-xs font-medium text-[#a79093] transition hover:bg-[#f0e2d6] hover:text-[#3e1919] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* View Modal */}
        {selectedAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3e1919]/60 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-[#f7f5f6] shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#a79093]/30 px-6 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                    Advisor profile
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
                    Advisor details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="text-2xl leading-none text-[#a79093] transition hover:text-[#3e1919]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="divide-y divide-[#a79093]/20 px-6">
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
                    <p className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#a79093]">
                      {label}
                    </p>

                    <p className="max-w-[62%] break-words text-right text-sm text-[#3e1919]">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-6 py-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#a79093]">
                    Status
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 ${
                        selectedAdvisor.active
                          ? "bg-[#3e1919]"
                          : "bg-[#a79093]"
                      }`}
                    />

                    <p className="text-sm font-medium text-[#3e1919]">
                      {selectedAdvisor.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#a79093]/30 px-6 py-5">
                <button
                  type="button"
                  onClick={() => handleOpenChat(selectedAdvisor)}
                  disabled={!selectedAdvisor.advisor_id}
                  className="bg-[#3e1919] px-5 py-2.5 text-sm font-medium text-[#f7f5f6] transition hover:bg-[#3e1919]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open chat
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="border border-[#a79093]/40 px-5 py-2.5 text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3e1919]/60 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#f7f5f6] shadow-2xl">
              <div className="flex items-start justify-between border-b border-[#a79093]/30 px-6 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                    Advisor management
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
                    Edit advisor
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  className="text-2xl leading-none text-[#a79093] transition hover:text-[#3e1919]"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-x-6 gap-y-5 px-6 py-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
                    Advisor ID
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.advisor_id || ""}
                    disabled
                    className="w-full border border-[#a79093]/25 bg-[#f0e2d6]/60 px-3 py-2.5 text-sm text-[#a79093] outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a79093]">
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
                    className="w-full border border-[#a79093]/35 bg-white px-3 py-2.5 text-sm text-[#3e1919] outline-none transition focus:border-[#3e1919]"
                  />
                </div>

                <div className="border-t border-[#a79093]/20 pt-5 md:col-span-2">
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
                      className="h-4 w-4 accent-[#3e1919]"
                    />

                    <span>
                      <span className="block text-sm font-medium text-[#3e1919]">
                        Advisor is active
                      </span>

                      <span className="mt-0.5 block text-xs text-[#a79093]">
                        Active advisors can receive and manage conversations.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#a79093]/30 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  disabled={isUpdating}
                  className="border border-[#a79093]/40 px-5 py-2.5 text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateAdvisor}
                  disabled={isUpdating}
                  className="bg-[#3e1919] px-5 py-2.5 text-sm font-medium text-[#f7f5f6] transition hover:bg-[#3e1919]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {advisorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3e1919]/60 p-4">
            <div className="w-full max-w-md bg-[#f7f5f6] shadow-2xl">
              <div className="border-b border-[#a79093]/30 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                  Confirmation required
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#3e1919]">
                  Delete advisor
                </h2>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm leading-6 text-[#a79093]">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#3e1919]">
                    {advisorToDelete.name}
                  </span>
                  ?
                </p>

                <div className="mt-5 border-l-2 border-[#3e1919] bg-[#f0e2d6] px-4 py-3">
                  <p className="text-xs leading-5 text-[#3e1919]">
                    This action cannot be undone. The advisor will be removed
                    from the administration directory.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#a79093]/30 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setAdvisorToDelete(null)}
                  disabled={isDeleting}
                  className="border border-[#a79093]/40 px-5 py-2.5 text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAdvisor}
                  disabled={isDeleting}
                  className="bg-[#3e1919] px-5 py-2.5 text-sm font-medium text-[#f7f5f6] transition hover:bg-[#3e1919]/90 disabled:cursor-not-allowed disabled:opacity-50"
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