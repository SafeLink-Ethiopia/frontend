
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MoreVertical, X, MessageCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const API_URL = "https://backend-tncs.onrender.com/api";

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError(t("admin.common.errors.authRequired"));
        return;
      }

      const response = await axios.get<AdvisorsResponse>(
        `${API_URL}/advisors`,
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
        setError(
          error.response?.data?.message || t("admin.advisors.errors.load"),
        );
      } else {
        setError(t("admin.advisors.errors.loadUnexpected"));
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
      setError(t("admin.advisors.errors.missingId"));
      return;
    }

    try {
      setIsUpdating(true);
      setError("");
      setOpenMenu(null);

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError(t("admin.common.errors.authRequired"));
        return;
      }

      const response = await axios.patch(
        `${API_URL}/advisors/${advisor.advisor_id}/active`,
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
          error.response?.data?.message ||
            t("admin.advisors.errors.updateStatus"),
        );
      } else {
        setError(t("admin.common.errors.unexpected"));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAdvisor = async () => {
    if (!advisorToDelete?.advisor_id) {
      setError(t("admin.advisors.errors.missingId"));
      return;
    }

    try {
      setIsDeleting(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError(t("admin.common.errors.authRequired"));
        return;
      }

      await axios.delete(
        `${API_URL}/advisors/${advisorToDelete.advisor_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAdvisors((currentAdvisors) =>
        currentAdvisors.filter(
          (advisor) =>
            advisor.advisor_id !== advisorToDelete.advisor_id,
        ),
      );

      setAdvisorToDelete(null);
    } catch (error) {
      console.error("Failed to delete advisor:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            t("admin.advisors.errors.delete"),
        );
      } else {
        setError(t("admin.advisors.errors.deleteUnexpected"));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateAdvisor = async () => {
    if (!editingAdvisor?.advisor_id) {
      setError(t("admin.advisors.errors.missingId"));
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError(t("admin.common.errors.authRequired"));
        return;
      }

      const response = await axios.patch(
        `${API_URL}/advisors/${editingAdvisor.advisor_id}`,
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
        setError(
          error.response?.data?.message ||
            t("admin.advisors.errors.update"),
        );
      } else {
        setError(t("admin.advisors.errors.updateUnexpected"));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChat = (advisor: Advisor) => {
    if (!advisor.advisor_id) {
      setError(t("admin.advisors.errors.noId"));
      return;
    }

    setOpenMenu(null);
    navigate(`/admin/advisors/${advisor.advisor_id}/chat`);
  };

  const openEdit = (advisor: Advisor) => {
    setOpenMenu(null);

    setEditingAdvisor({
      ...advisor,
      working_hours: advisor.working_hours || {
        start: "",
        end: "",
      },
    });
  };

  const openDelete = (advisor: Advisor) => {
    setOpenMenu(null);
    setAdvisorToDelete(advisor);
  };

  const translateGender = (gender: string) => {
    const key = gender.toLowerCase();
    return ["male", "female", "other"].includes(key)
      ? t(`admin.createAdvisor.options.${key}`)
      : gender;
  };
  const translateType = (type: string) => {
    const key = type.toLowerCase();
    return ["medical", "legal", "psychological", "general"].includes(key)
      ? t(`admin.createAdvisor.options.${key}`)
      : type;
  };

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        {/* Header */}
        <header className="border-b border-[#2F8F4E]/15 pb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2F8F4E]">
                {t("admin.brand.administration")}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173B28] sm:text-4xl">
                {t("admin.advisors.title")}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#176B3A]/70">
                {t("admin.advisors.description")}
              </p>
            </div>

            <div className="flex items-center gap-3 border-l-2 border-[#2F8F4E] pl-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#176B3A]/60">
                  {t("admin.advisors.directory")}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#173B28]">
                  {t("admin.advisors.advisorCount", { count: advisors.length })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 border-l-4 border-[#176B3A] bg-[#E7F1E3] px-4 py-4 sm:px-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                {t("admin.common.notice")}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#173B28]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-xl leading-none text-[#176B3A]/60 transition hover:text-[#173B28]"
              aria-label={t("admin.common.closeError")}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        <section className="mt-8 sm:mt-10">
          {loading ? (
            <div className="border-y border-[#2F8F4E]/15 py-20 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#2F8F4E]/20 border-t-[#2F8F4E]" />

              <p className="mt-4 text-sm text-[#176B3A]/65">
                {t("admin.advisors.loading")}
              </p>
            </div>
          ) : advisors.length === 0 ? (
            <div className="border-y border-[#2F8F4E]/15 py-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                {t("admin.advisors.directory")}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#173B28]">
                {t("admin.advisors.emptyTitle")}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#176B3A]/70">
                {t("admin.advisors.emptyDescription")}
              </p>
            </div>
          ) : (
            <div>
              {/* Section heading */}
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    {t("admin.advisors.directory")}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#173B28]">
                    {t("admin.advisors.accounts")}
                  </h2>
                </div>

                <p className="text-xs text-[#176B3A]/60">
                  {t("admin.advisors.selectForActions")}
                </p>
              </div>

              {/* Advisor list */}
              <div className="divide-y divide-[#2F8F4E]/10 border-y border-[#2F8F4E]/15">
                {advisors.map((advisor) => {
                  const advisorKey =
                    advisor.advisor_id ||
                    advisor._id ||
                    advisor.email;

                  return (
                    <div
                      key={advisorKey}
                      className="relative py-5 transition hover:bg-[#E7F1E3]/35"
                    >
                      <div className="grid gap-5 lg:grid-cols-[minmax(230px,1.5fr)_minmax(220px,1.2fr)_140px_150px_auto] lg:items-center">

                        {/* Advisor */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-bold text-[#176B3A]">
                            {advisor.name
                              ? advisor.name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                              : "AD"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#173B28]">
                              {advisor.name}
                            </p>

                            {advisor.advisor_id && (
                              <p className="mt-1 truncate text-[11px] text-[#176B3A]/55">
                                {advisor.advisor_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[#173B28]">
                            {advisor.email}
                          </p>

                          {advisor.phone_number && (
                            <p className="mt-1 truncate text-xs text-[#176B3A]/55">
                              {advisor.phone_number}
                            </p>
                          )}
                        </div>

                        {/* Type */}
                        <div>
                          <span className="inline-flex rounded-full bg-[#E7F1E3] px-3 py-1 text-[11px] font-semibold capitalize text-[#176B3A]">
                            {translateType(advisor.type)}
                          </span>
                        </div>

                        {/* Status */}
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleActive(advisor)
                            }
                            disabled={
                              isUpdating ||
                              isDeleting ||
                              !advisor.advisor_id
                            }
                            className="group flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                advisor.active
                                  ? "bg-[#2F8F4E]"
                                  : "bg-[#176B3A]/25"
                              }`}
                            />

                            <span
                              className={`text-xs font-semibold ${
                                advisor.active
                                  ? "text-[#176B3A]"
                                  : "text-[#176B3A]/50"
                              }`}
                            >
                              {advisor.active
                                ? t("admin.common.active")
                                : t("admin.common.inactive")}
                            </span>
                          </button>

                          {advisor.location && (
                            <p className="mt-1 truncate text-[11px] text-[#176B3A]/50">
                              {advisor.location}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="relative flex justify-start lg:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === advisorKey
                                  ? null
                                  : advisorKey,
                              )
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#2F8F4E]/20 bg-[#FAFBF7] px-3 text-xs font-semibold text-[#173B28] transition hover:border-[#2F8F4E]/40 hover:bg-[#E7F1E3]"
                          >
                            <span>{t("admin.common.actions")}</span>
                            <MoreVertical size={16} />
                          </button>

                          {openMenu === advisorKey && (
                            <>
                              <button
                                type="button"
                                aria-label={t("admin.common.closeActions")}
                                className="fixed inset-0 z-30 cursor-default"
                                onClick={() => setOpenMenu(null)}
                              />

                              <div className="absolute right-0 top-11 z-40 w-44 overflow-hidden rounded-xl border border-[#2F8F4E]/15 bg-[#FAFBF7] shadow-lg shadow-[#173B28]/10">

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAdvisor(advisor);
                                    setOpenMenu(null);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#E7F1E3]"
                                >
                                  <Eye size={16} />
                                  {t("admin.common.view")}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenChat(advisor)
                                  }
                                  disabled={!advisor.advisor_id}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#E7F1E3] disabled:opacity-40"
                                >
                                  <MessageCircle size={16} />
                                  {t("admin.common.chat")}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit(advisor)
                                  }
                                  disabled={!advisor.advisor_id}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#E7F1E3] disabled:opacity-40"
                                >
                                  <Pencil size={16} />
                                  {t("admin.common.edit")}
                                </button>

                                <div className="border-t border-[#2F8F4E]/10" />

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDelete(advisor)
                                  }
                                  disabled={!advisor.advisor_id}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:opacity-40"
                                >
                                  <Trash2 size={16} />
                                  {t("admin.common.delete")}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* View Modal */}
        {selectedAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2F8F4E]/15 bg-[#FAFBF7] shadow-2xl">

              <div className="flex items-start justify-between border-b border-[#2F8F4E]/10 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    {t("admin.advisors.profile")}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#173B28]">
                    {t("admin.advisors.details")}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="rounded-lg p-2 text-[#176B3A]/50 transition hover:bg-[#E7F1E3] hover:text-[#173B28]"
                  aria-label={t("admin.common.close")}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="divide-y divide-[#2F8F4E]/10 px-5 sm:px-6">
                {[
                  [
                    t("admin.advisors.fields.advisorId"),
                    selectedAdvisor.advisor_id || "—",
                  ],
                  [t("admin.advisors.fields.name"), selectedAdvisor.name],
                  [t("admin.advisors.fields.email"), selectedAdvisor.email],
                  [t("admin.advisors.fields.gender"), translateGender(selectedAdvisor.gender)],
                  [t("admin.advisors.fields.type"), translateType(selectedAdvisor.type)],
                  [
                    t("admin.advisors.fields.phone"),
                    selectedAdvisor.phone_number || "—",
                  ],
                  [
                    t("admin.advisors.fields.location"),
                    selectedAdvisor.location || "—",
                  ],
                  [
                    t("admin.advisors.fields.workingHours"),
                    `${selectedAdvisor.working_hours?.start || "—"} - ${
                      selectedAdvisor.working_hours?.end || "—"
                    }`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-5 py-4"
                  >
                    <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#176B3A]/50">
                      {label}
                    </p>

                    <p className="max-w-[65%] break-words text-right text-sm text-[#173B28]">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#176B3A]/50">
                    {t("admin.advisors.fields.status")}
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        selectedAdvisor.active
                          ? "bg-[#2F8F4E]"
                          : "bg-[#176B3A]/25"
                      }`}
                    />

                    <p className="text-sm font-semibold text-[#173B28]">
                      {selectedAdvisor.active
                        ? t("admin.common.active")
                        : t("admin.common.inactive")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#2F8F4E]/10 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setSelectedAdvisor(null)}
                  className="rounded-lg border border-[#2F8F4E]/20 px-5 py-2.5 text-sm font-semibold text-[#173B28] transition hover:bg-[#E7F1E3]"
                >
                  {t("admin.common.close")}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenChat(selectedAdvisor)}
                  disabled={!selectedAdvisor.advisor_id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2F8F4E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176B3A] disabled:opacity-50"
                >
                  <MessageCircle size={16} />
                  {t("admin.advisors.openChat")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingAdvisor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/50 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#2F8F4E]/15 bg-[#FAFBF7] shadow-2xl">

              <div className="flex items-start justify-between border-b border-[#2F8F4E]/10 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    {t("admin.advisors.management")}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#173B28]">
                    {t("admin.advisors.editTitle")}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  className="rounded-lg p-2 text-[#176B3A]/50 transition hover:bg-[#E7F1E3] hover:text-[#173B28]"
                  aria-label={t("admin.common.close")}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-6">

                {/* Advisor ID */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.advisorId")}
                  </label>

                  <input
                    type="text"
                    value={editingAdvisor.advisor_id || ""}
                    disabled
                    className="w-full rounded-lg border border-[#2F8F4E]/10 bg-[#E7F1E3]/50 px-3 py-2.5 text-sm text-[#176B3A]/50 outline-none"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.name")}
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
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.email")}
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
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.gender")}
                  </label>

                  <select
                    value={editingAdvisor.gender}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        gender: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  >
                    <option value="">{t("admin.createAdvisor.options.selectGender")}</option>
                    <option value="male">{t("admin.createAdvisor.options.male")}</option>
                    <option value="female">{t("admin.createAdvisor.options.female")}</option>
                    <option value="other">{t("admin.createAdvisor.options.other")}</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.type")}
                  </label>

                  <select
                    value={editingAdvisor.type}
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        type: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  >
                    <option value="">{t("admin.createAdvisor.options.selectType")}</option>
                    <option value="medical">{t("admin.createAdvisor.options.medical")}</option>
                    <option value="legal">{t("admin.createAdvisor.options.legal")}</option>
                    <option value="psychological">
                      {t("admin.createAdvisor.options.psychological")}
                    </option>
                    <option value="general">{t("admin.createAdvisor.options.general")}</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.phone")}
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
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.location")}
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
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  />
                </div>

                {/* Start */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.workingHoursStart")}
                  </label>

                  <input
                    type="time"
                    value={
                      editingAdvisor.working_hours?.start || ""
                    }
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        working_hours: {
                          start: event.target.value,
                          end:
                            editingAdvisor.working_hours?.end ||
                            "",
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  />
                </div>

                {/* End */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B28]">
                    {t("admin.advisors.fields.workingHoursEnd")}
                  </label>

                  <input
                    type="time"
                    value={
                      editingAdvisor.working_hours?.end || ""
                    }
                    onChange={(event) =>
                      setEditingAdvisor({
                        ...editingAdvisor,
                        working_hours: {
                          start:
                            editingAdvisor.working_hours?.start ||
                            "",
                          end: event.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-[#2F8F4E]/20 bg-white px-3 py-2.5 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E]"
                  />
                </div>

                {/* Active */}
                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-[#2F8F4E]/15 bg-[#E7F1E3]/45 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={editingAdvisor.active}
                        onChange={(event) =>
                          setEditingAdvisor({
                            ...editingAdvisor,
                            active: event.target.checked,
                          })
                        }
                        className="mt-1 h-4 w-4 accent-[#2F8F4E]"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-[#173B28]">
                          {t("admin.advisors.activeToggle")}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-[#176B3A]/65">
                          {t("admin.advisors.activeDescription")}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#2F8F4E]/10 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setEditingAdvisor(null)}
                  disabled={isUpdating}
                  className="rounded-lg border border-[#2F8F4E]/20 px-5 py-2.5 text-sm font-semibold text-[#173B28] transition hover:bg-[#E7F1E3] disabled:opacity-50"
                >
                  {t("admin.common.cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleUpdateAdvisor}
                  disabled={isUpdating}
                  className="rounded-lg bg-[#2F8F4E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? t("admin.common.saving") : t("admin.common.saveChanges")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {advisorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#2F8F4E]/15 bg-[#FAFBF7] shadow-2xl">

              <div className="flex items-start justify-between border-b border-[#2F8F4E]/10 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                    {t("admin.advisors.confirmationRequired")}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-[#173B28]">
                    {t("admin.advisors.deleteTitle")}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setAdvisorToDelete(null)}
                  className="rounded-lg p-2 text-[#176B3A]/50 transition hover:bg-[#E7F1E3] hover:text-[#173B28]"
                  aria-label={t("admin.common.close")}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 py-6 sm:px-6">
                <p className="text-sm leading-6 text-[#176B3A]/70">
                  {t("admin.advisors.deleteConfirm", { name: advisorToDelete.name })}
                </p>

                <div className="mt-5 rounded-xl border border-[#2F8F4E]/15 bg-[#E7F1E3] px-4 py-3">
                  <p className="text-xs leading-5 text-[#176B3A]">
                    {t("admin.advisors.deleteWarning")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#2F8F4E]/10 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setAdvisorToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-lg border border-[#2F8F4E]/20 px-5 py-2.5 text-sm font-semibold text-[#173B28] transition hover:bg-[#E7F1E3] disabled:opacity-50"
                >
                  {t("admin.common.cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAdvisor}
                  disabled={isDeleting}
                  className="rounded-lg bg-[#176B3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173B28] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? t("admin.common.deleting") : t("admin.advisors.deleteTitle")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
