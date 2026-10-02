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
    image: supportIllustration,
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

  /*
   * Advisor authentication
   *
   * The advisor login should store the JWT as:
   *
   * localStorage.setItem(
   *   "safelink_advisor_token",
   *   result.token
   * );
   */
  useEffect(() => {
    const token = localStorage.getItem(
      "safelink_advisor_token",
    );

    setAdvisorToken(token || "");
  }, []);

  const isAdvisor = Boolean(advisorToken);

  /*
   * Load facilities from MongoDB through the backend.
   */
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

  /*
   * Client-side filtering keeps the page responsive while
   * the actual facility data comes from MongoDB.
   */
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

  /*
   * Support type selection.
   */
  const toggleSupportType = (type: SupportType) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  /*
   * "Not sure what you need?"
   *
   * Existing SafeLink session -> directly to /support
   * No session -> create one first
   */
  const handlePrivateSession = () => {
    const safelinkId = getSafelinkId();

    if (safelinkId) {
      navigate("/support");
      return;
    }

    navigate("/create");
  };

  /*
   * Scroll to the facility finder.
   */
  const scrollToFinder = () => {
    document
      .getElementById("facility-finder")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /*
   * Clear all facility filters.
   */
  const clearFilters = () => {
    setSelectedTypes([]);
    setSearch("");
    setLocation("");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faf9] text-[#12304a]">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#073d4b]/95 text-white shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
            aria-label="Go to SafeLink home"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md transition duration-300 group-hover:scale-105">
              <span className="text-xl font-black text-[#1685a5]">
                S
              </span>
            </div>

            <div className="text-left">
              <div className="text-lg font-bold tracking-tight">
                SafeLink
              </div>

              <div className="text-[9px] font-semibold tracking-[0.3em] text-white/50">
                ETHIOPIA
              </div>
            </div>
          </button>

          {/* Navigation */}

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white sm:block"
            >
              Home
            </button>

            {isAdvisor && (
              <button
                type="button"
                onClick={() => setShowAddFacility(true)}
                className="hidden rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 md:block"
              >
                + Add Facility
              </button>
            )}

            <button
              type="button"
              onClick={handlePrivateSession}
              className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#12304a] shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100 sm:px-5"
            >
              Private Session
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#073d4b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(117,213,192,0.18),transparent_28%),radial-gradient(circle_at_15%_80%,rgba(22,133,165,0.22),transparent_30%),linear-gradient(135deg,#0b6275,#073d4b_55%,#052d39)]" />

        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#75d5c0]/10 blur-3xl" />

        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-[#1685a5]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          {/* Hero copy */}

          <div className="animate-[fadeIn_.6s_ease-out]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/75 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#75d5c0]" />
              Explore before you share
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              You do not have to know what you need yet.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Learn about different types of support, explore available
              facilities, and decide what feels right for you before starting
              a private conversation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToFinder}
                className="rounded-full bg-white px-6 py-3.5 font-semibold text-[#12304a] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Find support
              </button>

              <button
                type="button"
                onClick={handlePrivateSession}
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Talk to an advisor
              </button>
            </div>

            {/* Privacy mini reassurance */}

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
              <span className="flex items-center gap-2">
                <span className="text-[#75d5c0]">✓</span>
                Explore privately
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#75d5c0]">✓</span>
                No story required
              </span>

              <span className="flex items-center gap-2">
                <span className="text-[#75d5c0]">✓</span>
                Choose when ready
              </span>
            </div>
          </div>

          {/* Hero artwork */}

          <div className="relative hidden lg:block">
            <div className="relative mx-auto max-w-xl">
              <div className="absolute inset-8 rounded-full bg-[#75d5c0]/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-md">
                <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70">
                  SafeLink
                </div>

                <img
                  src={supportIllustration}
                  alt="People receiving support"
                  className="mx-auto h-[350px] w-full object-contain p-5"
                />

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center text-sm leading-6 text-white/75">
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

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1685a5]">
            Understand your options
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What kind of support might help?
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            These categories are starting points, not labels. You can explore
            one, choose several, or skip this step completely.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SUPPORT_OPTIONS.map((option, index) => {
            const selected = selectedTypes.includes(
              option.type,
            );

            return (
              <button
                key={option.type}
                type="button"
                onClick={() => toggleSupportType(option.type)}
                className={`group relative overflow-hidden rounded-[2rem] border p-6 text-left transition duration-300 sm:grid sm:grid-cols-[155px_1fr] sm:gap-6 ${
                  selected
                    ? "border-[#1685a5] bg-[#eef8f7] shadow-xl"
                    : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-[#b7dfe5] hover:shadow-xl"
                }`}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Selected indicator */}

                <div
                  className={`absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition ${
                    selected
                      ? "border-[#1685a5] bg-[#1685a5] text-white"
                      : "border-slate-200 bg-white text-transparent"
                  }`}
                >
                  ✓
                </div>

                {/* Illustration */}

                <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-[#f1f8f6]">
                  <img
                    src={option.image}
                    alt=""
                    className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}

                <div className="mt-6 flex flex-col justify-center sm:mt-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1685a5]">
                    {option.eyebrow}
                  </p>

                  <h3 className="mt-2 pr-8 text-xl font-bold">
                    {option.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {option.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {option.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-start gap-2 text-xs leading-5 text-slate-500"
                      >
                        <span className="mt-0.5 text-[#1685a5]">
                          •
                        </span>

                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1685a5]">
                      {selected
                        ? "Selected"
                        : "Select this type"}
                    </span>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedSupportInfo(option);
                      }}
                      className="text-xs font-semibold text-slate-400 underline-offset-4 hover:text-[#1685a5] hover:underline"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          FINDER
      ========================================================= */}

      <section
        id="facility-finder"
        className="scroll-mt-24 border-y border-slate-200 bg-white py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* Finder explanation */}

            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#e9f6f3]">
                <img
                  src={mapIllustration}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1685a5]">
                Find a facility
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Find support near a location.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Choose the type of support you are looking for and optionally
                enter a location. You can leave everything blank to explore
                every facility currently available through SafeLink.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                <span className="rounded-full bg-[#f1f7f5] px-3 py-2">
                  Multiple support types
                </span>

                <span className="rounded-full bg-[#f1f7f5] px-3 py-2">
                  Location search
                </span>

                <span className="rounded-full bg-[#f1f7f5] px-3 py-2">
                  Facility details
                </span>
              </div>
            </div>

            {/* Finder controls */}

            <div className="rounded-[2rem] border border-slate-200 bg-[#f8fbfa] p-5 shadow-sm sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#12304a]">
                    Search
                  </span>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ⌕
                    </span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Facility or keyword..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 outline-none transition placeholder:text-slate-400 focus:border-[#1685a5] focus:ring-4 focus:ring-[#1685a5]/10"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#12304a]">
                    Location
                  </span>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      ⌖
                    </span>

                    <input
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="e.g. Bole, Addis Ababa"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 outline-none transition placeholder:text-slate-400 focus:border-[#1685a5] focus:ring-4 focus:ring-[#1685a5]/10"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <span className="mb-3 block text-sm font-semibold text-[#12304a]">
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
                        className={`rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                          selected
                            ? "bg-[#126d85] text-white shadow-md"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {selected && "✓ "}
                        {option.shortTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  {selectedTypes.length > 0 ||
                  search ||
                  location ? (
                    <>
                      Showing filtered results
                    </>
                  ) : (
                    <>
                      Showing all available facilities
                    </>
                  )}
                </div>

                {(selectedTypes.length > 0 ||
                  search ||
                  location) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-[#1685a5] hover:underline"
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

          <div className="mt-14">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1685a5]">
                  Results
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Available facilities
                </h3>

                {!loadingFacilities && !facilityError && (
                  <p className="mt-1 text-sm text-slate-500">
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
                  className="rounded-full bg-[#12304a] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0d2a40]"
                >
                  + Add Facility
                </button>
              )}
            </div>

            {/* Loading */}

            {loadingFacilities && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-80 animate-pulse rounded-[2rem] bg-slate-100"
                  >
                    <div className="p-6">
                      <div className="h-12 w-12 rounded-2xl bg-slate-200" />

                      <div className="mt-7 h-6 w-3/4 rounded bg-slate-200" />

                      <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />

                      <div className="mt-6 space-y-2">
                        <div className="h-3 rounded bg-slate-200" />
                        <div className="h-3 w-5/6 rounded bg-slate-200" />
                        <div className="h-3 w-4/6 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}

            {!loadingFacilities && facilityError && (
              <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-red-800">
                      Facilities could not be loaded
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-red-700">
                      {facilityError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadFacilities()}
                    className="shrink-0 rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Empty */}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length === 0 && (
                <div className="rounded-[2rem] border border-slate-200 bg-[#f8fbfa] px-6 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    ⌕
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    No matching facilities
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                    Nothing matches the current search. Try another location,
                    choose a different support type, or clear your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-[#126d85] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d5d73]"
                  >
                    Clear search
                  </button>
                </div>
              )}

            {/* Results */}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
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

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#cce6e1] bg-[#eef8f5] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center bg-[#e2f2ed] p-8 sm:p-12">
            <img
              src={supportIllustration}
              alt=""
              className="h-64 w-full object-contain"
            />
          </div>

          <div className="p-8 sm:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1685a5]">
              <span>🔒</span>
              Privacy first
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              You can explore without telling your story.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              The Information Page is here so you can understand your options
              before deciding whether you want personalized help. You can
              browse support information and facilities first.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
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

      <section className="px-5 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0a3c4a] px-7 py-12 text-white shadow-xl sm:px-10 lg:px-12 lg:py-14">
          <div className="relative flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
            <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#75d5c0]/10 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#75d5c0]">
                You can start without knowing everything
              </div>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Not sure what you need?
              </h2>

              <p className="mt-4 leading-8 text-white/70">
                You can start a private SafeLink session and explain what is
                happening in your own words. You do not need to decide which
                type of support fits you before starting.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrivateSession}
              className="relative shrink-0 rounded-full bg-white px-7 py-4 font-semibold text-[#12304a] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-7 sm:grid-cols-[180px_1fr]">
          <div className="flex h-44 items-center justify-center rounded-2xl bg-[#eef8f5]">
            <img
              src={support.image}
              alt=""
              className="h-full w-full object-contain p-4"
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1685a5]">
                  {support.eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {support.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <p className="mt-4 leading-7 text-slate-600">
              {support.description}
            </p>

            <div className="mt-5 space-y-3">
              {support.details.map((detail) => (
                <div
                  key={detail}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <span className="mt-0.5 text-[#1685a5]">
                    ✓
                  </span>

                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-6 py-3 font-semibold text-slate-600"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onSelect}
            className="rounded-full bg-[#126d85] px-6 py-3 font-semibold text-white transition hover:bg-[#0d5d73]"
          >
            {selected
              ? "Remove selection"
              : "Use this support type"}
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
    <article className="group flex flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b7dfe5] hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f4ed] text-xl text-[#126d85]">
          +
        </div>

        <span className="rounded-full bg-[#eef8f8] px-3 py-1 text-xs font-semibold text-[#1685a5]">
          Available
        </span>
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {facility.facility_name}
      </h3>

      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <span>⌖</span>
        <span>{facility.location}</span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {facility.description ||
          "Support facility available through SafeLink."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {facility.support_types.map((type) => (
          <span
            key={type}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={onView}
          className="w-full rounded-full bg-[#126d85] px-5 py-3 font-semibold text-white transition duration-300 hover:bg-[#0d5d73]"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1685a5]">
              Support facility
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {facility.facility_name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close facility details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <div className="mt-7 space-y-4">
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

        <div className="mt-7 rounded-2xl bg-[#f4f9f8] p-5">
          <p className="text-sm leading-7 text-slate-600">
            {facility.description ||
              "No additional description is available."}
          </p>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          Please verify availability and current services before visiting.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-full bg-[#126d85] px-5 py-3 font-semibold text-white transition hover:bg-[#0d5d73]"
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1685a5]">
              Advisor access
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Add a support facility
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Add a facility that can help users. Once saved, it will appear
              in the facility search.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
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
            <label className="mb-3 block text-sm font-semibold">
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
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition ${
                      selected
                        ? "bg-[#126d85] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
              className="mb-2 block text-sm font-semibold"
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
              className="w-full resize-none rounded-2xl border border-slate-200 px-5 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#1685a5] focus:ring-4 focus:ring-[#1685a5]/10"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full bg-slate-100 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#126d85] px-6 py-3 font-semibold text-white transition hover:bg-[#0d5d73] disabled:cursor-not-allowed disabled:opacity-60"
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
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-[#1685a5] focus:ring-4 focus:ring-[#1685a5]/10"
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
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f4ed] text-sm font-black text-[#126d85]">
          {number}
        </div>

        <h3 className="text-xl font-bold">{title}</h3>
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">
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
    <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#126d85] text-xs font-bold text-white">
        ✓
      </span>

      <span className="text-sm leading-6 text-slate-600">
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
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4">
      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold capitalize text-[#12304a]">
        {value}
      </span>
    </div>
  );
}

export default InformationPage;