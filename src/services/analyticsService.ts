import api from "./api";

export const analyticsService = {
  admin: async () => (await api.get("/analytics/admin")).data,
  teacher: async () => (await api.get("/analytics/teacher")).data,
  student: async () => (await api.get("/analytics/student")).data,
};
