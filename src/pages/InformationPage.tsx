import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  addFacility,
  deleteFacility,
  getFacilities,
  updateFacility,
  type Facility,
  type SupportType,
} from "../api/facilityApi";

import { getSafelinkId } from "../services/session";

import medicalIllustration from "../assets/illustrations/medical.svg";
import conversationIllustration from "../assets/illustrations/conversation.svg";
import supportIllustration from "../assets/illustrations/support.svg";
import mapIllustration from "../assets/illustrations/map.svg";
import youIllustration from "../assets/illustrations/you.svg";

type SupportInfo = {
  type: SupportType;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  details: string[];
  image: string;
};

const SUPPORT_OPTIONS: SupportInfo[] = [
  {
    type: "medical",
    title: "Medical Support",
    shortTitle: "Medical",
    eyebrow: "Healthcare",
    description:
      "Healthcare, examination, treatment, and other medical assistance when you need it.",
    details: [
      "Medical attention or healthcare",
      "Examination or treatment",
      "Finding a suitable healthcare facility",
    ],
    image: medicalIllustration,
  },
  {
    type: "legal",
    title: "Legal Support",
    shortTitle: "Legal",
    eyebrow: "Rights & options",
    description:
      "Information and guidance about legal assistance and the options that may be available to you.",
    details: [
      "Understanding possible options",
      "Finding legal assistance",
      "Preparing questions before speaking with someone",
    ],
    image: mapIllustration,
  },
  {
    type: "psychological",
    title: "Psychological Support",
    shortTitle: "Psychological",
    eyebrow: "Emotional wellbeing",
    description:
      "A space to talk about emotional distress, difficult experiences, and your wellbeing.",
    details: [
      "Emotional support",
      "Talking with a trained professional",
      "Support during difficult experiences",
    ],
    image: conversationIllustration,
  },
  {
    type: "general",
    title: "General Support",
    shortTitle: "General",
    eyebrow: "Not sure where to start",
    description:
      "General guidance when you are unsure what kind of help you need or where to begin.",
    details: [
      "Understanding your options",
      "Figuring out where to start",
      "Connecting with an appropriate advisor",
    ],
    image: supportIllustration,
  },
];

function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/safelink-logo.png"
      alt="SafeLink logo"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}

