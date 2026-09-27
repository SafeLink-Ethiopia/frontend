import type { AdvisorType } from "./advisor";

export interface AdvisorProfile {
  advisor_id: string;
  name: string;
  email: string;
  gender: "male" | "female";
  type: AdvisorType;
  phone_number: string;
  location: string;
  working_hours: { start: string; end: string };
  active: boolean;
  mustChangePassword: boolean;
}
