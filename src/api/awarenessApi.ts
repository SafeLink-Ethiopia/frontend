import axios from "axios";

const API_URL = "https://backend-tncs.onrender.com";

export type Language = "en" | "am" | "om";

export interface AwarenessPost {
  _id: string;
  language: Language;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface GetAwarenessPostsResponse {
  posts: AwarenessPost[];
}

export const getAwarenessPosts = async (): Promise<AwarenessPost[]> => {
  const response = await axios.get<GetAwarenessPostsResponse>(
    `${API_URL}/api/admin/awareness-posts`,
  );

  return response.data.posts;
};
