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

  /*
   * Fetch advisors
   */
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

  /*
   * Toggle advisor active/inactive
   */
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

  /*
   * Delete advisor
   */
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

  /*
   * Update advisor
   */
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

  /*
   * Open advisor chat
   */
  const handleOpenChat = (advisor: Advisor) => {
    console.log("Opening chat for advisor:", advisor.advisor_id);

    if (!advisor.advisor_id) {
      setError("This advisor does not have an advisor ID.");
      return;
    }

    navigate(`/admin/advisors/${advisor.advisor_id}/chat`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Advisors</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your advisors and communicate with them.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-medium text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">Loading advisors...</p>
          </div>
        ) : advisors.length === 0 ? (
          /* Empty */
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">
              No advisors found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no advisors available.
            </p>
          </div>
        ) : (
          /* Advisors table */
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Advisor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Location
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {advisors.map((advisor) => (
                    <tr
                      key={advisor.advisor_id || advisor._id || advisor.email}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Advisor */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">
                            {advisor.name}
                          </p>

                          {advisor.advisor_id && (
                            <p className="mt-1 text-xs text-slate-400">
                              {advisor.advisor_id}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-700">
                            {advisor.email}
                          </p>

                          {advisor.phone_number && (
                            <p className="mt-1 text-xs text-slate-400">
                              {advisor.phone_number}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                          {advisor.type}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {advisor.location || "—"}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(advisor)}
                          disabled={
                            isUpdating || isDeleting || !advisor.advisor_id
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            advisor.active
                              ? "bg-green-50 text-green-600 hover:bg-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {advisor.active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setSelectedAdvisor(advisor)}
                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                          >
                            View
                          </button>

                          {/* Chat */}
                          <button
                            type="button"
                            onClick={() => handleOpenChat(advisor)}
                            disabled={
                              isUpdating || isDeleting || !advisor.advisor_id
                            }
                            className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Chat
                          </button>

                          {/* Edit */}
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
                              isUpdating || isDeleting || !advisor.advisor_id
                            }
                            className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setAdvisorToDelete(advisor)}
                            disabled={
                              isUpdating || isDeleting || !advisor.advisor_id
                            }
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* View Modal */}
        {selectedAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Advisor Details
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Advisor ID
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.advisor_id || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Gender
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.gender}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Type
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.type}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.phone_number || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.location || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Working Hours
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAdvisor.working_hours?.start || "—"} -{" "}
                    {selectedAdvisor.working_hours?.end || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Status
                  </p>

                  <p
                    className={`mt-1 text-sm font-medium ${
                      selectedAdvisor.active ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selectedAdvisor.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => handleOpenChat(selectedAdvisor)}
                  disabled={!selectedAdvisor.advisor_id}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open Chat
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Edit Advisor
                </h2>

                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2">
                {/* Advisor ID */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Advisor ID
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.advisor_id || ""}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone Number
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Working hours start */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Working Hours Start
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Working hours end */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Working Hours End
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center gap-3 md:col-span-2">
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
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  <label
                    htmlFor="advisor-active"
                    className="text-sm font-medium text-slate-700"
                  >
                    Advisor is active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  disabled={isUpdating}
                  className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateAdvisor}
                  disabled={isUpdating}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {advisorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
              <div className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <span className="text-xl text-red-600">!</span>
                </div>

                <h2 className="text-lg font-semibold text-slate-800">
                  Delete Advisor
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-700">
                    {advisorToDelete.name}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAdvisorToDelete(null)}
                    disabled={isDeleting}
                    className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAdvisor}
                    disabled={isDeleting}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Advisor"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
