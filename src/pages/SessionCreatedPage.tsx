import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SessionCreatedPageProps {
  safelinkId: string;
  onContinue: () => void;
}

function SessionCreatedPage({
  safelinkId,
  onContinue,
}: SessionCreatedPageProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(safelinkId);
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = safelinkId;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy SafeLink ID:", error);
    }
  };

  return (
    <main
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#FAFBF7] bg-cover bg-center bg-no-repeat px-4 py-5 sm:py-6"
      style={{
        backgroundImage: "url('/safelink-login-bg.png')",
      }}
    >
      {/* Main card */}
      <div className="w-full max-w-[430px] rounded-3xl border border-white/70 bg-white/95 px-6 py-5 shadow-xl backdrop-blur-sm sm:px-7 sm:py-6">
        {/* Logo */}
        <div className="flex h-[58px] items-center justify-center">
          <img
            src="/safelink-logo.png"
            alt="SafeLink"
            className="block h-auto max-h-[55px] w-[110px] object-contain"
          />
        </div>

        {/* Success */}
        <div className="mt-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F1E3]">
            <Check size={21} strokeWidth={2.5} className="text-[#2F8F4E]" />
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
            {t("sessionCreatedPage.created")}
          </p>

          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173B28] sm:text-[26px]">
            {t("yourSafeLinkId")}
          </h1>

          <p className="mx-auto mt-2 max-w-[340px] text-sm leading-5 text-[#5B6F62]">
            {t("sessionCreatedPage.description")}
          </p>
        </div>

        {/* SafeLink ID */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5B6F62]">
            {t("sessionCreatedPage.privateId")}
          </p>

          <div className="flex items-center gap-3 rounded-xl border border-[#2F8F4E]/20 bg-[#E7F1E3] px-4 py-4">
            <p className="min-w-0 flex-1 break-all text-center font-mono text-xl font-bold tracking-wider text-[#173B28] sm:text-2xl">
              {safelinkId}
            </p>

            <button
              type="button"
              onClick={handleCopy}
              title={t(copied ? "copied" : "copySafeLinkId")}
              aria-label={t(copied ? "sessionCreatedPage.copiedMessage" : "copySafeLinkId")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#176B3A] shadow-sm transition hover:bg-[#FAFBF7] active:scale-95"
            >
              {copied ? (
                <Check size={19} strokeWidth={2.5} />
              ) : (
                <Copy size={19} />
              )}
            </button>
          </div>

          <div className="mt-2 h-4 text-center">
            {copied && (
              <p className="text-xs font-medium text-[#2F8F4E]">
                {t("sessionCreatedPage.copiedMessage")}
              </p>
            )}
          </div>
        </div>

        {/* Privacy information */}
        <div className="mt-4 rounded-xl border border-[#2F8F4E]/15 bg-[#FAFBF7] px-3.5 py-2.5">
          <p className="text-xs leading-5 text-[#5B6F62]">
            {t("sessionCreatedPage.privacy")}
          </p>
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F8F4E] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176B3A]"
        >
          {t("sessionCreatedPage.continue")}
          <span aria-hidden="true">→</span>
        </button>

        {/* Reminder */}
        <p className="mt-3 text-center text-[11px] leading-4 text-[#718277]">
          {t("sessionCreatedPage.reminder")}
        </p>
      </div>
    </main>
  );
}

export default SessionCreatedPage;
