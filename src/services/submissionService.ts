import api from "./api";

export interface Submission {
  _id: string;
  assignment: any;
  student: { _id: string; name: string; email?: string; rollNumber?: string };
  content: string;
  attachments: { name: string; url: string }[];
  submittedAt: string;
  status: "submitted" | "late" | "graded";
  grade: number | null;
  feedback: string;
  gradedAt: string | null;
}

export const submissionService = {
  submit: async (payload: { assignmentId: string; content?: string; attachments?: any[] }) =>
    (await api.post("/submissions", payload)).data,
  mine: async (): Promise<Submission[]> => (await api.get("/submissions/me")).data,
  pending: async (): Promise<Submission[]> => (await api.get("/submissions/pending")).data,
  forAssignment: async (assignmentId: string): Promise<Submission[]> =>
    (await api.get(`/submissions/assignment/${assignmentId}`)).data,
  grade: async (id: string, grade: number, feedback: string) =>
    (await api.put(`/submissions/${id}/grade`, { grade, feedback })).data,
};
