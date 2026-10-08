import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Edit3,
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

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

const API_URL = "http://localhost:5000/api/advisors";

/*
|--------------------------------------------------------------------------
| SafeLink Ethiopia — Previous Page Color Palette
|--------------------------------------------------------------------------
|
| Mist       #FAFBF7
| Mint       #E7F1E3
| Leaf       #2F8F4E
| Forest     #176B3A
| Ink        #173B28
|
*/

const COLORS = {
  mist: "#FAFBF7",
  mint: "#E7F1E3",
  leaf: "#2F8F4E",
  forest: "#176B3A",
  ink: "#173B28",
};

export default function Advisors() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "error">("success");

  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);

  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);

  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Notification
  |--------------------------------------------------------------------------
  */

  const showNotice = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setNotice(message);
    setNoticeType(type);

    window.setTimeout(() => {
      setNotice("");
    }, 3500);
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch advisors
  |--------------------------------------------------------------------------
  */

  const fetchAdvisors = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        showNotice("Admin authentication required.", "error");
        return;
      }

      const response = await axios.get<AdvisorsResponse>(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAdvisors(response.data.advisors || []);
    } catch (error) {
      console.error("Failed to fetch advisors:", error);

      if (axios.isAxiosError(error)) {
        showNotice(
          error.response?.data?.message || "Failed to load advisors.",
          "error",
        );
      } else {
        showNotice("Something went wrong while loading advisors.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Toggle advisor status
  |--------------------------------------------------------------------------
  */

  const handleToggleActive = async (advisor: Advisor) => {
    if (!advisor.advisor_id) {
      showNotice("Advisor ID is missing.", "error");
      return;
    }

    try {
      setIsUpdating(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        showNotice("Admin authentication required.", "error");
        return;
      }

      const response = await axios.patch(
        `${API_URL}/${advisor.advisor_id}/active`,
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

      if (selectedAdvisor?.advisor_id === advisor.advisor_id) {
        setSelectedAdvisor((current) =>
          current
            ? {
                ...current,
                active: updatedAdvisor.active ?? !advisor.active,
              }
            : null,
        );
      }

      showNotice(
        `${advisor.name} is now ${
          (updatedAdvisor.active ?? !advisor.active) ? "active" : "inactive"
        }.`,
      );
    } catch (error) {
      console.error("Failed to update advisor status:", error);

      if (axios.isAxiosError(error)) {
        showNotice(
          error.response?.data?.message || "Failed to update advisor status.",
          "error",
        );
      } else {
        showNotice("Something went wrong while updating the advisor.", "error");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete advisor
  |--------------------------------------------------------------------------
  */

  const handleDeleteAdvisor = async () => {
    if (!advisorToDelete?.advisor_id) {
      showNotice("Advisor ID is missing.", "error");
      return;
    }

    try {
      setIsDeleting(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        showNotice("Admin authentication required.", "error");
        return;
      }

      await axios.delete(`${API_URL}/${advisorToDelete.advisor_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const deletedName = advisorToDelete.name;

      setAdvisors((currentAdvisors) =>
        currentAdvisors.filter(
          (advisor) => advisor.advisor_id !== advisorToDelete.advisor_id,
        ),
      );

      setAdvisorToDelete(null);
      setSelectedAdvisor(null);

      showNotice(`${deletedName} was removed successfully.`);
    } catch (error) {
      console.error("Failed to delete advisor:", error);

      if (axios.isAxiosError(error)) {
        showNotice(
          error.response?.data?.message || "Failed to delete advisor.",
          "error",
        );
      } else {
        showNotice("Something went wrong while deleting the advisor.", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Update advisor
  |--------------------------------------------------------------------------
  */

  const handleUpdateAdvisor = async () => {
    if (!editingAdvisor?.advisor_id) {
      showNotice("Advisor ID is missing.", "error");
      return;
    }

    try {
      setIsUpdating(true);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        showNotice("Admin authentication required.", "error");
        return;
      }

      const response = await axios.patch(
        `${API_URL}/${editingAdvisor.advisor_id}`,
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

      setSelectedAdvisor((current) =>
        current?.advisor_id === editingAdvisor.advisor_id
          ? {
              ...current,
              ...updatedAdvisor,
            }
          : current,
      );

      setEditingAdvisor(null);

      showNotice(
        `${editingAdvisor.name}'s information was updated successfully.`,
      );
    } catch (error) {
      console.error("Failed to update advisor:", error);

      if (axios.isAxiosError(error)) {
        showNotice(
          error.response?.data?.message || "Failed to update advisor.",
          "error",
        );
      } else {
        showNotice("Something went wrong while updating the advisor.", "error");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const getInitials = (name: string) => {
    if (!name) return "AD";

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const activeCount = advisors.filter((advisor) => advisor.active).length;

  const inactiveCount = advisors.length - activeCount;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: COLORS.mist,
        color: COLORS.ink,
      }}
    >
      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        {/* =========================================================
            HEADER
        ========================================================= */}

        <header
          className="border-b pb-7"
          style={{
            borderColor: COLORS.mint,
          }}
        >
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            {/* Brand + Title */}

            <div>
              <div className="mb-4 flex items-center gap-2"></div>

              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  color: COLORS.ink,
                }}
              >
                Advisors
              </h1>

              <p
                className="mt-3 max-w-2xl text-sm leading-6"
                style={{
                  color: COLORS.forest,
                }}
              >
                Manage your advisor team, monitor availability, update profiles,
                and maintain your support network.
              </p>
            </div>

            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div className="grid grid-cols-3 gap-3">
              {/* Total */}

              <div
                className="min-w-[125px] rounded-2xl border px-4 py-3.5"
                style={{
                  backgroundColor: COLORS.mint,
                  borderColor: COLORS.mint,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: COLORS.leaf,
                      color: COLORS.mist,
                    }}
                  >
                    <Users size={17} />
                  </div>

                  <div>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {advisors.length}
                    </p>

                    <p
                      className="text-[10px] font-medium"
                      style={{
                        color: COLORS.forest,
                      }}
                    >
                      Total
                    </p>
                  </div>
                </div>
              </div>

              {/* Active */}

              <div
                className="min-w-[125px] rounded-2xl border px-4 py-3.5"
                style={{
                  backgroundColor: COLORS.mist,
                  borderColor: COLORS.mint,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: COLORS.mint,
                      color: COLORS.leaf,
                    }}
                  >
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {activeCount}
                    </p>

                    <p
                      className="text-[10px] font-medium"
                      style={{
                        color: COLORS.forest,
                      }}
                    >
                      Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Inactive */}

              <div
                className="min-w-[125px] rounded-2xl border px-4 py-3.5"
                style={{
                  backgroundColor: COLORS.mist,
                  borderColor: COLORS.mint,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: COLORS.mint,
                      color: COLORS.forest,
                    }}
                  >
                    <Activity size={17} />
                  </div>

                  <div>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      {inactiveCount}
                    </p>

                    <p
                      className="text-[10px] font-medium"
                      style={{
                        color: COLORS.forest,
                      }}
                    >
                      Inactive
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================
            NOTICE
        ========================================================= */}

        {notice && (
          <div
            className="mt-5 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 shadow-sm"
            style={{
              backgroundColor: COLORS.mint,
              borderColor: COLORS.mint,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: COLORS.leaf,
                  color: COLORS.mist,
                }}
              >
                {noticeType === "success" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <X size={15} />
                )}
              </div>

              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
                  {noticeType === "success" ? "Completed" : "Attention"}
                </p>

                <p
                  className="mt-0.5 text-sm"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {notice}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="rounded-full p-1.5 transition hover:opacity-70"
              style={{
                color: COLORS.forest,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =========================================================
            DIRECTORY
        ========================================================= */}

        <section className="mt-9">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div></div>

            <div
              className="rounded-full px-3 py-1.5 text-[10px] font-semibold"
              style={{
                backgroundColor: COLORS.mint,
                color: COLORS.forest,
              }}
            >
              {advisors.length} {advisors.length === 1 ? "advisor" : "advisors"}{" "}
              registered
            </div>
          </div>

          {/* =======================================================
              LOADING
          ======================================================= */}

          {loading ? (
            <div
              className="rounded-[22px] border py-20 text-center"
              style={{
                backgroundColor: COLORS.mist,
                borderColor: COLORS.mint,
              }}
            >
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: COLORS.mint,
                  color: COLORS.leaf,
                }}
              >
                <Users size={21} />
              </div>

              <p
                className="mt-4 text-sm font-semibold"
                style={{
                  color: COLORS.ink,
                }}
              >
                Loading advisor directory...
              </p>

              <p
                className="mt-1 text-xs"
                style={{
                  color: COLORS.forest,
                }}
              >
                Please wait a moment.
              </p>
            </div>
          ) : advisors.length === 0 ? (
            /* =====================================================
               EMPTY
            ===================================================== */

            <div
              className="rounded-[22px] border py-20 text-center"
              style={{
                backgroundColor: COLORS.mint,
                borderColor: COLORS.mint,
              }}
            >
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: COLORS.leaf,
                  color: COLORS.mist,
                }}
              >
                <Users size={24} />
              </div>

              <h3
                className="mt-5 text-xl font-bold"
                style={{
                  color: COLORS.ink,
                }}
              >
                No advisors found
              </h3>

              <p
                className="mx-auto mt-2 max-w-md text-sm leading-6"
                style={{
                  color: COLORS.forest,
                }}
              >
                There are currently no advisors registered in the SafeLink
                system.
              </p>
            </div>
          ) : (
            /* =====================================================
               TABLE
            ===================================================== */

            <div
              className="overflow-hidden rounded-[22px] border shadow-[0_12px_35px_rgba(23,59,40,0.07)]"
              style={{
                backgroundColor: COLORS.mist,
                borderColor: COLORS.mint,
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse">
                  {/* HEADER */}

                  <thead>
                    <tr
                      style={{
                        backgroundColor: COLORS.mint,
                      }}
                    >
                      <th className="px-6 py-4 text-left">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Advisor
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Contact
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Type
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Location
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Hours
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Status
                        </span>
                      </th>

                      <th className="px-6 py-4 text-right">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: COLORS.forest,
                          }}
                        >
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>

                  {/* BODY */}

                  <tbody>
                    {advisors.map((advisor, index) => (
                      <tr
                        key={advisor.advisor_id || advisor._id || advisor.email}
                        className="group transition-colors hover:bg-[#E7F1E3]"
                        style={{
                          borderTop:
                            index === 0
                              ? `1px solid ${COLORS.mint}`
                              : `1px solid ${COLORS.mint}`,
                        }}
                      >
                        {/* Advisor */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3.5">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: COLORS.mint,
                                color: COLORS.forest,
                              }}
                            >
                              {getInitials(advisor.name)}
                            </div>

                            <div className="min-w-0">
                              <p
                                className="truncate text-sm font-bold"
                                style={{
                                  color: COLORS.ink,
                                }}
                              >
                                {advisor.name}
                              </p>

                              {advisor.advisor_id && (
                                <p
                                  className="mt-1 truncate text-[10px]"
                                  style={{
                                    color: COLORS.forest,
                                  }}
                                >
                                  {advisor.advisor_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-5 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail
                                size={13}
                                style={{
                                  color: COLORS.leaf,
                                }}
                              />

                              <span
                                className="max-w-[210px] truncate text-xs"
                                style={{
                                  color: COLORS.ink,
                                }}
                              >
                                {advisor.email}
                              </span>
                            </div>

                            {advisor.phone_number && (
                              <div className="flex items-center gap-2">
                                <span
                                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                                  style={{
                                    backgroundColor: COLORS.mint,
                                    color: COLORS.forest,
                                  }}
                                >
                                  #
                                </span>

                                <span
                                  className="text-[11px]"
                                  style={{
                                    color: COLORS.forest,
                                  }}
                                >
                                  {advisor.phone_number}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Type */}

                        <td className="px-5 py-5">
                          <div
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                            style={{
                              backgroundColor: COLORS.mint,
                              color: COLORS.forest,
                            }}
                          >
                            <BriefcaseBusiness size={12} />

                            <span className="text-[10px] font-bold capitalize">
                              {advisor.type}
                            </span>
                          </div>
                        </td>

                        {/* Location */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={14}
                              style={{
                                color: COLORS.leaf,
                              }}
                            />

                            <span
                              className="max-w-[150px] truncate text-xs"
                              style={{
                                color: COLORS.forest,
                              }}
                            >
                              {advisor.location || "Not provided"}
                            </span>
                          </div>
                        </td>

                        {/* Hours */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <Clock3
                              size={14}
                              style={{
                                color: COLORS.leaf,
                              }}
                            />

                            <span
                              className="text-xs"
                              style={{
                                color: COLORS.ink,
                              }}
                            >
                              {advisor.working_hours?.start || "--:--"}
                              {" – "}
                              {advisor.working_hours?.end || "--:--"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(advisor)}
                            disabled={
                              isUpdating || isDeleting || !advisor.advisor_id
                            }
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              backgroundColor: COLORS.mint,
                              color: advisor.active
                                ? COLORS.forest
                                : COLORS.ink,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: advisor.active
                                  ? COLORS.leaf
                                  : COLORS.forest,
                              }}
                            />

                            {advisor.active ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            {/* View */}

                            <button
                              type="button"
                              onClick={() => setSelectedAdvisor(advisor)}
                              className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition hover:bg-[#E7F1E3]"
                              style={{
                                borderColor: COLORS.mint,
                                color: COLORS.ink,
                              }}
                            >
                              View
                              <ArrowUpRight size={13} />
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
                              className="flex h-9 w-9 items-center justify-center rounded-xl border transition hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
                              style={{
                                borderColor: COLORS.mint,
                                color: COLORS.forest,
                              }}
                              title="Edit advisor"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete */}

                            <button
                              type="button"
                              onClick={() => setAdvisorToDelete(advisor)}
                              disabled={
                                isUpdating || isDeleting || !advisor.advisor_id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl border transition hover:bg-[#E7F1E3] disabled:cursor-not-allowed disabled:opacity-50"
                              style={{
                                borderColor: COLORS.mint,
                                color: COLORS.forest,
                              }}
                              title="Delete advisor"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}

              <div
                className="flex flex-col gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  backgroundColor: COLORS.mint,
                  borderColor: COLORS.mint,
                }}
              ></div>
            </div>
          )}
        </section>

        {/* =========================================================
            FOOTER
        ========================================================= */}
      </div>

      {/* ===========================================================
          VIEW MODAL
      =========================================================== */}

      {selectedAdvisor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(23,59,40,0.40)",
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[26px] border shadow-2xl"
            style={{
              backgroundColor: COLORS.mist,
              borderColor: COLORS.mint,
            }}
          >
            {/* Header */}

            <div
              className="flex items-start justify-between border-b px-6 py-6"
              style={{
                backgroundColor: COLORS.mint,
                borderColor: COLORS.mint,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: COLORS.leaf,
                    color: COLORS.mist,
                  }}
                >
                  {getInitials(selectedAdvisor.name)}
                </div>

                <div>
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.18em]"
                    style={{
                      color: COLORS.leaf,
                    }}
                  >
                    Advisor profile
                  </p>

                  <h2
                    className="mt-1 text-xl font-bold"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    {selectedAdvisor.name}
                  </h2>

                  <p
                    className="mt-1 text-xs capitalize"
                    style={{
                      color: COLORS.forest,
                    }}
                  >
                    {selectedAdvisor.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdvisor(null)}
                className="rounded-full p-2 transition hover:bg-[#FAFBF7]"
                style={{
                  color: COLORS.ink,
                }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Details */}

            <div>
              {[
                ["Advisor ID", selectedAdvisor.advisor_id || "—"],
                ["Name", selectedAdvisor.name],
                ["Email", selectedAdvisor.email],
                ["Gender", selectedAdvisor.gender],
                ["Type", selectedAdvisor.type],
                ["Phone", selectedAdvisor.phone_number || "Not provided"],
                ["Location", selectedAdvisor.location || "Not provided"],
                [
                  "Working hours",
                  `${selectedAdvisor.working_hours?.start || "--"} - ${
                    selectedAdvisor.working_hours?.end || "--"
                  }`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-6 border-b px-6 py-4"
                  style={{
                    borderColor: COLORS.mint,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.13em]"
                    style={{
                      color: COLORS.forest,
                    }}
                  >
                    {label}
                  </p>

                  <p
                    className="max-w-[60%] break-words text-right text-sm"
                    style={{
                      color: COLORS.ink,
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between px-6 py-5">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
                  Status
                </p>

                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold"
                  style={{
                    backgroundColor: COLORS.mint,
                    color: COLORS.forest,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: COLORS.leaf,
                    }}
                  />

                  {selectedAdvisor.active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Footer */}

            <div
              className="flex justify-end border-t px-6 py-5"
              style={{
                borderColor: COLORS.mint,
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedAdvisor(null)}
                className="rounded-xl px-5 py-2.5 text-xs font-bold transition hover:opacity-80"
                style={{
                  backgroundColor: COLORS.leaf,
                  color: COLORS.mist,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================================
          EDIT MODAL
      =========================================================== */}

      {editingAdvisor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(23,59,40,0.40)",
          }}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] border shadow-2xl"
            style={{
              backgroundColor: COLORS.mist,
              borderColor: COLORS.mint,
            }}
          >
            {/* Header */}

            <div
              className="flex items-start justify-between border-b px-6 py-6"
              style={{
                backgroundColor: COLORS.mint,
                borderColor: COLORS.mint,
              }}
            >
              <div>
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    color: COLORS.leaf,
                  }}
                >
                  Advisor management
                </p>

                <h2
                  className="mt-1 text-xl font-bold"
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  Edit advisor
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingAdvisor(null)}
                className="rounded-full p-2"
                style={{
                  color: COLORS.ink,
                }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}

            <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
              {/* Advisor ID */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
                  Advisor ID
                </label>

                <input
                  type="text"
                  value={editingAdvisor.advisor_id || ""}
                  disabled
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mint,
                    borderColor: COLORS.mint,
                    color: COLORS.forest,
                  }}
                />
              </div>

              {/* Name */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* Email */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* Gender */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Type */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* Phone */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* Location */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* Start */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* End */}

              <div>
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em]"
                  style={{
                    color: COLORS.forest,
                  }}
                >
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
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: COLORS.mist,
                    borderColor: COLORS.mint,
                    color: COLORS.ink,
                  }}
                />
              </div>

              {/* Active */}

              <div
                className="rounded-2xl border p-4 md:col-span-2"
                style={{
                  backgroundColor: COLORS.mint,
                  borderColor: COLORS.mint,
                }}
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editingAdvisor.active}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        active: event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                    style={{
                      accentColor: COLORS.leaf,
                    }}
                  />

                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: COLORS.ink,
                      }}
                    >
                      Advisor is active
                    </p>

                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: COLORS.forest,
                      }}
                    >
                      Active advisors can receive and manage conversations.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}

            <div
              className="flex justify-end gap-2 border-t px-6 py-5"
              style={{
                borderColor: COLORS.mint,
              }}
            >
              <button
                type="button"
                onClick={() => setEditingAdvisor(null)}
                disabled={isUpdating}
                className="rounded-xl border px-5 py-2.5 text-sm font-bold"
                style={{
                  borderColor: COLORS.mint,
                  color: COLORS.forest,
                  backgroundColor: COLORS.mist,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateAdvisor}
                disabled={isUpdating}
                className="rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.leaf,
                  color: COLORS.mist,
                }}
              >
                {isUpdating ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================================
          DELETE CONFIRMATION
      =========================================================== */}

      {advisorToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(23,59,40,0.40)",
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[26px] border shadow-2xl"
            style={{
              backgroundColor: COLORS.mist,
              borderColor: COLORS.mint,
            }}
          >
            <div
              className="px-6 py-6"
              style={{
                backgroundColor: COLORS.mint,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: COLORS.leaf,
                  color: COLORS.mist,
                }}
              >
                <Trash2 size={20} />
              </div>

              <h2
                className="mt-5 text-xl font-bold"
                style={{
                  color: COLORS.ink,
                }}
              >
                Remove advisor?
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{
                  color: COLORS.forest,
                }}
              >
                You are about to remove{" "}
                <strong
                  style={{
                    color: COLORS.ink,
                  }}
                >
                  {advisorToDelete.name}
                </strong>{" "}
                from the advisor directory.
              </p>
            </div>

            <div className="px-6 py-5">
              <div
                className="rounded-2xl border px-4 py-4"
                style={{
                  backgroundColor: COLORS.mist,
                  borderColor: COLORS.mint,
                }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: COLORS.leaf,
                    }}
                  />

                  <p
                    className="text-xs leading-5"
                    style={{
                      color: COLORS.forest,
                    }}
                  >
                    Please confirm that you want to permanently remove this
                    advisor. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="flex justify-end gap-2 border-t px-6 py-5"
              style={{
                borderColor: COLORS.mint,
              }}
            >
              <button
                type="button"
                onClick={() => setAdvisorToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border px-5 py-2.5 text-sm font-bold"
                style={{
                  borderColor: COLORS.mint,
                  color: COLORS.forest,
                  backgroundColor: COLORS.mist,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAdvisor}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: COLORS.forest,
                  color: COLORS.mist,
                }}
              >
                <Trash2 size={14} />

                {isDeleting ? "Removing..." : "Remove advisor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
