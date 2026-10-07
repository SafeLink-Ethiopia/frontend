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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f5f6] text-[#3e1919]">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-[#a79093]/30 bg-[#f7f5f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
            aria-label="Go to SafeLink home"
          >
            <div className="flex h-9 w-9 items-center justify-center bg-[#3e1919] transition-colors group-hover:bg-[#a79093]">
              <span className="text-lg text-[#f0e2d6]">♡</span>
            </div>

            <div className="text-left">
              <p className="text-sm font-bold tracking-wide text-[#3e1919]">
                SafeLink
              </p>

              <p className="text-[8px] font-semibold tracking-[0.3em] text-[#a79093]">
                ETHIOPIA
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden px-3 py-2 text-sm font-medium text-[#a79093] transition hover:text-[#3e1919] sm:block"
            >
              Home
            </button>

            {isAdvisor && (
              <button
                type="button"
                onClick={() => setShowAddFacility(true)}
                className="hidden border border-[#a79093]/40 px-4 py-2 text-sm font-semibold text-[#3e1919] transition hover:border-[#3e1919] hover:bg-[#f0e2d6] md:block"
              >
                + Add Facility
              </button>
            )}

            <button
              type="button"
              onClick={handlePrivateSession}
              className="bg-[#3e1919] px-4 py-2.5 text-xs font-semibold text-[#f7f5f6] transition hover:bg-[#a79093] sm:px-5 sm:text-sm"
            >
              Private Session
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="bg-[#3e1919]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              Information & support
            </p>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#f7f5f6] sm:text-5xl lg:text-6xl">
              You do not have to know what you need yet.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#a79093] sm:text-base sm:leading-8">
              Explore different types of support, find available
              facilities, and decide what feels right for you before
              starting a private conversation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToFinder}
                className="bg-[#f0e2d6] px-6 py-3.5 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f7f5f6]"
              >
                Find support
              </button>

              <button
                type="button"
                onClick={handlePrivateSession}
                className="border border-[#a79093]/50 px-6 py-3.5 text-sm font-semibold text-[#f7f5f6] transition hover:border-[#f0e2d6] hover:bg-[#f0e2d6] hover:text-[#3e1919]"
              >
                Talk to an advisor
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#a79093] sm:text-sm">
              <span>✓ Explore privately</span>
              <span>✓ No story required</span>
              <span>✓ Choose when ready</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="border border-[#a79093]/30 bg-[#f0e2d6]/10 p-7">
              <img
                src={supportIllustration}
                alt="People receiving support"
                className="mx-auto h-[340px] w-full object-contain p-4"
              />

              <div className="border-t border-[#a79093]/30 pt-5 text-center text-sm leading-6 text-[#a79093]">
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

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
            Understand your options
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#3e1919] sm:text-4xl">
            What kind of support might help?
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a79093] sm:text-base">
            These categories are starting points, not labels. Explore
            one, choose several, or skip this step completely.
          </p>
        </div>

        <div className="mt-10 divide-y divide-[#a79093]/30 border-y border-[#a79093]/30">
          {SUPPORT_OPTIONS.map((option) => {
            const selected = selectedTypes.includes(option.type);

            return (
              <div
                key={option.type}
                role="button"
                tabIndex={0}
                onClick={() => toggleSupportType(option.type)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    toggleSupportType(option.type);
                  }
                }}
                className={`group relative cursor-pointer py-7 transition-colors sm:py-8 ${
                  selected ? "bg-[#f0e2d6]/50" : ""
                }`}
              >
                <div className="grid gap-6 px-1 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-8">
                  <div className="flex h-28 items-center justify-center bg-[#f0e2d6] sm:h-32">
                    <img
                      src={option.image}
                      alt=""
                      className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                      {option.eyebrow}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-[#3e1919]">
                      {option.title}
                    </h3>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a79093]">
                      {option.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {option.details.map((detail) => (
                        <span
                          key={detail}
                          className="text-xs text-[#a79093]"
                        >
                          • {detail}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:block">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedSupportInfo(option);
                      }}
                      className="text-xs font-semibold text-[#3e1919] underline underline-offset-4 transition hover:text-[#a79093]"
                    >
                      Learn more
                    </button>

                    <span
                      className={`flex h-8 w-8 items-center justify-center border text-xs font-bold transition ${
                        selected
                          ? "border-[#3e1919] bg-[#3e1919] text-[#f7f5f6]"
                          : "border-[#a79093]/40 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
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
        className="scroll-mt-24 border-y border-[#a79093]/30 bg-[#f0e2d6]/40 py-14 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
                Find a facility
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#3e1919] sm:text-4xl">
                Find support near a location.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#a79093] sm:text-base">
                Choose the type of support you are looking for and
                optionally enter a location. Leave everything blank
                to explore all facilities currently available.
              </p>

              <div className="mt-7 space-y-3 border-t border-[#a79093]/30 pt-6">
                <p className="text-sm text-[#3e1919]">
                  <span className="font-semibold">Search</span>
                  <span className="text-[#a79093]">
                    {" "}
                    by facility name or keyword
                  </span>
                </p>

                <p className="text-sm text-[#3e1919]">
                  <span className="font-semibold">Filter</span>
                  <span className="text-[#a79093]">
                    {" "}
                    by support type
                  </span>
                </p>

                <p className="text-sm text-[#3e1919]">
                  <span className="font-semibold">Explore</span>
                  <span className="text-[#a79093]">
                    {" "}
                    available facility details
                  </span>
                </p>
              </div>
            </div>

            <div className="border border-[#a79093]/30 bg-[#f7f5f6] p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#3e1919]">
                    Search
                  </span>

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Facility or keyword..."
                    className="w-full border border-[#a79093]/40 bg-white px-4 py-3.5 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#3e1919]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#3e1919]">
                    Location
                  </span>

                  <input
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="e.g. Bole, Addis Ababa"
                    className="w-full border border-[#a79093]/40 bg-white px-4 py-3.5 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#3e1919]"
                  />
                </label>
              </div>

              <div className="mt-7">
                <span className="mb-3 block text-sm font-semibold text-[#3e1919]">
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
                        className={`border px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                          selected
                            ? "border-[#3e1919] bg-[#3e1919] text-[#f7f5f6]"
                            : "border-[#a79093]/40 bg-white text-[#a79093] hover:border-[#3e1919] hover:text-[#3e1919]"
                        }`}
                      >
                        {selected && "✓ "}
                        {option.shortTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-[#a79093]/30 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#a79093] sm:text-sm">
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
                    className="self-start text-xs font-semibold text-[#3e1919] underline underline-offset-4 sm:self-auto sm:text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}

          <div className="mt-14">
            <div className="mb-7 flex flex-col gap-3 border-b border-[#a79093]/30 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                  Results
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#3e1919]">
                  Available facilities
                </h3>
              </div>

              <div className="flex items-center gap-4">
                {!loadingFacilities &&
                  !facilityError && (
                    <p className="text-sm text-[#a79093]">
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
                    className="border border-[#3e1919] bg-[#3e1919] px-4 py-2.5 text-xs font-semibold text-[#f7f5f6] transition hover:bg-[#a79093]"
                  >
                    + Add Facility
                  </button>
                )}
              </div>
            </div>

            {loadingFacilities && (
              <div className="divide-y divide-[#a79093]/20 border-y border-[#a79093]/20">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse py-7"
                  >
                    <div className="h-5 w-1/3 bg-[#f0e2d6]" />
                    <div className="mt-3 h-3 w-1/4 bg-[#f0e2d6]" />
                    <div className="mt-5 h-3 w-full bg-[#f0e2d6]" />
                    <div className="mt-2 h-3 w-4/5 bg-[#f0e2d6]" />
                  </div>
                ))}
              </div>
            )}

            {!loadingFacilities && facilityError && (
              <div className="border-y border-[#a79093]/30 bg-[#f0e2d6] px-5 py-7 sm:px-7">
                <h3 className="font-semibold text-[#3e1919]">
                  Facilities could not be loaded
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#a79093]">
                  {facilityError}
                </p>

                <button
                  type="button"
                  onClick={() => void loadFacilities()}
                  className="mt-5 bg-[#3e1919] px-5 py-3 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#a79093]"
                >
                  Try again
                </button>
              </div>
            )}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length === 0 && (
                <div className="border-y border-[#a79093]/30 py-16 text-center">
                  <p className="text-2xl text-[#a79093]">⌕</p>

                  <h3 className="mt-4 text-lg font-semibold text-[#3e1919]">
                    No matching facilities
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#a79093]">
                    Nothing matches your current search. Try another
                    location or clear your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 border border-[#3e1919] px-5 py-2.5 text-sm font-semibold text-[#3e1919] transition hover:bg-[#3e1919] hover:text-[#f7f5f6]"
                  >
                    Clear search
                  </button>
                </div>
              )}

            {!loadingFacilities &&
              !facilityError &&
              filteredFacilities.length > 0 && (
                <div className="divide-y divide-[#a79093]/30 border-y border-[#a79093]/30">
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

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
            Simple process
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[#3e1919]">
            How SafeLink can help
          </h2>
        </div>

        <div className="grid divide-y divide-[#a79093]/30 border-y border-[#a79093]/30 md:grid-cols-3 md:divide-x md:divide-y-0">
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

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-16">
        <div className="grid border-y border-[#a79093]/30 bg-[#f0e2d6]/50 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center justify-center border-b border-[#a79093]/30 p-7 lg:border-b-0 lg:border-r sm:p-10">
            <img
              src={youIllustration}
              alt=""
              className="h-52 w-full object-contain sm:h-64"
            />
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
              Privacy first
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#3e1919] sm:text-3xl">
              You can explore without telling your story.
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#a79093] sm:text-base">
              The Information Page is here so you can understand your
              options before deciding whether you want personalized
              help. Browse support information and facilities first.
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

      <section className="border-t border-[#a79093]/30 bg-[#3e1919] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              You can start without knowing everything
            </p>

            <h2 className="mt-4 text-3xl font-semibold text-[#f7f5f6] sm:text-4xl">
              Not sure what you need?
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#a79093] sm:text-base sm:leading-8">
              Start a private SafeLink session and explain what is
              happening in your own words. You do not need to decide
              which type of support fits you before starting.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrivateSession}
            className="shrink-0 bg-[#f0e2d6] px-6 py-3.5 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f7f5f6]"
          >
            {getSafelinkId()
              ? "Continue to SafeLink →"
              : "Start Private Session →"}
          </button>
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3e1919]/70 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-[#f7f5f6] p-6 sm:max-h-[90vh] sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
          <div className="flex h-40 items-center justify-center bg-[#f0e2d6] sm:h-44">
            <img
              src={support.image}
              alt=""
              className="h-full w-full object-contain p-4"
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                  {support.eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#3e1919]">
                  {support.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-2xl text-[#a79093] transition hover:text-[#3e1919]"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#a79093]">
              {support.description}
            </p>

            <div className="mt-5 space-y-3">
              {support.details.map((detail) => (
                <div
                  key={detail}
                  className="flex items-start gap-3 text-sm text-[#a79093]"
                >
                  <span className="text-[#3e1919]">✓</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#a79093]/30 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#3e1919] px-6 py-3 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#a79093]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   FACILITY
=============================================================== */

function FacilityCard({
  facility,
  onView,
}: {
  facility: Facility;
  onView: () => void;
}) {
  return (
    <article className="group py-7 sm:py-8">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-[#3e1919]">
              {facility.facility_name}
            </h3>

            <span className="text-xs font-medium text-[#a79093]">
              Available
            </span>
          </div>

          <p className="mt-2 text-sm text-[#a79093]">
            {facility.location}
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a79093]">
            {facility.description ||
              "Support facility available through SafeLink."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {facility.support_types.map((type) => (
              <span
                key={type}
                className="border border-[#a79093]/30 bg-[#f0e2d6]/60 px-3 py-1 text-xs capitalize text-[#3e1919]"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onView}
          className="w-full border border-[#3e1919] px-5 py-3 text-sm font-semibold text-[#3e1919] transition hover:bg-[#3e1919] hover:text-[#f7f5f6] sm:w-auto"
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3e1919]/70 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-[#f7f5f6] p-6 sm:max-h-[90vh] sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
              Support facility
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#3e1919]">
              {facility.facility_name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close facility details"
            className="text-2xl text-[#a79093] transition hover:text-[#3e1919]"
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

        <div className="mt-7 border-l-4 border-[#3e1919] bg-[#f0e2d6] p-5">
          <p className="text-sm leading-7 text-[#a79093]">
            {facility.description ||
              "No additional description is available."}
          </p>
        </div>

        <p className="mt-5 text-xs leading-5 text-[#a79093]">
          Please verify availability and current services before
          visiting.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full bg-[#3e1919] px-5 py-3 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#a79093]"
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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#3e1919]/70 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto bg-[#f7f5f6] p-6 sm:max-h-[90vh] sm:p-9"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
              Advisor access
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#3e1919]">
              Add a support facility
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#a79093]">
              Add a facility that can help users. Once saved, it
              will appear in the facility search.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-[#a79093] transition hover:text-[#3e1919]"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-6 border-l-4 border-[#3e1919] bg-[#f0e2d6] p-4 text-sm leading-6 text-[#3e1919]">
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
            <label className="mb-3 block text-sm font-semibold text-[#3e1919]">
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
                    className={`border px-4 py-2.5 text-xs font-semibold capitalize transition sm:text-sm ${
                      selected
                        ? "border-[#3e1919] bg-[#3e1919] text-[#f7f5f6]"
                        : "border-[#a79093]/40 bg-white text-[#a79093] hover:border-[#3e1919] hover:text-[#3e1919]"
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
              className="mb-2 block text-sm font-semibold text-[#3e1919]"
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
              className="w-full resize-none border border-[#a79093]/40 bg-white px-4 py-3 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#3e1919] sm:px-5 sm:py-3.5"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#a79093]/30 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="border border-[#a79093]/40 bg-white px-6 py-3 text-sm font-semibold text-[#a79093] transition hover:border-[#3e1919] hover:text-[#3e1919] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#3e1919] px-6 py-3 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#a79093] disabled:cursor-not-allowed disabled:opacity-60"
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
      <span className="mb-2 block text-sm font-semibold text-[#3e1919]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-[#a79093]/40 bg-white px-4 py-3.5 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#3e1919] sm:px-5"
      />
    </label>
  );
}

/* ===============================================================
   STEP
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
    <div className="p-6 sm:p-7">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold tracking-[0.12em] text-[#a79093]">
          {number}
        </span>

        <h3 className="text-lg font-semibold text-[#3e1919] sm:text-xl">
          {title}
        </h3>
      </div>

      <p className="mt-5 text-sm leading-7 text-[#a79093]">
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
    <div className="flex items-start gap-3 border-t border-[#a79093]/30 pt-3">
      <span className="text-sm font-bold text-[#3e1919]">
        ✓
      </span>

      <span className="text-xs leading-6 text-[#a79093] sm:text-sm">
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
    <div className="flex items-start justify-between gap-6 border-b border-[#a79093]/30 pb-4">
      <span className="text-sm text-[#a79093]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold capitalize text-[#3e1919]">
        {value}
      </span>
    </div>
  );
}

export default InformationPage;