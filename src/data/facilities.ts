export type SupportType =
  | "medical"
  | "legal"
  | "psychological"
  | "general";

export interface Facility {
  facility_id: string;
  facility_name: string;
  location: string;
  contact: string;
  support_types: SupportType[];
  description: string;
}

export const FACILITIES: Facility[] = [
  {
    facility_id: "FAC-001",
    facility_name: "Addis Ababa Care Center",
    location: "Bole, Addis Ababa",
    contact: "+251 900 000 001",
    support_types: ["medical", "psychological"],
    description:
      "Support facility providing medical and related assistance.",
  },
  {
    facility_id: "FAC-002",
    facility_name: "SafeCare Medical Center",
    location: "Arada, Addis Ababa",
    contact: "+251 900 000 002",
    support_types: ["medical"],
    description:
      "Medical support facility for people seeking healthcare assistance.",
  },
  {
    facility_id: "FAC-003",
    facility_name: "Community Health Support Center",
    location: "Kirkos, Addis Ababa",
    contact: "+251 900 000 003",
    support_types: ["medical", "psychological", "general"],
    description:
      "Community-oriented support for healthcare and general assistance.",
  },
];