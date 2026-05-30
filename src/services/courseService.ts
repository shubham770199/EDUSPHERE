import api from "./api";

export interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  department: string;
  credits: number;
  semester: string;
  color?: string;
  teacher: { _id: string; name: string; email?: string; department?: string };
  students: { _id: string; name: string; email?: string; rollNumber?: string }[];
  schedule: { day: string; time: string; room: string }[];
}

export const courseService = {
  list: async (): Promise<Course[]> => (await api.get("/courses")).data,
  available: async (): Promise<Course[]> => (await api.get("/courses/available")).data,
  get: async (id: string): Promise<Course> => (await api.get(`/courses/${id}`)).data,
  create: async (payload: Partial<Course>): Promise<Course> =>
    (await api.post("/courses", payload)).data,
  update: async (id: string, payload: Partial<Course>): Promise<Course> =>
    (await api.put(`/courses/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/courses/${id}`)).data,
  enroll: async (id: string, studentId?: string): Promise<Course> =>
    (await api.post(`/courses/${id}/enroll`, studentId ? { studentId } : {})).data,
  unenroll: async (id: string, studentId?: string): Promise<Course> =>
    (await api.post(`/courses/${id}/unenroll`, studentId ? { studentId } : {})).data,
};
