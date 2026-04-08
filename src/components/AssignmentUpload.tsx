import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignmentService } from '@/services/assignmentService';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import { Upload, Trash2 } from 'lucide-react';

interface AssignmentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ isOpen, onClose, teacherId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [courseId, setCourseId] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courses = [
    { id: '1', name: 'Mathematics 101' },
    { id: '2', name: 'Physics 101' },
    { id: '3', name: 'Chemistry 101' }
  ];

  const handleAddAttachment = (fileName: string) => {
    if (fileName && !attachments.includes(fileName)) {
      setAttachments([...attachments, fileName]);
    }
  };

  const handleRemoveAttachment = (fileName: string) => {
    setAttachments(attachments.filter(a => a !== fileName));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !dueDate || !courseId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const course = courses.find(c => c.id === courseId);
      const assignment = assignmentService.createAssignment(
        courseId,
        course?.name || 'Unknown Course',
        teacherId,
        title,
        description,
        dueDate,
        parseInt(maxMarks),
        attachments
      );

      // Send notifications to all students
      ['student1', 'student2', 'student3'].forEach(studentId => {
        notificationService.createNotification(
          studentId,
          'New Assignment',
          `New assignment "${title}" has been created in ${course?.name}. Due: ${dueDate}`,
          'assignment',
          assignment.id
        );
      });

      toast.success('Assignment created successfully');
      handleClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setMaxMarks('100');
    setCourseId('');
    setAttachments([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Calculus Problem Set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course">Course *</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select a course" />
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the assignment requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Due Date and Max Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxMarks">Maximum Marks</Label>
              <Input
                id="maxMarks"
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <Label>Attachments</Label>
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="file-input"
                      type="text"
                      placeholder="Enter file name or URL"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddAttachment((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('file-input') as HTMLInputElement;
                        if (input.value) {
                          handleAddAttachment(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t">
                      <p className="text-sm font-medium">Attached Files:</p>
                      {attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm truncate">{attachment}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAttachment(attachment)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentUpload;
