import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

const ATTENDANCE_DB_KEY = 'edu_sphere_attendance_records';
const COURSE_DB_KEY = 'edu_sphere_courses';

class AttendanceService {
  private attendanceRecords: AttendanceRecord[] = [];
  private courses: any[] = [];

  constructor() {
    this.loadData();
    this.initializeDefaultData();
  }

  private loadData() {
    const storedRecords = localStorage.getItem(ATTENDANCE_DB_KEY);
    const storedCourses = localStorage.getItem(COURSE_DB_KEY);
    
    if (storedRecords) {
      this.attendanceRecords = JSON.parse(storedRecords);
    }
    if (storedCourses) {
      this.courses = JSON.parse(storedCourses);
    }
  }

  private saveData() {
    localStorage.setItem(ATTENDANCE_DB_KEY, JSON.stringify(this.attendanceRecords));
    localStorage.setItem(COURSE_DB_KEY, JSON.stringify(this.courses));
  }

  private initializeDefaultData() {
    if (this.courses.length === 0) {
      this.courses = [
        { id: '1', name: 'Mathematics 101', teacherId: 'teacher1', students: ['student1', 'student2', 'student3'] },
        { id: '2', name: 'Physics 101', teacherId: 'teacher1', students: ['student1', 'student2', 'student3'] },
        { id: '3', name: 'Chemistry 101', teacherId: 'teacher2', students: ['student1', 'student2', 'student3'] }
      ];
      this.saveData();
    }
  }

  // Mark attendance for a student
  markAttendance(
    studentId: string,
    studentName: string,
    courseId: string,
    courseName: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    remarks?: string
  ): AttendanceRecord {
    const attendanceRecord: AttendanceRecord = {
      id: `att_${Date.now()}_${Math.random()}`,
      studentId,
      studentName,
      courseId,
      courseName,
      date: new Date().toISOString().split('T')[0],
      status,
      remarks
    };

    this.attendanceRecords.push(attendanceRecord);
    this.saveData();
    return attendanceRecord;
  }

  // Bulk mark attendance for a class
  markClassAttendance(
    courseId: string,
    courseName: string,
    attendanceData: Array<{ studentId: string; studentName: string; status: string; remarks?: string }>
  ): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];
    
    // Remove old records for today and this course
    const today = new Date().toISOString().split('T')[0];
    this.attendanceRecords = this.attendanceRecords.filter(
      record => !(record.date === today && record.courseId === courseId)
    );

    attendanceData.forEach(({ studentId, studentName, status, remarks }) => {
      const record = this.markAttendance(
        studentId,
        studentName,
        courseId,
        courseName,
        status as 'present' | 'absent' | 'late' | 'excused',
        remarks
      );
      records.push(record);
    });

    return records;
  }

  // Get attendance records for a student
  getStudentAttendance(studentId: string, courseId?: string): AttendanceRecord[] {
    return this.attendanceRecords.filter(record => {
      if (courseId) {
        return record.studentId === studentId && record.courseId === courseId;
      }
      return record.studentId === studentId;
    });
  }

  // Get attendance records for a course
  getCourseAttendance(courseId: string): AttendanceRecord[] {
    return this.attendanceRecords.filter(record => record.courseId === courseId);
  }

  // Get today's attendance for a course
  getTodaysAttendance(courseId: string): AttendanceRecord[] {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRecords.filter(
      record => record.courseId === courseId && record.date === today
    );
  }

  // Calculate attendance statistics for a student
  getAttendanceStats(studentId: string, courseId?: string): AttendanceStats {
    const records = this.getStudentAttendance(studentId, courseId);
    
    const stats: AttendanceStats = {
      totalClasses: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
      percentage: 0
    };

    if (stats.totalClasses > 0) {
      const attendedClasses = stats.present + stats.late;
      stats.percentage = Math.round((attendedClasses / stats.totalClasses) * 100);
    }

    return stats;
  }

  // Get all courses
  getCourses(): any[] {
    return this.courses;
  }

  // Add a new course
  addCourse(name: string, teacherId: string, students: string[] = []): any {
    const course = {
      id: `course_${Date.now()}`,
      name,
      teacherId,
      students
    };
    this.courses.push(course);
    this.saveData();
    return course;
  }

  // Get students in a course
  getCourseStudents(courseId: string): string[] {
    const course = this.courses.find(c => c.id === courseId);
    return course?.students || [];
  }

  // Update course
  updateCourse(courseId: string, updates: any): any {
    const index = this.courses.findIndex(c => c.id === courseId);
    if (index !== -1) {
      this.courses[index] = { ...this.courses[index], ...updates };
      this.saveData();
      return this.courses[index];
    }
    throw new Error('Course not found');
  }
}

export const attendanceService = new AttendanceService();
