import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { assignmentService, type Assignment } from '@/services/assignmentService';
import type { AssignmentSubmission } from '@/services/assignmentService';
import { notificationService } from '@/services/notificationService';
import { toast } from 'sonner';
import { Upload, Trash2, FileText } from 'lucide-react';

interface AssignmentSubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: Assignment;
  studentId: string;
  studentName: string;
}

const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({ 
  isOpen, 
  onClose, 
  assignment,
  studentId,
  studentName 
}) => {
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (isOpen && assignment) {
      const existing = assignmentService.getStudentSubmission(assignment.id, studentId);
      if (existing) {
        setSubmission(existing);
        setAttachments(existing.attachments);
        setShowDetails(false);
      } else {
        setSubmission(null);
        setAttachments([]);
        setShowDetails(true);
      }
    }
  }, [isOpen, assignment, studentId]);

  const handleAddAttachment = (fileName: string) => {
    if (fileName && !attachments.includes(fileName)) {
      setAttachments([...attachments, fileName]);
    }
  };

  const handleRemoveAttachment = (fileName: string) => {
    setAttachments(attachments.filter(a => a !== fileName));
  };

  const handleSubmit = async () => {
    if (!assignment || attachments.length === 0) {
      toast.error('Please add at least one file');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = assignmentService.submitAssignment(
        assignment.id,
        studentId,
        studentName,
        attachments
      );

      // Send notification to teacher
      notificationService.createNotification(
        assignment.teacherId,
        'Assignment Submitted',
        `${studentName} submitted "${assignment.title}"`,
        'assignment',
        assignment.id
      );

      toast.success(
        result.submittedStatus === 'late' 
          ? 'Assignment submitted (Late submission)' 
          : 'Assignment submitted successfully'
      );
      
      setSubmission(result);
      setShowDetails(false);
      setTimeout(() => handleClose(), 1500);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAttachments([]);
    setSubmission(null);
    setShowDetails(true);
    onClose();
  };

  if (!assignment) return null;

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = today > assignment.dueDate;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Assignment Details */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{assignment.courseName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{assignment.dueDate}</p>
                    {isOverdue && <Badge className="bg-red-500">Overdue</Badge>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Marks</p>
                  <p className="font-medium">{assignment.maxMarks}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{assignment.description}</p>
              </div>

              {/* Teacher's Attachments */}
              {assignment.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Course Materials</p>
                  <div className="space-y-2">
                    {assignment.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm bg-background p-2 rounded">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Status */}
          {submission && !showDetails && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={submission.submittedStatus === 'late' ? 'bg-yellow-500' : 'bg-green-500'}>
                    {submission.submittedStatus.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium">
                    Submitted on {submission.submissionDate}
                  </span>
                </div>
                {submission.grade !== undefined && (
                  <div className="pt-2 border-t border-green-200">
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className="text-lg font-bold text-green-600">{submission.grade}/{assignment.maxMarks}</p>
                    {submission.feedback && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">Feedback</p>
                        <p className="text-sm mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {showDetails && (
            <div className="space-y-3">
              <Label>Your Submission</Label>
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="file-input"
                        type="text"
                        placeholder="Enter file name or paste file content..."
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
                        <p className="text-sm font-medium">Files to Submit:</p>
                        {attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm truncate">{attachment}</span>
                            </div>
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
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {showDetails ? 'Cancel' : 'Close'}
          </Button>
          {showDetails && (
            <Button onClick={handleSubmit} disabled={isSubmitting || attachments.length === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentSubmission;
