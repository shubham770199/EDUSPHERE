import api from "./api";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "assignment" | "attendance" | "grade" | "announcement";
  read: boolean;
  link?: string;
  createdAt: string;
}

export const notificationService = {
  list: async (): Promise<{ notifications: NotificationItem[]; unread: number }> =>
    (await api.get("/notifications")).data,
  markRead: async (id: string) => (await api.put(`/notifications/${id}/read`)).data,
  markAllRead: async () => (await api.put("/notifications/read-all")).data,
  remove: async (id: string) => (await api.delete(`/notifications/${id}`)).data,
};
