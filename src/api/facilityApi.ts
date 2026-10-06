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
  added_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FacilityFilters {
  search?: string;
  location?: string;
  supportTypes?: SupportType[];
}

const API_URL = "http://localhost:5000/api";

export async function getFacilities(
  filters: FacilityFilters = {},
): Promise<Facility[]> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.location?.trim()) {
    params.set("location", filters.location.trim());
  }

  if (
    filters.supportTypes &&
    filters.supportTypes.length > 0
  ) {
    params.set(
      "support_type",
      filters.supportTypes.join(","),
    );
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/facilities${query ? `?${query}` : ""}`,
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message || "Failed to load facilities",
    );
  }

  return body.facilities || [];
}

export async function getFacility(
  facilityId: string,
): Promise<Facility> {
  const response = await fetch(
    `${API_URL}/facilities/${encodeURIComponent(facilityId)}`,
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message || "Failed to load facility",
    );
  }

  return body.facility;
}

export async function addFacility(
  data: {
    facility_name: string;
    location: string;
    contact: string;
    support_types: SupportType[];
    description: string;
  },
  token: string,
): Promise<Facility> {
  const response = await fetch(
    `${API_URL}/facilities`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message || "Failed to add facility",
    );
  }

  return body.facility;
}