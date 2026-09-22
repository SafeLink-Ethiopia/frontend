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

async function getAwareness(topic: string): Promise<AwarenessData> {
  const response = await fetch(`http://localhost:5000/api/awareness/${topic}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${topic} awareness information.`);
  }

  return response.json();
}

export async function getConsentAwareness(): Promise<AwarenessData> {
  return getAwareness("consent");
}

export async function getBoundariesAwareness(): Promise<AwarenessData> {
  return getAwareness("boundaries");
}

export async function getHarassmentAwareness(): Promise<AwarenessData> {
  return getAwareness("harassment");
}

export async function getSupportAwareness(): Promise<AwarenessData> {
  return getAwareness("support");
}
