import api from "./api";

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  author: { _id: string; name: string; role: string };
  audience: "all" | "students" | "teachers" | "course";
  course?: { _id: string; title: string; code: string } | null;
  priority: "low" | "normal" | "high";
  createdAt: string;
}

export const announcementService = {
  list: async (): Promise<Announcement[]> => (await api.get("/announcements")).data,
  create: async (payload: {
    title: string;
    message: string;
    audience?: string;
    course?: string;
    priority?: string;
  }) => (await api.post("/announcements", payload)).data,
  remove: async (id: string) => (await api.delete(`/announcements/${id}`)).data,
};
