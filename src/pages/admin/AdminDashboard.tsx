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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     NO DATA
  ============================================================ */

  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-gray-500">No dashboard data available.</p>
        </div>
      </div>
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
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="mb-8">
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor SafeLink activity and system statistics.
          </p>
        </div>

        {/* ========================================================
            SYSTEM STATISTICS LINE GRAPH
        ======================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              System Statistics
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Total advisors, sessions, and conversations.
            </p>
          </div>

          <div className="h-[350px] w-full">
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
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 13,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 13,
                  }}
                />

                <Tooltip
                  formatter={(value) => [value, "Total"]}
                  labelFormatter={(label) => `${label}`}
                />

                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graph values */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-600">
                Total Advisors
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {statistics.advisors.total}
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm font-medium text-purple-600">
                Total Sessions
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {statistics.sessions.total}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-sm font-medium text-orange-600">
                Total Conversations
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {statistics.conversations.total}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            DISTRIBUTION SECTIONS
        ======================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ======================================================
              ADVISORS BY TYPE
          ====================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Advisors by Type
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Distribution of advisors across service types.
              </p>
            </div>

            <div className="space-y-5">
              {advisorTypeDistribution.length === 0 ? (
                <p className="text-sm text-gray-500">
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
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium capitalize text-gray-700">
                          {item.type}
                        </span>

                        <span className="text-sm text-gray-500">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
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

          {/* ======================================================
              CONVERSATIONS BY LANGUAGE
          ====================================================== */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Conversations by Language
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Distribution of SafeLink conversations by language.
              </p>
            </div>

            <div className="space-y-5">
              {sessionLanguageDistribution.length === 0 ? (
                <p className="text-sm text-gray-500">
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
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {languageName}
                        </span>

                        <span className="text-sm text-gray-500">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-purple-500"
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
      </div>
    </div>
  );
}
