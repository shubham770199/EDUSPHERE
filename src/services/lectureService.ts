import axios from "axios";
import api, { TOKEN_KEY } from "./api";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface Lecture {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string; code: string; color?: string };
  teacher: { _id: string; name: string };
  videoKey: string;
  videoUrl: string | null; // signed playback URL
  fileName: string;
  contentType: string;
  size: number;
  durationSeconds: number;
  views: number;
  createdAt: string;
}

export const lectureService = {
  list: async (): Promise<Lecture[]> => (await api.get("/lectures")).data,
  get: async (id: string): Promise<Lecture> => (await api.get(`/lectures/${id}`)).data,
  remove: async (id: string) => (await api.delete(`/lectures/${id}`)).data,

  // Multipart upload with progress. Uses raw axios so the browser sets the
  // multipart boundary (the shared `api` instance defaults to application/json).
  upload: async (
    payload: { title: string; description?: string; course: string; file: File },
    onProgress?: (percent: number) => void
  ): Promise<Lecture> => {
    const form = new FormData();
    form.append("video", payload.file);
    form.append("title", payload.title);
    form.append("description", payload.description || "");
    form.append("course", payload.course);

    const { data } = await axios.post(`${API_ROOT}/api/lectures`, form, {
      headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
      timeout: 0, // large uploads — no timeout
    });
    return data;
  },
};
