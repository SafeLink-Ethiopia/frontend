import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Languages,
  Leaf,
  MessageCircle,
  MessagesSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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

interface MetricCardProps {
  label: string;
  value: number;
  supportingText: string;
  progress: number;
  icon: ReactNode;
  detail: string;
}

interface DistributionItem {
  key: string;
  label: string;
  count: number;
}

interface DistributionSectionProps {
  title: string;
  description: string;
  totalLabel: string;
  items: DistributionItem[];
  emptyMessage: string;
}

const API_URL = "https://backend-tncs.onrender.com/api/admin/dashboard";

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const toPercentage = (value: number, total: number) => {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
};

function MetricCard({
  label,
  value,
  supportingText,
  progress,
  icon,
  detail,
}: MetricCardProps) {
  const { t } = useTranslation();
  return (
    <article className="rounded-2xl border border-[#DCE9D8] bg-white p-5 shadow-[0_4px_18px_rgba(23,59,40,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,59,40,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#55705D]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#173B28] sm:text-4xl">
            {formatNumber(value)}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3] text-[#176B3A]">
          {icon}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-[#55705D]">{supportingText}</span>
          <span className="font-semibold tabular-nums text-[#176B3A]">
            {progress}%
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[#E7F1E3]"
          role="progressbar"
          aria-label={t("admin.dashboard.progress", { label })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-[#2F8F4E] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-[#718575]">{detail}</p>
      </div>
    </article>
  );
}

function DistributionSection({
  title,
  description,
  totalLabel,
  items,
  emptyMessage,
}: DistributionSectionProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-2xl border border-[#DCE9D8] bg-white p-5 shadow-[0_4px_18px_rgba(23,59,40,0.035)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[#E7F1E3] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#173B28]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#718575]">{description}</p>
        </div>
        <span className="w-fit rounded-full bg-[#F2F7EF] px-3 py-1 text-xs font-medium text-[#176B3A]">
          {totalLabel}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-sm text-[#718575]">{emptyMessage}</p>
      ) : (
        <div className="divide-y divide-[#EEF4EB]">
          {items.map((item) => {
            const percentage = toPercentage(item.count, total);

            return (
              <div key={item.key} className="py-4 last:pb-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2F8F4E]" />
                    <span className="truncate text-sm font-medium capitalize text-[#244C33]">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-[#173B28]">
                      {formatNumber(item.count)}
                    </span>
                    <span className="w-10 text-right text-xs tabular-nums text-[#718575]">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="ml-5 mt-3 h-1.5 overflow-hidden rounded-full bg-[#E7F1E3]">
                  <div
                    className="h-full rounded-full bg-[#2F8F4E]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InsightRow({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#DCE9D8] bg-white p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F1E3] text-[#176B3A]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#55705D]">{title}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[#173B28]">
          {formatNumber(value)}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#718575]">{description}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error(t("admin.dashboard.errors.session"));
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || t("admin.dashboard.errors.load"),
        );
      }

      if (!data.statistics) {
        throw new Error(t("admin.dashboard.errors.missingStatistics"));
      }

      setDashboard({
        statistics: data.statistics,
        advisorTypeDistribution: Array.isArray(data.advisorTypeDistribution)
          ? data.advisorTypeDistribution
          : [],
        sessionLanguageDistribution: Array.isArray(
          data.sessionLanguageDistribution,
        )
          ? data.sessionLanguageDistribution
          : [],
      });
      setLastUpdated(new Date());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("admin.dashboard.errors.unexpected"),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !dashboard) {
    return (
      <main className="min-h-screen bg-[#FAFBF7] px-5 py-10 text-[#173B28] sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3] text-[#176B3A]">
              <Leaf className="h-7 w-7 animate-pulse" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-lg font-semibold">{t("admin.dashboard.loadingTitle")}</h1>
            <p className="mt-2 text-sm text-[#718575]">
              {t("admin.dashboard.loadingDescription")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !dashboard) {
    return (
      <main className="min-h-screen bg-[#FAFBF7] px-5 py-10 text-[#173B28] sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-[#DCE9D8] bg-white p-7 text-center shadow-sm sm:p-9">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBECE7] text-[#9A4733]">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-[#173B28]">
              {t("admin.dashboard.unavailable")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#718575]">{error}</p>
            <button
              type="button"
              onClick={() => void fetchDashboard()}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2F8F4E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t("admin.common.tryAgain")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) return null;

  const { statistics, advisorTypeDistribution, sessionLanguageDistribution } =
    dashboard;

  const advisorActivePercentage = toPercentage(
    statistics.advisors.active,
    statistics.advisors.total,
  );
  const sessionPasswordPercentage = toPercentage(
    statistics.sessions.withPassword,
    statistics.sessions.total,
  );
  const conversationMessagePercentage = toPercentage(
    statistics.conversations.withMessages,
    statistics.conversations.total,
  );

  const statisticsChartData: StatisticsChartData[] = [
    { name: t("admin.dashboard.metrics.advisors"), total: statistics.advisors.total },
    { name: t("admin.dashboard.metrics.sessions"), total: statistics.sessions.total },
    { name: t("admin.dashboard.metrics.conversations"), total: statistics.conversations.total },
  ];

  const languageName = (language: string) => {
    if (language === "en") return t("admin.languages.english");
    if (language === "am") return t("admin.languages.amharic");
    if (language === "om") return t("admin.languages.afaanOromo");
    return language;
  };

  const advisorItems: DistributionItem[] = advisorTypeDistribution.map(
    (item) => ({
      key: item.type,
      label: item.type,
      count: item.count,
    }),
  );

  const languageItems: DistributionItem[] = sessionLanguageDistribution.map(
    (item) => ({
      key: item.language,
      label: languageName(item.language),
      count: item.count,
    }),
  );

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-11">
        <header className="overflow-hidden rounded-2xl border border-[#DCE9D8] bg-white shadow-[0_6px_24px_rgba(23,59,40,0.045)]">
          <div className="h-1.5 bg-gradient-to-r from-[#176B3A] via-[#2F8F4E] to-[#B7D7AC]" />
          <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between lg:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E7F1E3] text-[#176B3A] sm:flex">
                <Leaf className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1E3] px-3 py-1 text-xs font-semibold text-[#176B3A]">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("admin.brand.administration")}
                  </span>
                  {lastUpdated && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#718575]">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("admin.dashboard.updated", { time: lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) })}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#173B28] sm:text-3xl lg:text-4xl">
                  {t("admin.dashboard.title")}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718575] sm:text-base">
                  {t("admin.dashboard.description")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void fetchDashboard(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#C8DDC2] bg-[#FAFBF7] px-4 py-2.5 text-sm font-semibold text-[#176B3A] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {refreshing ? t("admin.dashboard.refreshing") : t("admin.dashboard.refresh")}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-[#E8CFC5] bg-[#FFF7F3] px-4 py-3 text-sm text-[#844431]"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">{t("admin.dashboard.refreshFailed")}</p>
              <p className="mt-1 leading-5">{t("admin.dashboard.refreshWarning", { error })}</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchDashboard(true)}
              className="shrink-0 font-semibold underline underline-offset-4 hover:no-underline"
            >
              {t("admin.common.retry")}
            </button>
          </div>
        )}

        <section className="mt-8 sm:mt-10" aria-labelledby="overview-heading">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F8F4E]">
                {t("admin.dashboard.atAGlance")}
              </p>
              <h2
                id="overview-heading"
                className="mt-1 text-xl font-semibold text-[#173B28] sm:text-2xl"
              >
                {t("admin.dashboard.systemOverview")}
              </h2>
            </div>
            <p className="text-sm text-[#718575]">
              {t("admin.dashboard.currentTotals")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label={t("admin.dashboard.metrics.advisors")}
              value={statistics.advisors.total}
              supportingText={t("admin.dashboard.metrics.activeCount", { count: formatNumber(statistics.advisors.active) })}
              progress={advisorActivePercentage}
              detail={t("admin.dashboard.metrics.inactiveCount", { count: formatNumber(statistics.advisors.inactive) })}
              icon={<Users className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label={t("admin.dashboard.metrics.sessions")}
              value={statistics.sessions.total}
              supportingText={t("admin.dashboard.metrics.passwordProtected", { count: formatNumber(statistics.sessions.withPassword) })}
              progress={sessionPasswordPercentage}
              detail={t("admin.dashboard.metrics.withoutPassword", { count: formatNumber(statistics.sessions.withoutPassword) })}
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            />
            <MetricCard
              label={t("admin.dashboard.metrics.conversations")}
              value={statistics.conversations.total}
              supportingText={t("admin.dashboard.metrics.withMessages", { count: formatNumber(statistics.conversations.withMessages) })}
              progress={conversationMessagePercentage}
              detail={t("admin.dashboard.metrics.totalMessages", { count: formatNumber(statistics.conversations.totalMessages) })}
              icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
            />
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="activity-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F8F4E]">
              {t("admin.dashboard.activity")}
            </p>
            <h2
              id="activity-heading"
              className="mt-1 text-xl font-semibold text-[#173B28] sm:text-2xl"
            >
              {t("admin.dashboard.systemStatistics")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#718575]">
              {t("admin.dashboard.statisticsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-[#DCE9D8] bg-white p-3 shadow-[0_4px_18px_rgba(23,59,40,0.035)] sm:p-6">
            <div className="mb-3 flex items-center gap-2 px-2 pt-1 text-sm text-[#55705D]">
              <Activity className="h-4 w-4 text-[#2F8F4E]" aria-hidden="true" />
              <span>{t("admin.dashboard.currentCounts")}</span>
            </div>
            <div className="h-[280px] w-full sm:h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={statisticsChartData}
                  margin={{ top: 12, right: 12, left: -12, bottom: 6 }}
                >
                  <CartesianGrid
                    stroke="#DCE9D8"
                    strokeDasharray="3 5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#718575" }}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#718575" }}
                    width={42}
                  />
                  <Tooltip
                    cursor={{ stroke: "#B7D7AC", strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "#173B28",
                      border: "1px solid #2F8F4E",
                      borderRadius: "12px",
                      color: "#FAFBF7",
                      padding: "10px 14px",
                      boxShadow: "0 8px 24px rgba(23,59,40,0.15)",
                    }}
                    labelStyle={{ color: "#E7F1E3", marginBottom: "4px" }}
                    itemStyle={{ color: "#FFFFFF" }}
                    formatter={(value) => [value ?? 0, t("admin.dashboard.total")]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name={t("admin.dashboard.total")}
                    stroke="#2F8F4E"
                    strokeWidth={3}
                    activeDot={{
                      r: 7,
                      fill: "#176B3A",
                      stroke: "#E7F1E3",
                      strokeWidth: 3,
                    }}
                    dot={{
                      r: 5,
                      fill: "#2F8F4E",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="distribution-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F8F4E]">
              {t("admin.dashboard.serviceOverview")}
            </p>
            <h2
              id="distribution-heading"
              className="mt-1 text-xl font-semibold text-[#173B28] sm:text-2xl"
            >
              {t("admin.dashboard.serviceTitle")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#718575]">
              {t("admin.dashboard.serviceDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DistributionSection
              title={t("admin.dashboard.advisorsByType")}
              description={t("admin.dashboard.advisorsByTypeDescription")}
              totalLabel={t("admin.dashboard.advisorsTotal", { count: formatNumber(statistics.advisors.total) })}
              items={advisorItems}
              emptyMessage={t("admin.dashboard.noAdvisorTypeData")}
            />
            <DistributionSection
              title={t("admin.dashboard.sessionsByLanguage")}
              description={t("admin.dashboard.sessionsByLanguageDescription")}
              totalLabel={t("admin.dashboard.sessionsTotal", { count: formatNumber(statistics.sessions.total) })}
              items={languageItems}
              emptyMessage={t("admin.dashboard.noSessionLanguageData")}
            />
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="health-heading">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2F8F4E]">
              {t("admin.dashboard.quickChecks")}
            </p>
            <h2
              id="health-heading"
              className="mt-1 text-xl font-semibold text-[#173B28] sm:text-2xl"
            >
              {t("admin.dashboard.serviceHealth")}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#718575]">
              {t("admin.dashboard.serviceHealthDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InsightRow
              icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
              title={t("admin.dashboard.conversationsWithMessages")}
              value={statistics.conversations.withMessages}
              description={t("admin.dashboard.noMessagesConversations", { count: formatNumber(statistics.conversations.withoutMessages) })}
            />
            <InsightRow
              icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
              title={t("admin.dashboard.recommendationsAvailable")}
              value={statistics.conversations.withRecommendations}
              description={t("admin.dashboard.noRecommendationsConversations", { count: formatNumber(statistics.conversations.withoutRecommendations) })}
            />
            <InsightRow
              icon={<Languages className="h-5 w-5" aria-hidden="true" />}
              title={t("admin.dashboard.passwordProtectedSessions")}
              value={statistics.sessions.withPassword}
              description={t("admin.dashboard.unprotectedSessions", { count: formatNumber(statistics.sessions.withoutPassword) })}
            />
          </div>
        </section>

        <footer className="mt-10 border-t border-[#DCE9D8] pt-5">
          <p className="text-xs leading-5 text-[#718575]">
            {t("admin.dashboard.footer")}
          </p>
        </footer>
      </div>
    </main>
  );
}
