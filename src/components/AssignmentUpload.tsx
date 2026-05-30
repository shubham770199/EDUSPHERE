import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { courseService, Course } from "@/services/courseService";
import { assignmentService } from "@/services/assignmentService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const AssignmentUpload = ({ isOpen, onClose, onCreated }: Props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      courseService.list().then(setCourses).catch(() => setCourses([]));
    }
  }, [isOpen]);

  const reset = () => {
    setCourseId("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setMaxMarks(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !dueDate) {
      toast.error("Please fill in course, title and due date");
      return;
    }
    setSubmitting(true);
    try {
      await assignmentService.create({ course: courseId, title, description, dueDate, maxMarks });
      toast.success("Assignment created and students notified ✅");
      reset();
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Create Assignment
          </DialogTitle>
          <DialogDescription>Post a new assignment to one of your courses.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No courses found</div>
                )}
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Binary Tree Implementation" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions and guidelines..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Max Marks</Label>
              <Input
                type="number"
                min={1}
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentUpload;
