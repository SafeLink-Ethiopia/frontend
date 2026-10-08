import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardStatistics {
  advisors: {
    total: number;
    active: number;
    inactive: number;
  };

  sessions: {
    total: number;
    withPassword: number;
    withoutPassword: number;
  };

  conversations: {
    total: number;
    withMessages: number;
    withoutMessages: number;
    withRecommendations: number;
    withoutRecommendations: number;
    totalMessages: number;
  };
}

interface AdvisorTypeDistribution {
  type: string;
  count: number;
}

interface SessionLanguageDistribution {
  language: string;
  count: number;
}

interface DashboardResponse {
  statistics: DashboardStatistics;
  advisorTypeDistribution: AdvisorTypeDistribution[];
  sessionLanguageDistribution: SessionLanguageDistribution[];
}

interface StatisticsChartData {
  name: string;
  total: number;
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
          setError("Admin authentication token not found.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard statistics.",
          );
        }

        setDashboard(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard statistics.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#FAFBF7] px-5 py-12 text-[#173B28] sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2F8F4E]/30 border-t-[#2F8F4E]" />
            </div>

            <p className="text-sm font-semibold text-[#176B3A]">
              Loading dashboard
            </p>

            <p className="mt-1 text-xs text-[#173B28]/60">
              Fetching the latest system statistics.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <main className="min-h-screen bg-[#FAFBF7] px-5 py-8 text-[#173B28] sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-7 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#176B3A] text-xs font-bold text-white">
                !
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                  Dashboard
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#176B3A]">
                  Failed to load dashboard
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#173B28]/70">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     NO DATA
  ============================================================ */

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-[#FAFBF7] px-5 py-8 text-[#173B28] sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-7 shadow-sm">
            <p className="text-sm text-[#173B28]/65">
              No dashboard data available.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { statistics, advisorTypeDistribution, sessionLanguageDistribution } =
    dashboard;

  /* ============================================================
     STATISTICS
  ============================================================ */

  const advisorActivePercentage =
    statistics.advisors.total > 0
      ? Math.round(
          (statistics.advisors.active / statistics.advisors.total) * 100,
        )
      : 0;

  const sessionPasswordPercentage =
    statistics.sessions.total > 0
      ? Math.round(
          (statistics.sessions.withPassword / statistics.sessions.total) * 100,
        )
      : 0;

  const conversationMessagePercentage =
    statistics.conversations.total > 0
      ? Math.round(
          (statistics.conversations.withMessages /
            statistics.conversations.total) *
            100,
        )
      : 0;

  /* ============================================================
     LINE GRAPH DATA
  ============================================================ */

  const statisticsChartData: StatisticsChartData[] = [
    {
      name: "Advisors",
      total: statistics.advisors.total,
    },
    {
      name: "Sessions",
      total: statistics.sessions.total,
    },
    {
      name: "Conversations",
      total: statistics.conversations.total,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <header className="rounded-2xl border border-[#2F8F4E]/30 bg-gradient-to-br from-white to-[#E7F1E3]/60 p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/30 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                SafeLink Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#176B3A] sm:text-4xl">
                Admin Dashboard
              </h1>

              <div className="mt-4 h-1 w-20 rounded-full bg-[#2F8F4E]" />

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#173B28]/70 sm:text-base">
                Monitor SafeLink activity, advisor availability, sessions,
                conversations, and overall system usage.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-[#2F8F4E]/30 bg-white px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
                System overview
              </p>

              <p className="mt-2 text-sm font-semibold text-[#176B3A]">
                Current statistics
              </p>
            </div>
          </div>
        </header>

        {/* ========================================================
            KEY STATISTICS
        ======================================================== */}

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Overview
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
              System activity
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Advisors */}
            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                Advisors
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-4xl font-bold tracking-tight text-[#176B3A] sm:text-5xl">
                  {statistics.advisors.total}
                </p>

                <span className="pb-1.5 text-xs font-medium text-[#173B28]/60 sm:text-sm">
                  {statistics.advisors.active} active
                </span>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#E7F1E3]">
                <div
                  className="h-full rounded-full bg-[#2F8F4E] transition-all duration-500"
                  style={{
                    width: `${advisorActivePercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-[#173B28]/60">
                {advisorActivePercentage}% currently active
              </p>
            </div>

            {/* Sessions */}
            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                Sessions
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-4xl font-bold tracking-tight text-[#176B3A] sm:text-5xl">
                  {statistics.sessions.total}
                </p>

                <span className="pb-1.5 text-xs font-medium text-[#173B28]/60 sm:text-sm">
                  {statistics.sessions.withPassword} protected
                </span>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#E7F1E3]">
                <div
                  className="h-full rounded-full bg-[#2F8F4E] transition-all duration-500"
                  style={{
                    width: `${sessionPasswordPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-[#173B28]/60">
                {sessionPasswordPercentage}% protected with a password
              </p>
            </div>

            {/* Conversations */}
            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                Conversations
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-4xl font-bold tracking-tight text-[#176B3A] sm:text-5xl">
                  {statistics.conversations.total}
                </p>

                <span className="pb-1.5 text-xs font-medium text-[#173B28]/60 sm:text-sm">
                  {statistics.conversations.totalMessages} messages
                </span>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#E7F1E3]">
                <div
                  className="h-full rounded-full bg-[#2F8F4E] transition-all duration-500"
                  style={{
                    width: `${conversationMessagePercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-[#173B28]/60">
                {conversationMessagePercentage}% have messages
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            SYSTEM GRAPH
        ======================================================== */}

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Activity
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
              System statistics
            </h2>

            <p className="mt-2 text-sm text-[#173B28]/65">
              Total advisors, sessions, and conversations.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="h-[280px] w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={statisticsChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    stroke="#2F8F4E"
                    strokeOpacity={0.15}
                    strokeDasharray="2 4"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={{
                      stroke: "#2F8F4E",
                      strokeOpacity: 0.3,
                    }}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#2F8F4E",
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#2F8F4E",
                    }}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#2F8F4E",
                      strokeOpacity: 0.2,
                    }}
                    contentStyle={{
                      backgroundColor: "#176B3A",
                      border: "none",
                      borderRadius: "12px",
                      color: "#FAFBF7",
                      padding: "10px 14px",
                      boxShadow: "0 8px 24px rgba(23,107,58,0.25)",
                    }}
                    labelStyle={{
                      color: "#E7F1E3",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#FAFBF7",
                    }}
                    formatter={(value) => [value, "Total"]}
                    labelFormatter={(label) => `${label}`}
                  />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2F8F4E"
                    strokeWidth={2.5}
                    dot={{
                      r: 5,
                      fill: "#2F8F4E",
                      stroke: "#FAFBF7",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#176B3A",
                      stroke: "#E7F1E3",
                      strokeWidth: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ========================================================
            DISTRIBUTIONS
        ======================================================== */}

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Distribution
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
              Service overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* ====================================================
                ADVISORS BY TYPE
            ==================================================== */}

            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#E7F1E3] pb-5">
                <div>
                  <h3 className="text-lg font-semibold text-[#176B3A]">
                    Advisors by Type
                  </h3>

                  <p className="mt-1 text-xs text-[#173B28]/60">
                    Distribution across available advisor services.
                  </p>
                </div>

                <span className="rounded-full bg-[#E7F1E3] px-3 py-1 text-xs font-semibold text-[#2F8F4E]">
                  {statistics.advisors.total} total
                </span>
              </div>

              <div className="space-y-5">
                {advisorTypeDistribution.length === 0 ? (
                  <p className="py-6 text-sm text-[#173B28]/60">
                    No advisor type data available.
                  </p>
                ) : (
                  advisorTypeDistribution.map((item) => {
                    const percentage =
                      statistics.advisors.total > 0
                        ? Math.round(
                            (item.count / statistics.advisors.total) * 100,
                          )
                        : 0;

                    return (
                      <div key={item.type}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />

                            <span className="text-sm font-medium capitalize text-[#176B3A]">
                              {item.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#176B3A]">
                              {item.count}
                            </span>

                            <span className="w-10 text-right text-xs text-[#173B28]/60">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E7F1E3]">
                          <div
                            className="h-full rounded-full bg-[#2F8F4E] transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ====================================================
                CONVERSATIONS BY LANGUAGE
            ==================================================== */}

            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#E7F1E3] pb-5">
                <div>
                  <h3 className="text-lg font-semibold text-[#176B3A]">
                    Conversations by Language
                  </h3>

                  <p className="mt-1 text-xs text-[#173B28]/60">
                    Distribution of SafeLink sessions by language.
                  </p>
                </div>

                <span className="rounded-full bg-[#E7F1E3] px-3 py-1 text-xs font-semibold text-[#2F8F4E]">
                  {statistics.sessions.total} total
                </span>
              </div>

              <div className="space-y-5">
                {sessionLanguageDistribution.length === 0 ? (
                  <p className="py-6 text-sm text-[#173B28]/60">
                    No language data available.
                  </p>
                ) : (
                  sessionLanguageDistribution.map((item) => {
                    const percentage =
                      statistics.sessions.total > 0
                        ? Math.round(
                            (item.count / statistics.sessions.total) * 100,
                          )
                        : 0;

                    const languageName =
                      item.language === "en"
                        ? "English"
                        : item.language === "am"
                          ? "Amharic"
                          : item.language === "om"
                            ? "Afaan Oromoo"
                            : item.language;

                    return (
                      <div key={item.language}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />

                            <span className="text-sm font-medium text-[#176B3A]">
                              {languageName}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#176B3A]">
                              {item.count}
                            </span>

                            <span className="w-10 text-right text-xs text-[#173B28]/60">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E7F1E3]">
                          <div
                            className="h-full rounded-full bg-[#2F8F4E] transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ADDITIONAL SYSTEM DETAILS
        ======================================================== */}

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Details
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
              Additional metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                Active Advisors
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-[#176B3A]">
                {statistics.advisors.active}
              </p>

              <p className="mt-2 text-xs text-[#173B28]/60">
                {statistics.advisors.inactive} currently inactive
              </p>
            </div>

            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                Session Security
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-[#176B3A]">
                {statistics.sessions.withPassword}
              </p>

              <p className="mt-2 text-xs text-[#173B28]/60">
                Sessions protected with a password
              </p>
            </div>

            <div className="rounded-2xl border border-[#2F8F4E]/30 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                Messages
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-[#176B3A]">
                {statistics.conversations.totalMessages}
              </p>

              <p className="mt-2 text-xs text-[#173B28]/60">
                Total messages across conversations
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            FOOTER NOTE
        ======================================================== */}

        <footer className="mt-12 border-t border-[#2F8F4E]/20 pt-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-xs font-bold text-[#2F8F4E]">
              ✓
            </span>

            <p className="text-xs leading-6 text-[#173B28]/60">
              SafeLink administration dashboard · Statistics are retrieved
              from the current system data.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}