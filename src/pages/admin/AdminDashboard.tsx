import { useEffect, useState } from "react";

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

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminId = localStorage.getItem("adminId");

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

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Welcome back</p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor SafeLink activity and system statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Advisors
                </p>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {statistics.advisors.total}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-600">
                Advisors
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-green-600">
                {statistics.advisors.active} active
              </span>

              <span className="text-gray-500">
                {statistics.advisors.inactive} inactive
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${advisorActivePercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Sessions
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {statistics.sessions.total}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 px-3 py-2 text-purple-600">
                Sessions
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-green-600">
                {statistics.sessions.withPassword} secured
              </span>

              <span className="text-gray-500">
                {statistics.sessions.withoutPassword} without password
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{
                  width: `${sessionPasswordPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Conversations
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {statistics.conversations.total}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 px-3 py-2 text-orange-600">
                Conversations
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-blue-600">
                {statistics.conversations.withMessages} active
              </span>

              <span className="text-gray-500">
                {statistics.conversations.withoutMessages} empty
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{
                  width: `${conversationMessagePercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Messages</p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {statistics.conversations.totalMessages}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Messages exchanged between users and advisors.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Recommendations</p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {statistics.conversations.withRecommendations}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Conversations that received a facility recommendation.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Conversations Without Recommendations
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {statistics.conversations.withoutRecommendations}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Conversations that have no recommendation yet.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Sessions by Language
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Distribution of SafeLink sessions by language.
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

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Conversation Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current conversation activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">With Messages</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.conversations.withMessages}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Without Messages</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.conversations.withoutMessages}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Total Messages</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.conversations.totalMessages}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
