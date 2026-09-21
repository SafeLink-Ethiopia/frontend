export interface AwarenessSource {
  title: string;
  summary: string;
  authors: string[];
  published: string;
  pdfLink: string;
  absLink: string;
}

export interface AwarenessData {
  slug: string;
  title: string;
  description: string;
  sources: AwarenessSource[];
}

export async function getConsentAwareness(): Promise<AwarenessData> {
  const response = await fetch("http://localhost:5000/api/awareness/consent");

  if (!response.ok) {
    throw new Error("Failed to load consent awareness information.");
  }

  return response.json();
}