function InformationPage() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SupportType[]>([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [facilityError, setFacilityError] = useState("");

  const [selectedFacility, setSelectedFacility] =
    useState<Facility | null>(null);

  const [selectedSupportInfo, setSelectedSupportInfo] =
    useState<SupportInfo | null>(null);

  const [showAddFacility, setShowAddFacility] = useState(false);

  const [advisorToken, setAdvisorToken] = useState("");

  const [editingFacility, setEditingFacility] =
    useState<Facility | null>(null);

  const [deletingFacilityId, setDeletingFacilityId] =
    useState<string | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("advisor_token") ||
      localStorage.getItem("safelink_advisor_token");

    setAdvisorToken(token || "");
  }, []);

  const isAdvisor = Boolean(advisorToken);

  const loadFacilities = async () => {
    try {
      setLoadingFacilities(true);
      setFacilityError("");

      const data = await getFacilities();

      setFacilities(data);
    } catch (error) {
      console.error("Facility loading error:", error);

      setFacilityError(
        error instanceof Error
          ? error.message
          : "Unable to load facilities.",
      );
    } finally {
      setLoadingFacilities(false);
    }
  };

  useEffect(() => {
    void loadFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    return facilities.filter((facility) => {
      const matchesTypes =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) =>
          facility.support_types.includes(type),
        );

      const matchesLocation =
        !normalizedLocation ||
        facility.location
          .toLowerCase()
          .includes(normalizedLocation);

      const matchesSearch =
        !normalizedSearch ||
        facility.facility_name
          .toLowerCase()
          .includes(normalizedSearch) ||
        facility.location
          .toLowerCase()
          .includes(normalizedSearch) ||
        facility.description
          .toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesTypes &&
        matchesLocation &&
        matchesSearch
      );
    });
  }, [facilities, selectedTypes, search, location]);

  const toggleSupportType = (type: SupportType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const handlePrivateSession = () => {
    const safelinkId = getSafelinkId();

    if (safelinkId) {
      navigate("/support");
      return;
    }

    navigate("/create");
  };

  const scrollToFinder = () => {
    document
      .getElementById("facility-finder")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSearch("");
    setLocation("");
  };

  const handleDeleteFacility = async (facility: Facility) => {
    const token =
      localStorage.getItem("advisor_token") ||
      localStorage.getItem("safelink_advisor_token");

    if (!token) {
      alert("You must be logged in as an advisor.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${facility.facility_name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingFacilityId(facility.facility_id);

      await deleteFacility(facility.facility_id, token);

      if (selectedFacility?.facility_id === facility.facility_id) {
        setSelectedFacility(null);
      }

      await loadFacilities();
    } catch (error) {
      console.error("Delete facility error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete facility.",
      );
    } finally {
      setDeletingFacilityId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFBF7] via-[#E7F1E3] to-[#E7F1E3] pt-8 pb-20 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-32">
        <div className="pointer-events-none absolute -right-24 top-20 h-96 w-96 rounded-full bg-[#2F8F4E]/15 blur-3xl" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#2F8F4E]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Information &amp; support
            </p>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-[#176B3A] sm:text-5xl lg:text-6xl">
              You do not have to know what you need yet.
            </h1>

            <div className="mt-6 h-1 w-20 rounded-full bg-[#2F8F4E]" />

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#173B28]/75 sm:text-lg sm:leading-8">
              Explore different types of support, find available facilities,
              and decide what feels right for you before starting a private
              conversation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToFinder}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#2F8F4E] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A]"
              >
                Find support
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrivateSession}
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-[#2F8F4E] bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#2F8F4E] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E7F1E3]"
              >
                Talk to an advisor
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#173B28]/70 sm:text-sm">
              <span>✓ Explore privately</span>
              <span>✓ No story required</span>
              <span>✓ Choose when ready</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white/70 p-7 shadow-xl backdrop-blur-md">
              <img
                src={supportIllustration}
                alt="People receiving support"
                className="mx-auto h-[320px] w-full object-contain p-4"
              />

              <div className="mt-5 border-t border-[#2F8F4E]/30 pt-5 text-center text-sm leading-6 text-[#173B28]/70">
                Explore information first.
                <br />
                Ask for personal guidance when you are ready.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUPPORT TYPES
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-[#E7F1E3] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
            Understand your options
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#176B3A] sm:text-4xl lg:text-5xl">
            What kind of support might help?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#173B28]/65">
            These categories are starting points, not labels. Read through
            them to learn what each type of support covers.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4">
          {SUPPORT_OPTIONS.map((option) => {
            return (
              <div
                key={option.type}
                className="group overflow-hidden rounded-2xl border border-[#E7F1E3] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-6 px-6 py-5 text-left sm:px-7 sm:py-6">
                  <div className="flex items-start gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E7F1E3] sm:h-20 sm:w-20">
                      <img
                        src={option.image}
                        alt=""
                        className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2F8F4E]">
                        {option.eyebrow}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-[#176B3A] sm:text-xl">
                        {option.title}
                      </h3>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#173B28]/65">
                        {option.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                        {option.details.map((detail) => (
                          <span
                            key={detail}
                            className="text-xs text-[#173B28]/55"
                          >
                            • {detail}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSupportInfo(option)}
                        className="mt-3 text-xs font-semibold text-[#2F8F4E] underline underline-offset-4 transition hover:text-[#176B3A]"
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          FINDER
      ========================================================= */}

      <section
        id="facility-finder"
        className="scroll-mt-24 bg-[#E7F1E3] px-6 py-20 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Find a facility
            </span>

            <h2 className="mt-4 text-3xl font-semibold text-[#176B3A] sm:text-4xl">
              Find support near a location.
            </h2>

            <p className="mt-4 text-base leading-7 text-[#173B28]/70">
              Choose the type of support you are looking for and optionally
              enter a location. Leave everything blank to explore all
              facilities.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-[#2F8F4E]/30 bg-white p-5 shadow-lg sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#176B3A]">
                  Search
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Facility or keyword..."
                  className="w-full rounded-full border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-3.5 text-sm text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#176B3A]">
                  Location
                </span>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Bole, Addis Ababa"
                  className="w-full rounded-full border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-3.5 text-sm text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
                />
              </label>
            </div>

            <div className="mt-7">
              <span className="mb-3 block text-sm font-semibold text-[#176B3A]">
                What type of support?
              </span>

              <div className="flex flex-wrap gap-2">
                {SUPPORT_OPTIONS.map((option) => {
                  const selected = selectedTypes.includes(
                    option.type,
                  );

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() =>
                        toggleSupportType(option.type)
                      }
                      className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                        selected
                          ? "bg-[#2F8F4E] text-white shadow-md"
                          : "border border-[#2F8F4E]/40 bg-white text-[#2F8F4E] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                      }`}
                    >
                      {selected && "✓ "}
                      {option.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-[#2F8F4E]/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#173B28]/60 sm:text-sm">
                {selectedTypes.length > 0 ||
                search ||
                location
                  ? "Showing filtered results"
                  : "Showing all available facilities"}
              </p>

              {(selectedTypes.length > 0 ||
                search ||
                location) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start text-xs font-semibold text-[#2F8F4E] underline underline-offset-4 transition hover:text-[#176B3A] sm:self-auto sm:text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="mt-14">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                  Results
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#176B3A]">
                  Available facilities
                </h3>
              </div>

              <div className="flex items-center gap-4">
                {!loadingFacilities && !facilityError && (
                  <p className="text-sm text-[#173B28]/60">
                    {filteredFacilities.length}{" "}
                    {filteredFacilities.length === 1
                      ? "facility"
                      : "facilities"}
                  </p>
                )}

                {isAdvisor && (
                  <button
                    type="button"
                    onClick={() => setShowAddFacility(true)}
                    className="rounded-full bg-[#2F8F4E] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A] sm:text-sm"
                  >
                    + Add Facility
                  </button>
                )}
              </div>
            </div>

            {loadingFacilities && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-[#E7F1E3] bg-white p-6"
                  >
                    <div className="h-5 w-2/3 rounded bg-[#E7F1E3]" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-[#E7F1E3]" />
                    <div className="mt-5 h-3 w-full rounded bg-[#E7F1E3]" />
                    <div className="mt-2 h-3 w-5/6 rounded bg-[#E7F1E3]" />
                    <div className="mt-6 h-10 w-full rounded-full bg-[#E7F1E3]" />
                  </div>
                ))}
              </div>
            )}

            {!loadingFacilities && facilityError && (
              <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-7 shadow-sm">
                <h3 className="font-semibold text-[#176B3A]">
                  Facilities could not be loaded
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#173B28]/65">
                  {facilityError}
                </p>

                <button
                  type="button"
                  onClick={() => void loadFacilities()}
                  className="mt-5 rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176B3A]"
                >
                  Try again
                </button>
              </div>
            )}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length === 0 && (
                <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F1E3] text-3xl text-[#2F8F4E]">
                    ⌕
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-[#176B3A]">
                    No matching facilities
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#173B28]/65">
                    Nothing matches your current search. Try another
                    location or clear your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176B3A]"
                  >
                    Clear search
                  </button>
                </div>
              )}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFacilities.map((facility) => (
                    <FacilityCard
                      key={facility.facility_id}
                      facility={facility}
                      onView={() =>
                        setSelectedFacility(facility)
                      }
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section className="bg-[#FAFBF7] px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Simple process
            </span>

            <h2 className="mt-4 text-3xl font-semibold text-[#176B3A] sm:text-4xl">
              How SafeLink can help
            </h2>

            <p className="mt-4 text-base leading-7 text-[#173B28]/70">
              Getting support doesn't have to be complicated.
            </p>
          </div>

          <div className="mt-14 flex flex-col lg:flex-row lg:items-start">
            <div className="flex flex-1 items-start gap-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F8F4E] text-sm font-semibold text-[#2F8F4E]">
                01
              </span>

              <div>
                <h3 className="text-lg font-semibold text-[#176B3A]">
                  Explore
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#173B28]/65">
                  Learn about medical, legal, psychological, and general
                  support without explaining your situation.
                </p>
              </div>
            </div>

            <div className="hidden px-6 pt-3 text-2xl text-[#2F8F4E] lg:block">
              →
            </div>

            <div className="mt-10 flex flex-1 items-start gap-5 lg:mt-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F8F4E] text-sm font-semibold text-[#2F8F4E]">
                02
              </span>

              <div>
                <h3 className="text-lg font-semibold text-[#176B3A]">
                  Search
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#173B28]/65">
                  Choose one or more support types and search for facilities
                  by location.
                </p>
              </div>
            </div>

            <div className="hidden px-6 pt-3 text-2xl text-[#2F8F4E] lg:block">
              →
            </div>

            <div className="mt-10 flex flex-1 items-start gap-5 lg:mt-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F8F4E] text-sm font-semibold text-[#2F8F4E]">
                03
              </span>

              <div>
                <h3 className="text-lg font-semibold text-[#176B3A]">
                  Decide
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-[#173B28]/65">
                  If you are still unsure, start a private SafeLink session
                  and ask for personalized guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIVACY
      ========================================================= */}

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#E7F1E3] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2F8F4E]/25" />
            <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-[#FAFBF7]/60" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="flex items-center justify-center">
                <img
                  src={youIllustration}
                  alt=""
                  className="h-52 w-full max-w-xs object-contain sm:h-64"
                />
              </div>

              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                  Privacy first
                </span>

                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#176B3A] sm:text-4xl">
                  You can explore without telling your story.
                </h2>

                <p className="mt-5 text-base leading-7 text-[#173B28]/75">
                  The Information Page is here so you can understand your
                  options before deciding whether you want personalized help.
                  Browse support information and facilities first.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <PrivacyPoint text="Explore before sharing details" />
                  <PrivacyPoint text="Choose support types yourself" />
                  <PrivacyPoint text="Search facilities by location" />
                  <PrivacyPoint text="Start a private session when ready" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MODALS
      ========================================================= */}

      {selectedSupportInfo && (
        <SupportInfoModal
          support={selectedSupportInfo}
          onClose={() => setSelectedSupportInfo(null)}
          onSelect={() => {
            toggleSupportType(selectedSupportInfo.type);
            setSelectedSupportInfo(null);
          }}
          selected={selectedTypes.includes(
            selectedSupportInfo.type,
          )}
        />
      )}

      {selectedFacility && (
        <FacilityModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          isAdvisor={isAdvisor}
          onEdit={(facility) => {
            setSelectedFacility(null);
            setEditingFacility(facility);
          }}
          onDelete={handleDeleteFacility}
          isDeleting={
            deletingFacilityId === selectedFacility.facility_id
          }
        />
      )}

      {showAddFacility && isAdvisor && (
        <AddFacilityModal
          token={advisorToken}
          onClose={() => setShowAddFacility(false)}
          onCreated={async () => {
            setShowAddFacility(false);
            await loadFacilities();
          }}
        />
      )}

      {editingFacility && isAdvisor && (
        <EditFacilityModal
          facility={editingFacility}
          token={advisorToken}
          onClose={() => setEditingFacility(null)}
          onUpdated={async () => {
            setEditingFacility(null);
            await loadFacilities();
          }}
        />
      )}
    </div>
  );
}

/* ===============================================================
   SUPPORT DETAIL MODAL
=============================================================== */

function SupportInfoModal({
  support,
  selected,
  onClose,
  onSelect,
}: {
  support: SupportInfo;
  selected: boolean;
  onClose: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#173B28]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
          <div className="flex h-40 items-center justify-center rounded-2xl bg-[#E7F1E3] sm:h-44">
            <img
              src={support.image}
              alt=""
              className="h-full w-full object-contain p-4"
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                  {support.eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#176B3A]">
                  {support.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7F1E3] text-lg text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#173B28]/70">
              {support.description}
            </p>

            <div className="mt-5 space-y-3">
              {support.details.map((detail) => (
                <div
                  key={detail}
                  className="flex items-start gap-3 text-sm text-[#173B28]/70"
                >
                  <span className="mt-0.5 text-[#2F8F4E]">✓</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E7F1E3] pt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-[#2F8F4E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   FACILITY CARD
=============================================================== */

function FacilityCard({
  facility,
  onView,
}: {
  facility: Facility;
  onView: () => void;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border border-[#E7F1E3] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2F8F4E] hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F8F4E]">
          <span className="text-lg text-white">♡</span>
        </div>

        <span className="rounded-full bg-[#E7F1E3] px-3 py-1 text-[11px] font-semibold text-[#2F8F4E]">
          Available
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[#176B3A] sm:text-xl">
        {facility.facility_name}
      </h3>

      <p className="mt-2 text-sm text-[#173B28]/60">
        {facility.location}
      </p>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#173B28]/65">
        {facility.description ||
          "Support facility available through SafeLink."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {facility.support_types.map((type) => (
          <span
            key={type}
            className="rounded-full border border-[#2F8F4E]/30 bg-[#FAFBF7] px-3 py-1 text-[11px] font-medium capitalize text-[#173B28]/70"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onView}
          className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2F8F4E] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A]"
        >
          View facility
          <span className="transition-transform duration-200 group-hover/btn:translate-x-1">
            →
          </span>
        </button>
      </div>
    </article>
  );
}

/* ===============================================================
   FACILITY MODAL
=============================================================== */

function FacilityModal({
  facility,
  onClose,
  isAdvisor,
  onEdit,
  onDelete,
  isDeleting,
}: {
  facility: Facility;
  onClose: () => void;
  isAdvisor?: boolean;
  onEdit?: (facility: Facility) => void;
  onDelete?: (facility: Facility) => void;
  isDeleting?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#173B28]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Support facility
            </p>

            <h2 className="mt-2 break-words text-2xl font-semibold text-[#176B3A]">
              {facility.facility_name}
            </h2>
          </div>

          {isAdvisor ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((current) => !current);
                }}
                aria-label="Facility actions"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E7F1E3] text-lg leading-none text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
              >
                ⋮
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuOpen(false);
                    }}
                    className="fixed inset-0 z-20 cursor-default"
                  />

                  <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-2xl border border-[#E7F1E3] bg-white shadow-2xl">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                        onEdit?.(facility);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#176B3A] transition hover:bg-[#FAFBF7]"
                    >
                      Edit facility
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen(false);
                        onDelete?.(facility);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-[#8B1F1F] transition hover:bg-[#F7EBEB] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete facility"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close facility details"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7F1E3] text-lg text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
            >
              ×
            </button>
          )}
        </div>

        <div className="mt-7 space-y-4">
          <InfoRow label="Location" value={facility.location} />
          <InfoRow label="Contact" value={facility.contact} />
          <InfoRow
            label="Support"
            value={
              facility.support_types.length > 0
                ? facility.support_types.join(", ")
                : "General"
            }
          />
        </div>

        <div className="mt-7 rounded-2xl bg-[#E7F1E3] p-5">
          <p className="text-sm leading-7 text-[#173B28]/75">
            {facility.description ||
              "No additional description is available."}
          </p>
        </div>

        <p className="mt-5 text-xs leading-5 text-[#173B28]/50">
          Please verify availability and current services before visiting.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-[#2F8F4E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ===============================================================
   ADD FACILITY MODAL
=============================================================== */

function AddFacilityModal({
  token,
  onClose,
  onCreated,
}: {
  token: string;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [facilityName, setFacilityName] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");

  const [supportTypes, setSupportTypes] = useState<SupportType[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleType = (type: SupportType) => {
    setSupportTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !facilityName.trim() ||
      !location.trim() ||
      !contact.trim() ||
      !description.trim() ||
      supportTypes.length === 0
    ) {
      setError(
        "Please complete all fields and choose at least one support type.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await addFacility(
        {
          facility_name: facilityName.trim(),
          location: location.trim(),
          contact: contact.trim(),
          support_types: supportTypes,
          description: description.trim(),
        },
        token,
      );

      await onCreated();
    } catch (error) {
      console.error("Add facility error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to add facility.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#173B28]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-9"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Advisor access
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A]">
              Add a support facility
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#173B28]/65">
              Add a facility that can help users. Once saved, it will appear
              in the facility search.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7F1E3] text-lg text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#2F8F4E]/30 bg-[#E7F1E3] p-4 text-sm leading-6 text-[#176B3A]">
            {error}
          </div>
        )}

        <div className="mt-7 space-y-5">
          <FormInput
            label="Facility name"
            value={facilityName}
            onChange={setFacilityName}
            placeholder="e.g. Community Health Center"
          />

          <FormInput
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Bole, Addis Ababa"
          />

          <FormInput
            label="Contact"
            value={contact}
            onChange={setContact}
            placeholder="Phone number or contact method"
          />

          <div>
            <label className="mb-3 block text-sm font-semibold text-[#176B3A]">
              Support type
            </label>

            <div className="flex flex-wrap gap-2">
              {SUPPORT_OPTIONS.map((option) => {
                const selected = supportTypes.includes(option.type);

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => toggleType(option.type)}
                    className={`rounded-full px-4 py-2.5 text-xs font-semibold capitalize transition-all duration-200 sm:text-sm ${
                      selected
                        ? "bg-[#2F8F4E] text-white shadow-md"
                        : "border border-[#2F8F4E]/40 bg-white text-[#2F8F4E] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                    }`}
                  >
                    {selected && "✓ "}
                    {option.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="facility-description"
              className="mb-2 block text-sm font-semibold text-[#176B3A]"
            >
              Description
            </label>

            <textarea
              id="facility-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Describe what support this facility provides..."
              className="w-full resize-none rounded-2xl border border-[#2F8F4E]/40 bg-[#FAFBF7] px-4 py-3 text-sm text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20 sm:px-5 sm:py-3.5"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E7F1E3] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-[#2F8F4E]/40 bg-white px-6 py-3 text-sm font-semibold text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#FAFBF7] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#2F8F4E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving facility..." : "Add facility"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ===============================================================
   EDIT FACILITY MODAL
=============================================================== */

function EditFacilityModal({
  facility,
  token,
  onClose,
  onUpdated,
}: {
  facility: Facility;
  token: string;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [facilityName, setFacilityName] = useState(
    facility.facility_name,
  );
  const [location, setLocation] = useState(facility.location);
  const [contact, setContact] = useState(facility.contact);
  const [description, setDescription] = useState(
    facility.description || "",
  );

  const [supportTypes, setSupportTypes] = useState<SupportType[]>(
    facility.support_types || [],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleType = (type: SupportType) => {
    setSupportTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !facilityName.trim() ||
      !location.trim() ||
      !contact.trim() ||
      !description.trim() ||
      supportTypes.length === 0
    ) {
      setError(
        "Please complete all fields and choose at least one support type.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateFacility(
        facility.facility_id,
        {
          facility_name: facilityName.trim(),
          location: location.trim(),
          contact: contact.trim(),
          support_types: supportTypes,
          description: description.trim(),
        },
        token,
      );

      await onUpdated();
    } catch (error) {
      console.error("Update facility error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update facility.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#173B28]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-9"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Edit facility
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A]">
              Update "{facility.facility_name}"
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#173B28]/65">
              Changes will be reflected immediately in the facility search.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7F1E3] text-lg text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#2F8F4E]/30 bg-[#E7F1E3] p-4 text-sm leading-6 text-[#176B3A]">
            {error}
          </div>
        )}

        <div className="mt-7 space-y-5">
          <FormInput
            label="Facility name"
            value={facilityName}
            onChange={setFacilityName}
            placeholder="e.g. Community Health Center"
          />

          <FormInput
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Bole, Addis Ababa"
          />

          <FormInput
            label="Contact"
            value={contact}
            onChange={setContact}
            placeholder="Phone number or contact method"
          />

          <div>
            <label className="mb-3 block text-sm font-semibold text-[#176B3A]">
              Support type
            </label>

            <div className="flex flex-wrap gap-2">
              {SUPPORT_OPTIONS.map((option) => {
                const selected = supportTypes.includes(option.type);

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => toggleType(option.type)}
                    className={`rounded-full px-4 py-2.5 text-xs font-semibold capitalize transition-all duration-200 sm:text-sm ${
                      selected
                        ? "bg-[#2F8F4E] text-white shadow-md"
                        : "border border-[#2F8F4E]/40 bg-white text-[#2F8F4E] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#FAFBF7]"
                    }`}
                  >
                    {selected && "✓ "}
                    {option.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-facility-description"
              className="mb-2 block text-sm font-semibold text-[#176B3A]"
            >
              Description
            </label>

            <textarea
              id="edit-facility-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Describe what support this facility provides..."
              className="w-full resize-none rounded-2xl border border-[#2F8F4E]/40 bg-[#FAFBF7] px-4 py-3 text-sm text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20 sm:px-5 sm:py-3.5"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E7F1E3] pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-[#2F8F4E]/40 bg-white px-6 py-3 text-sm font-semibold text-[#2F8F4E] transition hover:border-[#2F8F4E] hover:bg-[#FAFBF7] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#2F8F4E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving changes..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ===============================================================
   FORM INPUT
=============================================================== */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#176B3A]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-[#2F8F4E]/40 bg-[#FAFBF7] px-5 py-3.5 text-sm text-[#173B28] outline-none placeholder:text-[#2F8F4E]/60 focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
      />
    </label>
  );
}

/* ===============================================================
   PRIVACY POINT
=============================================================== */

function PrivacyPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-xs font-bold text-white">
        ✓
      </span>

      <span className="text-xs leading-6 text-[#173B28]/75 sm:text-sm">
        {text}
      </span>
    </div>
  );
}

/* ===============================================================
   INFO ROW
=============================================================== */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[#E7F1E3] pb-4">
      <span className="text-sm text-[#173B28]/60">{label}</span>

      <span className="max-w-[65%] text-right text-sm font-semibold capitalize text-[#176B3A]">
        {value}
      </span>
    </div>
  );
}

export default InformationPage;