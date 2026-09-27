import { useEffect, useState } from "react";
import axios from "axios";

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
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingAdvisorId, setUpdatingAdvisorId] = useState("");
  const [deletingAdvisorId, setDeletingAdvisorId] = useState("");
  const [savingAdvisor, setSavingAdvisor] = useState(false);
  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);

  useEffect(() => {
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

        setAdvisors(response.data.advisors);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Failed to load advisors. Please try again.",
          );
        } else {
          setError("Something went wrong while loading advisors.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const handleToggleActive = async (advisor: Advisor) => {
    if (!advisor.advisor_id) {
      setError("This advisor does not have an advisor ID.");
      return;
    }

    try {
      setUpdatingAdvisorId(advisor.advisor_id);
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
            "Content-Type": "application/json",
          },
        },
      );

      const updatedAdvisor = response.data.advisor;

      setAdvisors((currentAdvisors) =>
        currentAdvisors.map((currentAdvisor) =>
          currentAdvisor.advisor_id === updatedAdvisor.advisor_id
            ? {
                ...currentAdvisor,
                active: updatedAdvisor.active,
              }
            : currentAdvisor,
        ),
      );

      if (selectedAdvisor?.advisor_id === updatedAdvisor.advisor_id) {
        setSelectedAdvisor((current) =>
          current
            ? {
                ...current,
                active: updatedAdvisor.active,
              }
            : null,
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Failed to update advisor status.",
        );
      } else {
        setError("Something went wrong while updating advisor status.");
      }
    } finally {
      setUpdatingAdvisorId("");
    }
  };

  const handleDeleteAdvisor = async () => {
    if (!advisorToDelete?.advisor_id) {
      setError("This advisor does not have an advisor ID.");
      setAdvisorToDelete(null);
      return;
    }

    try {
      setDeletingAdvisorId(advisorToDelete.advisor_id);
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

      if (selectedAdvisor?.advisor_id === advisorToDelete.advisor_id) {
        setSelectedAdvisor(null);
      }

      setAdvisorToDelete(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to delete advisor.");
      } else {
        setError("Something went wrong while deleting advisor.");
      }
    } finally {
      setDeletingAdvisorId("");
    }
  };

  const handleUpdateAdvisor = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingAdvisor?.advisor_id) {
      setError("This advisor does not have an advisor ID.");
      return;
    }

    try {
      setSavingAdvisor(true);
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const updatedAdvisor = response.data.advisor;

      setAdvisors((currentAdvisors) =>
        currentAdvisors.map((advisor) =>
          advisor.advisor_id === updatedAdvisor.advisor_id
            ? {
                ...advisor,
                ...updatedAdvisor,
              }
            : advisor,
        ),
      );

      if (selectedAdvisor?.advisor_id === updatedAdvisor.advisor_id) {
        setSelectedAdvisor({
          ...selectedAdvisor,
          ...updatedAdvisor,
        });
      }

      setEditingAdvisor(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to update advisor.");
      } else {
        setError("Something went wrong while updating advisor.");
      }
    } finally {
      setSavingAdvisor(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Advisors</h1>

            <p className="mt-2 text-sm text-slate-500">
              View and manage all SafeLink advisors.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-4 font-medium text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">Loading advisors...</p>
            </div>
          ) : advisors.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">No advisors found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Advisor
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Type
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Working Hours
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {advisors.map((advisor) => {
                      const isUpdating =
                        updatingAdvisorId === advisor.advisor_id;

                      const isDeleting =
                        deletingAdvisorId === advisor.advisor_id;

                      return (
                        <tr
                          key={advisor._id || advisor.advisor_id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {advisor.name}
                              </p>

                              {advisor.advisor_id && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {advisor.advisor_id}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {advisor.email}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                              {advisor.type}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {advisor.working_hours
                              ? `${advisor.working_hours.start} - ${advisor.working_hours.end}`
                              : "Not available"}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(advisor)}
                                disabled={isUpdating || isDeleting}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                  advisor.active
                                    ? "bg-green-500"
                                    : "bg-slate-300"
                                } ${
                                  isUpdating || isDeleting
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
                                }`}
                                aria-label={
                                  advisor.active
                                    ? `Deactivate ${advisor.name}`
                                    : `Activate ${advisor.name}`
                                }
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                    advisor.active
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  advisor.active
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {advisor.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedAdvisor(advisor)}
                                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                              >
                                View
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
                                className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
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
      </div>

      {advisorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.82 14a2 2 0 001.74 3h15.58a2 2 0 001.74-3l-7.82-14a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900">Delete Advisor</h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                {advisorToDelete.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAdvisorToDelete(null)}
                disabled={deletingAdvisorId === advisorToDelete.advisor_id}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAdvisor}
                disabled={deletingAdvisorId === advisorToDelete.advisor_id}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingAdvisorId === advisorToDelete.advisor_id
                  ? "Deleting..."
                  : "Delete Advisor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Advisor Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete advisor account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdvisor(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Advisor ID
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedAdvisor.advisor_id || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedAdvisor.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm text-slate-700">
                  {selectedAdvisor.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Gender
                </p>

                <p className="mt-1 text-sm capitalize text-slate-700">
                  {selectedAdvisor.gender || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Advisor Type
                </p>

                <p className="mt-1 text-sm capitalize text-slate-700">
                  {selectedAdvisor.type || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone Number
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedAdvisor.phone_number || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedAdvisor.location || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Working Hours
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedAdvisor.working_hours
                    ? `${selectedAdvisor.working_hours.start} - ${selectedAdvisor.working_hours.end}`
                    : "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Account Status
                </p>

                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      selectedAdvisor.active
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {selectedAdvisor.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedAdvisor(null);
                  setEditingAdvisor({
                    ...selectedAdvisor,
                    working_hours: selectedAdvisor.working_hours || {
                      start: "",
                      end: "",
                    },
                  });
                }}
                className="rounded-lg bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-600 transition hover:bg-amber-100"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setSelectedAdvisor(null)}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Advisor
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update advisor account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingAdvisor(null)}
                disabled={savingAdvisor}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Close"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateAdvisor}>
              <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Advisor ID
                  </label>

                  <input
                    value={editingAdvisor.advisor_id || ""}
                    disabled
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    value={editingAdvisor.name}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        name: event.target.value,
                      })
                    }
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
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
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
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
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select gender</option>

                    <option value="male">Male</option>

                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Advisor Type
                  </label>

                  <select
                    value={editingAdvisor.type}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        type: event.target.value,
                      })
                    }
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select type</option>

                    <option value="medical">Medical</option>

                    <option value="legal">Legal</option>

                    <option value="psychological">Psychological</option>

                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Phone Number
                  </label>

                  <input
                    value={editingAdvisor.phone_number || ""}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        phone_number: event.target.value,
                      })
                    }
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Location
                  </label>

                  <input
                    value={editingAdvisor.location || ""}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        location: event.target.value,
                      })
                    }
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Start Time
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
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    End Time
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
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  disabled={savingAdvisor}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingAdvisor}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingAdvisor ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
