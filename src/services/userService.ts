import api from "./api";
import { User } from "@/types/auth";

export const userService = {
  list: async (params?: { role?: string; search?: string }): Promise<User[]> =>
    (await api.get("/users", { params })).data,
  get: async (id: string): Promise<User> => (await api.get(`/users/${id}`)).data,
  create: async (payload: Partial<User> & { password: string }): Promise<User> =>
    (await api.post("/users", payload)).data,
  update: async (id: string, payload: Partial<User>): Promise<User> =>
    (await api.put(`/users/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/users/${id}`)).data,
  // self profile
  updateProfile: async (payload: Partial<User>) =>
    (await api.put("/auth/profile", payload)).data,
  changePassword: async (currentPassword: string, newPassword: string) =>
    (await api.put("/auth/password", { currentPassword, newPassword })).data,
};
