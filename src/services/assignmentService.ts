import { toast } from 'sonner';

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  createdDate: string;
  maxMarks: number;
  attachments: string[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  attachments: string[];
  submittedStatus: 'submitted' | 'pending' | 'late';
  grade?: number;
  feedback?: string;
  gradedDate?: string;
}

const ASSIGNMENTS_DB_KEY = 'edu_sphere_assignments';
const SUBMISSIONS_DB_KEY = 'edu_sphere_submissions';

class AssignmentService {
  public assignments: Assignment[] = [];
  public submissions: AssignmentSubmission[] = [];

  constructor() {
    this.loadData();
    this.initializeDefaultData();
  }

  private loadData() {
    const storedAssignments = localStorage.getItem(ASSIGNMENTS_DB_KEY);
    const storedSubmissions = localStorage.getItem(SUBMISSIONS_DB_KEY);
    
    if (storedAssignments) {
      this.assignments = JSON.parse(storedAssignments);
    }
    if (storedSubmissions) {
      this.submissions = JSON.parse(storedSubmissions);
    }
  }

  private saveData() {
    localStorage.setItem(ASSIGNMENTS_DB_KEY, JSON.stringify(this.assignments));
    localStorage.setItem(SUBMISSIONS_DB_KEY, JSON.stringify(this.submissions));
  }

  private initializeDefaultData() {
    if (this.assignments.length === 0) {
      this.assignments = [
        {
          id: 'assign1',
          courseId: '1',
          courseName: 'Mathematics 101',
          teacherId: 'teacher1',
          title: 'Calculus Problem Set',
          description: 'Solve problems 1-10 from Chapter 5',
          dueDate: '2024-01-25',
          createdDate: '2024-01-10',
          maxMarks: 100,
          attachments: ['problem_set.pdf']
        },
        {
          id: 'assign2',
          courseId: '2',
          courseName: 'Physics 101',
          teacherId: 'teacher1',
          title: 'Lab Report - Newton\'s Laws',
          description: 'Write a detailed report on the lab experiment',
          dueDate: '2024-01-27',
          createdDate: '2024-01-12',
          maxMarks: 100,
          attachments: ['lab_guidelines.pdf']
        }
      ];
      this.saveData();
    }
  }

  // Create a new assignment
  createAssignment(
    courseId: string,
    courseName: string,
    teacherId: string,
    title: string,
    description: string,
    dueDate: string,
    maxMarks: number = 100,
    attachments: string[] = []
  ): Assignment {
    const assignment: Assignment = {
      id: `assign_${Date.now()}`,
      courseId,
      courseName,
      teacherId,
      title,
      description,
      dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      maxMarks,
      attachments
    };

    this.assignments.push(assignment);
    this.saveData();
    return assignment;
  }

  // Get all assignments for a course
  getCourseAssignments(courseId: string): Assignment[] {
    return this.assignments.filter(a => a.courseId === courseId);
  }

  // Get assignment by ID
  getAssignmentById(assignmentId: string): Assignment | undefined {
    return this.assignments.find(a => a.id === assignmentId);
  }

  // Get all assignments for a teacher
  getTeacherAssignments(teacherId: string): Assignment[] {
    return this.assignments.filter(a => a.teacherId === teacherId);
  }

  // Update assignment
  updateAssignment(assignmentId: string, updates: Partial<Assignment>): Assignment {
    const index = this.assignments.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
      this.assignments[index] = { ...this.assignments[index], ...updates };
      this.saveData();
      return this.assignments[index];
    }
    throw new Error('Assignment not found');
  }

  // Delete assignment
  deleteAssignment(assignmentId: string): boolean {
    const index = this.assignments.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
      this.assignments.splice(index, 1);
      // Also delete related submissions
      this.submissions = this.submissions.filter(s => s.assignmentId !== assignmentId);
      this.saveData();
      return true;
    }
    return false;
  }

  // Submit assignment
  submitAssignment(
    assignmentId: string,
    studentId: string,
    studentName: string,
    attachments: string[] = []
  ): AssignmentSubmission {
    // Check if already submitted
    const existing = this.submissions.find(
      s => s.assignmentId === assignmentId && s.studentId === studentId
    );

    const assignment = this.getAssignmentById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const today = new Date().toISOString().split('T')[0];
    const submittedStatus: 'submitted' | 'pending' | 'late' = 
      today > assignment.dueDate ? 'late' : 'submitted';

    if (existing) {
      // Update existing submission
      existing.submissionDate = today;
      existing.attachments = attachments;
      existing.submittedStatus = submittedStatus;
      this.saveData();
      return existing;
    }

    const submission: AssignmentSubmission = {
      id: `sub_${Date.now()}`,
      assignmentId,
      studentId,
      studentName,
      submissionDate: today,
      attachments,
      submittedStatus
    };

    this.submissions.push(submission);
    this.saveData();
    return submission;
  }

  // Get submissions for an assignment
  getAssignmentSubmissions(assignmentId: string): AssignmentSubmission[] {
    return this.submissions.filter(s => s.assignmentId === assignmentId);
  }

  // Get submissions for a student
  getStudentSubmissions(studentId: string): AssignmentSubmission[] {
    return this.submissions.filter(s => s.studentId === studentId);
  }

  // Get student's submission for an assignment
  getStudentSubmission(assignmentId: string, studentId: string): AssignmentSubmission | undefined {
    return this.submissions.find(
      s => s.assignmentId === assignmentId && s.studentId === studentId
    );
  }

  // Grade a submission
  gradeSubmission(
    submissionId: string,
    grade: number,
    feedback: string = ''
  ): AssignmentSubmission {
    const index = this.submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) {
      this.submissions[index] = {
        ...this.submissions[index],
        grade,
        feedback,
        gradedDate: new Date().toISOString().split('T')[0]
      };
      this.saveData();
      return this.submissions[index];
    }
    throw new Error('Submission not found');
  }

  // Get pending submissions for a teacher
  getPendingSubmissions(teacherId: string): AssignmentSubmission[] {
    const teacherAssignments = this.getTeacherAssignments(teacherId);
    const assignmentIds = teacherAssignments.map(a => a.id);
    return this.submissions.filter(
      s => assignmentIds.includes(s.assignmentId) && !s.grade
    );
  }

  // Get graded submissions for a student
  getGradedSubmissions(studentId: string): AssignmentSubmission[] {
    return this.submissions.filter(s => s.studentId === studentId && s.grade !== undefined);
  }
}

export const assignmentService = new AssignmentService();
