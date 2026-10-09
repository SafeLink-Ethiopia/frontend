import AdvisorChat from "../components/advisorChat";
import type { ComponentType } from "react";

export default function LegalAdvisorPage() {
  const LegalAdvisorChat = AdvisorChat as unknown as ComponentType<{ advisorType: string }>;
  return <LegalAdvisorChat advisorType="legal" />;
}
