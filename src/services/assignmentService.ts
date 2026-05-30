import api from "./api";

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string; code: string; color?: string };
  teacher: { _id: string; name: string };
  dueDate: string;
  maxMarks: number;
  attachments: { name: string; url: string }[];
  // student view extras
  submissionStatus?: "pending" | "submitted" | "late" | "graded";
  grade?: number | null;
  submissionId?: string | null;
  // teacher view extras
  submissionCount?: number;
  gradedCount?: number;
}

export const assignmentService = {
  list: async (): Promise<Assignment[]> => (await api.get("/assignments")).data,
  get: async (id: string): Promise<Assignment> => (await api.get(`/assignments/${id}`)).data,
  create: async (payload: {
    title: string;
    description?: string;
    course: string;
    dueDate: string;
    maxMarks?: number;
  }): Promise<Assignment> => (await api.post("/assignments", payload)).data,
  update: async (id: string, payload: Partial<Assignment>) =>
    (await api.put(`/assignments/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/assignments/${id}`)).data,
};
