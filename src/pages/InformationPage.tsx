import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  addFacility,
  getFacilities,
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
    image: supportIllustration,
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
    image: mapIllustration,
  },
];

function InformationPage() {
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SupportType[]>(
    [],
  );

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
  }, [
    facilities,
    selectedTypes,
    search,
    location,
  ]);

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F5F6F8] text-[#262626] antialiased">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#001B2E]/90 text-white shadow-[0_4px_24px_-8px_rgba(0,27,46,0.4)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02] active:scale-95 sm:gap-3"
            aria-label="Go to SafeLink home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8DA1B9] to-[#95ADB6] shadow-lg shadow-[#8DA1B9]/30 transition-transform duration-500 group-hover:rotate-6 sm:h-11 sm:w-11">
              <span className="text-lg text-[#001B2E] sm:text-2xl">♡</span>
            </div>

            <div className="text-left">
              <div className="text-base font-bold tracking-tight sm:text-lg">
                SafeLink
              </div>

              <div className="text-[8px] font-semibold tracking-[0.3em] text-[#8DA1B9] sm:text-[9px]">
                ETHIOPIA
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white sm:block"
            >
              Home
            </button>

            {isAdvisor && (
              <button
                type="button"
                onClick={() => setShowAddFacility(true)}
                className="hidden rounded-full border border-[#8DA1B9]/40 bg-[#8DA1B9]/10 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8DA1B9] hover:bg-[#8DA1B9]/20 md:block"
              >
                + Add Facility
              </button>
            )}

            <button
              type="button"
              onClick={handlePrivateSession}
              className="rounded-full bg-[#8DA1B9] px-3.5 py-2 text-xs font-semibold text-[#001B2E] shadow-md shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-lg active:translate-y-0 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Private Session
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#001B2E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(141,161,185,0.22),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(149,173,182,0.18),transparent_30%),linear-gradient(135deg,#001B2E,#0B2437_55%,#001B2E)]" />

        <div className="absolute -right-40 top-20 h-96 w-96 animate-pulse rounded-full bg-[#8DA1B9]/10 blur-3xl" />

        <div className="absolute -left-40 bottom-0 h-80 w-80 animate-pulse rounded-full bg-[#CBB3BF]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-[fadeIn_.6s_ease-out]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8DA1B9]/30 bg-[#8DA1B9]/10 px-3.5 py-1.5 text-xs text-white/80 backdrop-blur-md sm:mb-6 sm:px-4 sm:py-2 sm:text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#8DA1B9]" />
              Explore before you share
            </div>

            <h1 className="max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              You do not have to know what you need yet.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
              Learn about different types of support, explore available
              facilities, and decide what feels right for you before starting
              a private conversation.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <button
                type="button"
                onClick={scrollToFinder}
                className="rounded-full bg-[#8DA1B9] px-6 py-3.5 font-semibold text-[#001B2E] shadow-lg shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-xl active:translate-y-0"
              >
                Find support
              </button>

              <button
                type="button"
                onClick={handlePrivateSession}
                className="rounded-full border border-[#8DA1B9]/40 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8DA1B9] hover:bg-white/10 active:translate-y-0"
              >
                Talk to an advisor
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-xs text-white/60 sm:mt-8 sm:gap-x-6 sm:gap-y-3 sm:text-sm">
              <span className="flex items-center gap-2">
                <span className="text-[#8DA1B9]">✓</span>
                Explore privately
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#8DA1B9]">✓</span>
                No story required
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#8DA1B9]">✓</span>
                Choose when ready
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-w-xl">
              <div className="absolute inset-8 rounded-full bg-[#8DA1B9]/15 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-[#8DA1B9]/20 bg-white/5 p-7 shadow-2xl backdrop-blur-md">
                <div className="absolute right-6 top-6 rounded-full border border-[#8DA1B9]/30 bg-[#8DA1B9]/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                  SafeLink
                </div>

                <img
                  src={supportIllustration}
                  alt="People receiving support"
                  className="mx-auto h-[350px] w-full object-contain p-5"
                />

                <div className="rounded-2xl border border-[#8DA1B9]/20 bg-[#8DA1B9]/10 p-4 text-center text-sm leading-6 text-white/80">
                  Explore information first.
                  <br />
                  Ask for personal guidance when you are ready.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUPPORT TYPES
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8DA1B9] sm:text-sm">
            Understand your options
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#001B2E] sm:text-3xl lg:text-4xl">
            What kind of support might help?
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#262626]/70 sm:text-base">
            These categories are starting points, not labels. You can explore
            one, choose several, or skip this step completely.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          {SUPPORT_OPTIONS.map((option, index) => {
            const selected = selectedTypes.includes(
              option.type,
            );

            return (
              <div
                key={option.type}
                role="button"
                tabIndex={0}
                onClick={() => toggleSupportType(option.type)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleSupportType(option.type);
                  }
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 sm:grid sm:grid-cols-[155px_1fr] sm:gap-6 sm:rounded-[2rem] sm:p-6 ${
                  selected
  ? "border-[#8DA1B9] bg-[#8DA1B9]/[0.08] shadow-xl shadow-[#8DA1B9]/10 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#8DA1B9]/15"
  : "border-[#95ADB6]/25 bg-white shadow-sm hover:-translate-y-1 hover:border-[#8DA1B9]/60 hover:shadow-xl hover:shadow-[#8DA1B9]/10" }`}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div
                  className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 sm:right-5 sm:top-5 sm:h-8 sm:w-8 sm:text-sm ${
                    selected
                      ? "scale-100 border-[#8DA1B9] bg-[#8DA1B9] text-[#001B2E]"
                      : "scale-90 border-[#95ADB6]/40 bg-white text-transparent"
                  }`}
                >
                  ✓
                </div>

                <div className="flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-[#F0F3F6] sm:h-40">
                  <img
                    src={option.image}
                    alt=""
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="mt-5 flex flex-col justify-center sm:mt-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8DA1B9] sm:text-xs">
                    {option.eyebrow}
                  </p>

                  <h3 className="mt-2 pr-8 text-lg font-bold text-[#001B2E] sm:text-xl">
                    {option.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#262626]/70">
                    {option.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {option.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-start gap-2 text-xs leading-5 text-[#262626]/60"
                      >
                        <span className="mt-0.5 text-[#8DA1B9]">
                          •
                        </span>

                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-end">
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      setSelectedSupportInfo(option);
    }}
    className="group/learn inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-[#8DA1B9] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8DA1B9]/30 hover:bg-[#8DA1B9]/10 hover:shadow-sm active:translate-y-0"
  >
    Learn more
    <span className="transition-transform duration-300 group-hover/learn:translate-x-0.5">
      →
    </span>
  </button>
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
        className="scroll-mt-24 border-y border-[#95ADB6]/15 bg-white py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8DA1B9] to-[#95ADB6] shadow-lg shadow-[#8DA1B9]/30 transition-transform duration-500 group-hover:rotate-6 sm:h-11 sm:w-11">
              <span className="text-lg text-[#001B2E] sm:text-2xl">♡</span>
            </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8DA1B9] sm:text-sm">
                Find a facility
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#001B2E] sm:text-3xl lg:text-4xl">
                Find support near a location.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#262626]/70 sm:text-base">
                Choose the type of support you are looking for and optionally
                enter a location. You can leave everything blank to explore
                every facility currently available through SafeLink.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium text-[#262626]/60 sm:mt-7 sm:gap-3 sm:text-xs">
                <span className="rounded-full bg-[#F0F3F6] px-3 py-1.5 sm:py-2">
                  Multiple support types
                </span>

                <span className="rounded-full bg-[#F0F3F6] px-3 py-1.5 sm:py-2">
                  Location search
                </span>

                <span className="rounded-full bg-[#F0F3F6] px-3 py-1.5 sm:py-2">
                  Facility details
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#95ADB6]/25 bg-[#F8FAFB] p-4 shadow-sm sm:rounded-[2rem] sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#001B2E]">
                    Search
                  </span>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95ADB6]">
                      ⌕
                    </span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Facility or keyword..."
                      className="w-full rounded-2xl border border-[#95ADB6]/30 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-[#95ADB6] focus:border-[#8DA1B9] focus:ring-4 focus:ring-[#8DA1B9]/15 sm:py-3.5"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#001B2E]">
                    Location
                  </span>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95ADB6]">
                      ⌖
                    </span>

                    <input
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="e.g. Bole, Addis Ababa"
                      className="w-full rounded-2xl border border-[#95ADB6]/30 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-[#95ADB6] focus:border-[#8DA1B9] focus:ring-4 focus:ring-[#8DA1B9]/15 sm:py-3.5"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-5 sm:mt-6">
                <span className="mb-3 block text-sm font-semibold text-[#001B2E]">
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
                        className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2.5 sm:text-sm ${
                          selected
                            ? "bg-[#8DA1B9] text-[#001B2E] shadow-md shadow-[#8DA1B9]/30"
                            : "bg-white text-[#262626]/70 ring-1 ring-[#95ADB6]/30 hover:-translate-y-0.5 hover:bg-[#F0F3F6] hover:ring-[#8DA1B9]/50"
                        }`}
                      >
                        {selected && "✓ "}
                        {option.shortTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-[#95ADB6]/20 pt-5 sm:mt-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[#262626]/60 sm:text-sm">
                  {selectedTypes.length > 0 ||
                  search ||
                  location ? (
                    <>Showing filtered results</>
                  ) : (
                    <>Showing all available facilities</>
                  )}
                </div>

                {(selectedTypes.length > 0 ||
                  search ||
                  location) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="self-start text-xs font-semibold text-[#8DA1B9] transition-colors hover:text-[#001B2E] hover:underline sm:self-auto sm:text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              RESULTS
          ===================================================== */}

          <div className="mt-12 sm:mt-14">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-7 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8DA1B9] sm:text-xs">
                  Results
                </p>

                <h3 className="mt-2 text-xl font-bold text-[#001B2E] sm:text-2xl">
                  Available facilities
                </h3>

                {!loadingFacilities && !facilityError && (
                  <p className="mt-1 text-xs text-[#262626]/60 sm:text-sm">
                    {filteredFacilities.length}{" "}
                    {filteredFacilities.length === 1
                      ? "facility"
                      : "facilities"}{" "}
                    found
                  </p>
                )}
              </div>

              {isAdvisor && (
                <button
                  type="button"
                  onClick={() => setShowAddFacility(true)}
                  className="self-start rounded-full bg-[#001B2E] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#001B2E]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#262626] sm:px-5 sm:py-3 sm:text-sm"
                >
                  + Add Facility
                </button>
              )}
            </div>

            {loadingFacilities && (
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-3xl bg-[#F0F3F6] sm:h-80 sm:rounded-[2rem]"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="h-12 w-12 rounded-2xl bg-[#95ADB6]/30" />

                      <div className="mt-7 h-6 w-3/4 rounded bg-[#95ADB6]/30" />

                      <div className="mt-3 h-4 w-1/2 rounded bg-[#95ADB6]/30" />

                      <div className="mt-6 space-y-2">
                        <div className="h-3 rounded bg-[#95ADB6]/30" />
                        <div className="h-3 w-5/6 rounded bg-[#95ADB6]/30" />
                        <div className="h-3 w-4/6 rounded bg-[#95ADB6]/30" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingFacilities && facilityError && (
              <div className="rounded-3xl border border-[#CBB3BF]/40 bg-[#CBB3BF]/10 p-6 sm:rounded-[2rem] sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-[#262626]">
                      Facilities could not be loaded
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#262626]/70">
                      {facilityError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadFacilities()}
                    className="shrink-0 rounded-full bg-[#001B2E] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#262626]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length === 0 && (
                <div className="rounded-3xl border border-[#95ADB6]/25 bg-[#F8FAFB] px-5 py-14 text-center sm:rounded-[2rem] sm:px-6 sm:py-16">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
                    ⌕
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#001B2E] sm:text-xl">
                    No matching facilities
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#262626]/60">
                    Nothing matches the current search. Try another location,
                    choose a different support type, or clear your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-[#8DA1B9] px-5 py-3 text-sm font-semibold text-[#001B2E] shadow-md shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6]"
                  >
                    Clear search
                  </button>
                </div>
              )}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length > 0 && (
                <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <StepCard
            number="01"
            title="Explore"
            text="Learn about medical, legal, psychological, and general support without explaining your situation."
          />

          <StepCard
            number="02"
            title="Search"
            text="Choose one or more support types and search for facilities by location."
          />

          <StepCard
            number="03"
            title="Decide"
            text="If you are still unsure, start a private SafeLink session and ask for personalized guidance."
          />
        </div>
      </section>

      {/* =========================================================
          PRIVACY
      ========================================================= */}

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="grid overflow-hidden rounded-3xl border border-[#8DA1B9]/25 bg-[#F0F3F6] sm:rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center bg-[#E5EAF0] p-6 sm:p-8 md:p-12">
            <img
              src={youIllustration}
              alt=""
              className="h-48 w-full object-contain sm:h-56 md:h-64"
            />
          </div>

          <div className="p-6 sm:p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8DA1B9] sm:text-xs">
              <span>🔒</span>
              Privacy first
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#001B2E] sm:text-3xl">
              You can explore without telling your story.
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#262626]/70 sm:text-base">
              The Information Page is here so you can understand your options
              before deciding whether you want personalized help. You can
              browse support information and facilities first.
            </p>

            <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2">
              <PrivacyPoint text="Explore before sharing details" />
              <PrivacyPoint text="Choose support types yourself" />
              <PrivacyPoint text="Search facilities by location" />
              <PrivacyPoint text="Start a private session when ready" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#001B2E] px-6 py-10 text-white shadow-2xl shadow-[#001B2E]/20 sm:rounded-[2rem] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#8DA1B9]/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#CBB3BF]/10 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#8DA1B9] sm:text-sm">
                You can start without knowing everything
              </div>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl">
                Not sure what you need?
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
                You can start a private SafeLink session and explain what is
                happening in your own words. You do not need to decide which
                type of support fits you before starting.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrivateSession}
              className="relative shrink-0 rounded-full bg-[#8DA1B9] px-6 py-3.5 font-semibold text-[#001B2E] shadow-lg shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-xl active:translate-y-0 sm:px-7 sm:py-4"
            >
              {getSafelinkId()
                ? "Continue to SafeLink →"
                : "Start Private Session →"}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          SUPPORT DETAIL MODAL
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

      {/* =========================================================
          FACILITY MODAL
      ========================================================= */}

      {selectedFacility && (
        <FacilityModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}

      {/* =========================================================
          ADD FACILITY — ADVISOR ONLY
      ========================================================= */}

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
    </main>
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#001B2E]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem] sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:gap-7">
          <div className="flex h-40 items-center justify-center rounded-2xl bg-[#F0F3F6] sm:h-44">
            <img
              src={support.image}
              alt=""
              className="h-full w-full object-contain p-4"
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8DA1B9] sm:text-xs">
                  {support.eyebrow}
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#001B2E] sm:text-2xl">
                  {support.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F3F6] text-lg text-[#262626]/60 transition-colors hover:bg-[#95ADB6]/30 sm:h-10 sm:w-10 sm:text-xl"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#262626]/70 sm:text-base">
              {support.description}
            </p>

            <div className="mt-5 space-y-3">
              {support.details.map((detail) => (
                <div
                  key={detail}
                  className="flex items-start gap-3 text-sm text-[#262626]/70"
                >
                  <span className="mt-0.5 text-[#8DA1B9]">
                    ✓
                  </span>

                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#95ADB6]/20 pt-5 sm:mt-8 sm:flex-row sm:justify-end sm:pt-6">
        {/*
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F0F3F6] px-6 py-3 text-sm font-semibold text-[#262626]/70 transition-colors hover:bg-[#E5EAF0]"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onSelect}
            className="rounded-full bg-[#8DA1B9] px-6 py-3 text-sm font-semibold text-[#001B2E] shadow-md shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-lg active:translate-y-0"
          >
            {selected
              ? "Remove selection"
              : "Use this support type"}
          </button>
          */}
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
    <article className="group flex flex-col rounded-3xl border border-[#95ADB6]/25 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8DA1B9]/60 hover:shadow-xl hover:shadow-[#8DA1B9]/10 sm:rounded-[2rem] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F3F6] text-lg text-[#8DA1B9] transition-colors duration-300 group-hover:bg-[#8DA1B9] group-hover:text-[#001B2E] sm:h-12 sm:w-12 sm:text-xl">
          +
        </div>

        <span className="rounded-full bg-[#8DA1B9]/10 px-3 py-1 text-[11px] font-semibold text-[#8DA1B9] sm:text-xs">
          Available
        </span>
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#001B2E] sm:mt-6 sm:text-xl">
        {facility.facility_name}
      </h3>

      <div className="mt-2 flex items-center gap-2 text-xs text-[#262626]/60 sm:text-sm">
        <span className="text-[#8DA1B9]">⌖</span>
        <span>{facility.location}</span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#262626]/70">
        {facility.description ||
          "Support facility available through SafeLink."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {facility.support_types.map((type) => (
          <span
            key={type}
            className="rounded-full bg-[#F0F3F6] px-3 py-1 text-[11px] font-medium capitalize text-[#262626]/70 transition-colors duration-300 group-hover:bg-[#8DA1B9]/15 sm:text-xs"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6 sm:pt-7">
        <button
          type="button"
          onClick={onView}
          className="w-full rounded-full bg-[#8DA1B9] px-5 py-3 text-sm font-semibold text-[#001B2E] shadow-md shadow-[#8DA1B9]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-lg active:translate-y-0"
        >
          View facility →
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
}: {
  facility: Facility;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#001B2E]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem] sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8DA1B9] sm:text-xs">
              Support facility
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#001B2E] sm:text-2xl">
              {facility.facility_name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close facility details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F3F6] text-lg text-[#262626]/60 transition-colors hover:bg-[#95ADB6]/30 sm:h-10 sm:w-10 sm:text-xl"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4 sm:mt-7">
          <InfoRow
            label="Location"
            value={facility.location}
          />

          <InfoRow
            label="Contact"
            value={facility.contact}
          />

          <InfoRow
            label="Support"
            value={
              facility.support_types.length > 0
                ? facility.support_types.join(", ")
                : "General"
            }
          />
        </div>

        <div className="mt-6 rounded-2xl bg-[#F0F3F6] p-5 sm:mt-7">
          <p className="text-sm leading-7 text-[#262626]/70">
            {facility.description ||
              "No additional description is available."}
          </p>
        </div>

        <p className="mt-5 text-[11px] leading-5 text-[#262626]/50 sm:text-xs">
          Please verify availability and current services before visiting.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#8DA1B9] px-5 py-3 text-sm font-semibold text-[#001B2E] shadow-md shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-lg sm:mt-7"
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

  const [supportTypes, setSupportTypes] = useState<
    SupportType[]
  >([]);

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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#001B2E]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem] sm:p-9"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8DA1B9] sm:text-xs">
              Advisor access
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#001B2E] sm:text-2xl">
              Add a support facility
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#262626]/60">
              Add a facility that can help users. Once saved, it will appear
              in the facility search.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F3F6] text-lg text-[#262626]/60 transition-colors hover:bg-[#95ADB6]/30 sm:h-10 sm:w-10 sm:text-xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#CBB3BF] bg-[#CBB3BF]/10 p-4 text-sm leading-6 text-[#262626] sm:mt-6">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4 sm:mt-7 sm:space-y-5">
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
            <label className="mb-3 block text-sm font-semibold text-[#001B2E]">
              Support type
            </label>

            <div className="flex flex-wrap gap-2">
              {SUPPORT_OPTIONS.map((option) => {
                const selected = supportTypes.includes(
                  option.type,
                );

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() =>
                      toggleType(option.type)
                    }
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold capitalize transition-all duration-200 sm:px-4 sm:py-2.5 sm:text-sm ${
                      selected
                        ? "bg-[#8DA1B9] text-[#001B2E] shadow-md shadow-[#8DA1B9]/30"
                        : "bg-[#F0F3F6] text-[#262626]/70 hover:-translate-y-0.5 hover:bg-[#E5EAF0]"
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
              className="mb-2 block text-sm font-semibold text-[#001B2E]"
            >
              Description
            </label>

            <textarea
              id="facility-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Describe what support this facility provides..."
              className="w-full resize-none rounded-2xl border border-[#95ADB6]/30 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[#95ADB6] focus:border-[#8DA1B9] focus:ring-4 focus:ring-[#8DA1B9]/15 sm:px-5 sm:py-3.5"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#95ADB6]/20 pt-5 sm:mt-7 sm:flex-row sm:justify-end sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full bg-[#F0F3F6] px-6 py-3 text-sm font-semibold text-[#262626]/70 transition-colors hover:bg-[#E5EAF0] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#8DA1B9] px-6 py-3 text-sm font-semibold text-[#001B2E] shadow-md shadow-[#8DA1B9]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving facility..." : "Add facility"}
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
      <span className="mb-2 block text-sm font-semibold text-[#001B2E]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#95ADB6]/30 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[#95ADB6] focus:border-[#8DA1B9] focus:ring-4 focus:ring-[#8DA1B9]/15 sm:px-5 sm:py-3.5"
      />
    </label>
  );
}

/* ===============================================================
   STEP CARD
=============================================================== */

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-3xl border border-[#95ADB6]/25 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8DA1B9]/50 hover:shadow-xl hover:shadow-[#8DA1B9]/10 sm:rounded-[2rem] sm:p-7">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F3F6] text-xs font-black text-[#8DA1B9] transition-colors duration-300 group-hover:bg-[#8DA1B9] group-hover:text-[#001B2E] sm:h-12 sm:w-12 sm:text-sm">
          {number}
        </div>

        <h3 className="text-lg font-bold text-[#001B2E] sm:text-xl">
          {title}
        </h3>
      </div>

      <p className="mt-5 text-sm leading-7 text-[#262626]/70">
        {text}
      </p>
    </div>
  );
}

/* ===============================================================
   PRIVACY POINT
=============================================================== */

function PrivacyPoint({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/90 p-4 backdrop-blur-sm">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8DA1B9] text-xs font-bold text-[#001B2E]">
        ✓
      </span>

      <span className="text-xs leading-6 text-[#262626]/70 sm:text-sm">
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
    <div className="flex items-start justify-between gap-6 border-b border-[#95ADB6]/20 pb-4">
      <span className="text-sm font-medium text-[#262626]/60">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold capitalize text-[#001B2E]">
        {value}
      </span>
    </div>
  );
}

export default InformationPage;