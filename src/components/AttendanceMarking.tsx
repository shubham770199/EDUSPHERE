import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { attendanceService, AttendanceRecord } from '@/services/attendanceService';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceMarkingProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  courseName?: string;
}

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ isOpen, onClose, courseId, courseName }) => {
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Map<string, any>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const courses = attendanceService.getCourses();

  useEffect(() => {
    if (selectedCourse) {
      const courseStudents = attendanceService.getCourseStudents(selectedCourse);
      const course = courses.find(c => c.id === selectedCourse);
      const studentList = [
        { id: 'student1', name: 'Alice Johnson' },
        { id: 'student2', name: 'Bob Smith' },
        { id: 'student3', name: 'Carol White' }
      ].filter(s => courseStudents.includes(s.id));
      
      setStudents(studentList);
      
      // Initialize attendance state
      const newAttendance = new Map();
      studentList.forEach(student => {
        newAttendance.set(student.id, {
          status: 'present',
          remarks: ''
        });
      });
      setAttendance(newAttendance);
    }
  }, [selectedCourse]);

  const handleStatusChange = (studentId: string, status: string) => {
    const current = attendance.get(studentId) || {};
    setAttendance(new Map(attendance.set(studentId, { ...current, status })));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    const current = attendance.get(studentId) || {};
    setAttendance(new Map(attendance.set(studentId, { ...current, remarks })));
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    setIsSubmitting(true);
    try {
      const course = courses.find(c => c.id === selectedCourse);
      const attendanceData = students.map(student => ({
        studentId: student.id,
        studentName: student.name,
        status: attendance.get(student.id)?.status || 'present',
        remarks: attendance.get(student.id)?.remarks
      }));

      const records = attendanceService.markClassAttendance(
        selectedCourse,
        course?.name || 'Unknown Course',
        attendanceData
      );

      // Send notifications to students
      attendanceData.forEach(data => {
        notificationService.createNotification(
          data.studentId,
          'Attendance Marked',
          `Your attendance for ${course?.name || 'class'} has been marked as ${data.status}`,
          'attendance'
        );
      });

      toast.success(`Attendance marked for ${records.length} students`);
      handleClose();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCourse(courseId || '');
    setAttendance(new Map());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course-select">Select Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course-select">
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="space-y-3">
              <Label>Mark Attendance for Students</Label>
              <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                {students.map(student => (
                  <Card key={student.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                          </div>
                          <Select 
                            value={attendance.get(student.id)?.status || 'present'}
                            onValueChange={(value) => handleStatusChange(student.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">
                                <Badge className="bg-green-500">Present</Badge>
                              </SelectItem>
                              <SelectItem value="absent">
                                <Badge className="bg-red-500">Absent</Badge>
                              </SelectItem>
                              <SelectItem value="late">
                                <Badge className="bg-yellow-500">Late</Badge>
                              </SelectItem>
                              <SelectItem value="excused">
                                <Badge className="bg-blue-500">Excused</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Remarks (Optional)</Label>
                          <Textarea
                            placeholder="Add any remarks..."
                            value={attendance.get(student.id)?.remarks || ''}
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            className="text-sm min-h-12"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {students.length === 0 && selectedCourse && (
            <div className="text-center py-8 text-muted-foreground">
              No students in this course
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || students.length === 0}>
            {isSubmitting ? 'Saving...' : 'Mark Attendance'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceMarking;
