import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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

interface SaveAwarenessPostResponse {
  message: string;
  post: AwarenessPost;
}

interface DeleteAwarenessPostResponse {
  message: string;
}

/* ============================================================
   PUBLIC — Awareness Page (read-only)
============================================================ */

export const getAwarenessPosts = async (): Promise<AwarenessPost[]> => {
  const response = await axios.get<GetAwarenessPostsResponse>(
    `${API_URL}/api/admin/awareness-posts`,
  );

  return response.data.posts;
};

/* ============================================================
   ADMIN — Awareness Manager
============================================================ */

const getAdminToken = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin authentication required.");
  }

  return token;
};

export const createAwarenessPost = async (payload: {
  language: Language;
  title: string;
  content: string;
}): Promise<AwarenessPost> => {
  const token = getAdminToken();

  const response = await axios.post<SaveAwarenessPostResponse>(
    `${API_URL}/api/admin/awareness-posts`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.post;
};

export const updateAwarenessPost = async (
  postId: string,
  payload: {
    language: Language;
    title: string;
    content: string;
  },
): Promise<AwarenessPost> => {
  const token = getAdminToken();

  const response = await axios.put<SaveAwarenessPostResponse>(
    `${API_URL}/api/admin/awareness-posts/${postId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.post;
};

export const deleteAwarenessPost = async (
  postId: string,
): Promise<void> => {
  const token = getAdminToken();

  await axios.delete<DeleteAwarenessPostResponse>(
    `${API_URL}/api/admin/awareness-posts/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};