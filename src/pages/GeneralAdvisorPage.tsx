import { useNavigate } from "react-router-dom";
import AdvisorChat from "../components/advisorChat";
import type { AdvisorType } from "../types/advisor";

export default function GeneralAdvisorPage() {
  const navigate = useNavigate();

  function handleConnectToType(type: AdvisorType) {
    if (type === "medical") {
      navigate("/medical");
    } else {
      navigate(`/advisor/${type}`);
    }
  }

  return (
    <AdvisorChat
      advisorType="general"
      onConnectToType={handleConnectToType}
    />
  );
}