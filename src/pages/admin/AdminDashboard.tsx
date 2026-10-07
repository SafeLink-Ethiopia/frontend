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
      <main className="min-h-[70vh] bg-[#f7f5f6] px-5 py-12 text-[#3e1919] sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-[#a79093]/30 border-t-[#3e1919]" />

            <p className="text-sm text-[#a79093]">
              Loading dashboard...
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
      <main className="min-h-screen bg-[#f7f5f6] px-5 py-8 text-[#3e1919] sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="border-l-4 border-[#3e1919] bg-[#f0e2d6] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
              Dashboard
            </p>

            <h2 className="mt-2 text-lg font-semibold text-[#3e1919]">
              Failed to load dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#3e1919]/70">
              {error}
            </p>
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
      <main className="min-h-screen bg-[#f7f5f6] px-5 py-8 text-[#3e1919] sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="border-y border-[#a79093]/30 py-8">
            <p className="text-sm text-[#a79093]">
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
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <header className="border-b border-[#a79093]/30 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
            SafeLink Administration
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#3e1919] sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a79093]">
                Monitor SafeLink activity, advisor availability, sessions,
                conversations, and overall system usage.
              </p>
            </div>

            <div className="shrink-0 border-l-2 border-[#3e1919] pl-4">
              <p className="text-xs uppercase tracking-wider text-[#a79093]">
                System overview
              </p>

              <p className="mt-1 text-sm font-medium text-[#3e1919]">
                Current statistics
              </p>
            </div>
          </div>
        </header>

        {/* ========================================================
            KEY STATISTICS
        ======================================================== */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
              Overview
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
              System activity
            </h2>
          </div>

          <div className="border-y border-[#a79093]/30">
            <div className="grid grid-cols-1 divide-y divide-[#a79093]/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-6 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                  Advisors
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-tight text-[#3e1919]">
                    {statistics.advisors.total}
                  </p>

                  <span className="pb-1 text-sm text-[#a79093]">
                    {statistics.advisors.active} active
                  </span>
                </div>

                <div className="mt-5 h-1 bg-[#f0e2d6]">
                  <div
                    className="h-full bg-[#3e1919]"
                    style={{
                      width: `${advisorActivePercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#a79093]">
                  {advisorActivePercentage}% currently active
                </p>
              </div>

              <div className="px-5 py-6 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                  Sessions
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-tight text-[#3e1919]">
                    {statistics.sessions.total}
                  </p>

                  <span className="pb-1 text-sm text-[#a79093]">
                    {statistics.sessions.withPassword} protected
                  </span>
                </div>

                <div className="mt-5 h-1 bg-[#f0e2d6]">
                  <div
                    className="h-full bg-[#3e1919]"
                    style={{
                      width: `${sessionPasswordPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#a79093]">
                  {sessionPasswordPercentage}% protected with a password
                </p>
              </div>

              <div className="px-5 py-6 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                  Conversations
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-tight text-[#3e1919]">
                    {statistics.conversations.total}
                  </p>

                  <span className="pb-1 text-sm text-[#a79093]">
                    {statistics.conversations.totalMessages} messages
                  </span>
                </div>

                <div className="mt-5 h-1 bg-[#f0e2d6]">
                  <div
                    className="h-full bg-[#3e1919]"
                    style={{
                      width: `${conversationMessagePercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#a79093]">
                  {conversationMessagePercentage}% have messages
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SYSTEM GRAPH
        ======================================================== */}

        <section className="mt-12">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
                System statistics
              </h2>

              <p className="mt-1 text-sm text-[#a79093]">
                Total advisors, sessions, and conversations.
              </p>
            </div>
          </div>

          <div className="border-y border-[#a79093]/30 bg-white/40 px-2 py-6 sm:px-5 sm:py-8">
            <div className="h-[320px] w-full">
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
                    stroke="#a79093"
                    strokeOpacity={0.15}
                    strokeDasharray="2 4"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={{
                      stroke: "#a79093",
                      strokeOpacity: 0.3,
                    }}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#a79093",
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#a79093",
                    }}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#a79093",
                      strokeOpacity: 0.2,
                    }}
                    contentStyle={{
                      backgroundColor: "#3e1919",
                      border: "none",
                      borderRadius: "4px",
                      color: "#f7f5f6",
                      padding: "10px 14px",
                    }}
                    labelStyle={{
                      color: "#f0e2d6",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#f7f5f6",
                    }}
                    formatter={(value) => [value, "Total"]}
                    labelFormatter={(label) => `${label}`}
                  />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3e1919"
                    strokeWidth={2.5}
                    dot={{
                      r: 5,
                      fill: "#3e1919",
                      stroke: "#f7f5f6",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#3e1919",
                      stroke: "#f0e2d6",
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
              Distribution
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
              Service overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* ====================================================
                ADVISORS BY TYPE
            ==================================================== */}

            <div>
              <div className="border-b border-[#a79093]/30 pb-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#3e1919]">
                      Advisors by Type
                    </h3>

                    <p className="mt-1 text-sm text-[#a79093]">
                      Distribution across available advisor services.
                    </p>
                  </div>

                  <span className="text-xs uppercase tracking-wider text-[#a79093]">
                    {statistics.advisors.total} total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#a79093]/20">
                {advisorTypeDistribution.length === 0 ? (
                  <p className="py-8 text-sm text-[#a79093]">
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
                      <div key={item.type} className="py-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 bg-[#3e1919]" />

                            <span className="text-sm font-medium capitalize text-[#3e1919]">
                              {item.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#3e1919]">
                              {item.count}
                            </span>

                            <span className="w-10 text-right text-xs text-[#a79093]">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 h-1 bg-[#f0e2d6]">
                          <div
                            className="h-full bg-[#3e1919]"
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

            <div>
              <div className="border-b border-[#a79093]/30 pb-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#3e1919]">
                      Conversations by Language
                    </h3>

                    <p className="mt-1 text-sm text-[#a79093]">
                      Distribution of SafeLink sessions by language.
                    </p>
                  </div>

                  <span className="text-xs uppercase tracking-wider text-[#a79093]">
                    {statistics.sessions.total} total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#a79093]/20">
                {sessionLanguageDistribution.length === 0 ? (
                  <p className="py-8 text-sm text-[#a79093]">
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
                      <div key={item.language} className="py-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 bg-[#3e1919]" />

                            <span className="text-sm font-medium text-[#3e1919]">
                              {languageName}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#3e1919]">
                              {item.count}
                            </span>

                            <span className="w-10 text-right text-xs text-[#a79093]">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 h-1 bg-[#f0e2d6]">
                          <div
                            className="h-full bg-[#3e1919]"
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

        <section className="mt-12 border-t border-[#a79093]/30 pt-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                Active Advisors
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#3e1919]">
                {statistics.advisors.active}
              </p>

              <p className="mt-1 text-xs text-[#a79093]">
                {statistics.advisors.inactive} currently inactive
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                Session Security
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#3e1919]">
                {statistics.sessions.withPassword}
              </p>

              <p className="mt-1 text-xs text-[#a79093]">
                Sessions protected with a password
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                Messages
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#3e1919]">
                {statistics.conversations.totalMessages}
              </p>

              <p className="mt-1 text-xs text-[#a79093]">
                Total messages across conversations
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            FOOTER NOTE
        ======================================================== */}

        <footer className="mt-12 border-t border-[#a79093]/30 pt-6">
          <p className="text-xs leading-5 text-[#a79093]">
            SafeLink administration dashboard · Statistics are retrieved from
            the current system data.
          </p>
        </footer>
      </div>
    </main>
  );
}