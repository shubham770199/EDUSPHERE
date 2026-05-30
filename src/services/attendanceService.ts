import api from "./api";

export interface AttendanceRecord {
  _id: string;
  student: { _id: string; name: string; rollNumber?: string };
  course: { _id: string; title: string; code: string };
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

export interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  percentage: number;
}

export const attendanceService = {
  // teacher: bulk mark for a class on a date
  mark: async (courseId: string, date: string, records: any[]) =>
    (await api.post("/attendance", { courseId, date, records })).data,
  // student: my attendance + stats
  mine: async (): Promise<{ overall: AttendanceStats; courses: any[]; records: AttendanceRecord[] }> =>
    (await api.get("/attendance/me")).data,
  forCourse: async (courseId: string, date?: string): Promise<AttendanceRecord[]> =>
    (await api.get(`/attendance/course/${courseId}`, { params: date ? { date } : {} })).data,
  forStudent: async (studentId: string) =>
    (await api.get(`/attendance/student/${studentId}`)).data,
};
