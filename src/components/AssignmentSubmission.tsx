import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import { submissionService } from "@/services/submissionService";
import { Assignment } from "@/services/assignmentService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSubmitted?: () => void;
}

const AssignmentSubmission = ({ isOpen, onClose, assignment, onSubmitted }: Props) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setContent("");
  }, [isOpen, assignment]);

  if (!assignment) return null;

  const isGraded = assignment.submissionStatus === "graded";
  const overdue = new Date() > new Date(assignment.dueDate);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please add some text or notes for your submission");
      return;
    }
    setSubmitting(true);
    try {
      await submissionService.submit({ assignmentId: assignment._id, content });
      toast.success(overdue ? "Submitted (marked late) ⏰" : "Assignment submitted ✅");
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>{assignment.course?.code} — {assignment.course?.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{assignment.description || "No description provided."}</p>

          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" /> Due {new Date(assignment.dueDate).toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Award className="h-3 w-3" /> {assignment.maxMarks} marks
            </Badge>
            <Badge
              variant={isGraded ? "default" : assignment.submissionStatus === "pending" ? "secondary" : "outline"}
              className="capitalize"
            >
              {assignment.submissionStatus || "pending"}
            </Badge>
          </div>

          {isGraded ? (
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-semibold">Graded</p>
              <p className="text-2xl font-bold text-primary">
                {assignment.grade}/{assignment.maxMarks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This submission has been graded and can no longer be changed.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Your submission</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your answer, paste a link to your work, or add notes for your teacher..."
                  rows={5}
                />
              </div>
              {overdue && (
                <p className="text-xs text-amber-600">
                  ⚠️ The due date has passed — your submission will be marked as <strong>late</strong>.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  <Send className="h-4 w-4 mr-1" />
                  {submitting ? "Submitting..." : assignment.submissionStatus === "pending" ? "Submit" : "Resubmit"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentSubmission;
