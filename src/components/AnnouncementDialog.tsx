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
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { announcementService } from "@/services/announcementService";
import { courseService, Course } from "@/services/courseService";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const AnnouncementDialog = ({ isOpen, onClose, onCreated }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [priority, setPriority] = useState("normal");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setMessage("");
      setAudience("all");
      setPriority("normal");
      setCourse("");
      courseService.list().then(setCourses).catch(() => setCourses([]));
    }
  }, [isOpen]);

  // Teachers typically address everyone or a specific course.
  const audienceOptions =
    user?.role === "admin"
      ? [
          { v: "all", l: "Everyone" },
          { v: "students", l: "All Students" },
          { v: "teachers", l: "All Teachers" },
          { v: "course", l: "A Specific Course" },
        ]
      : [
          { v: "all", l: "Everyone" },
          { v: "course", l: "A Specific Course" },
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Title and message are required");
      return;
    }
    if (audience === "course" && !course) {
      toast.error("Select a course for a course-specific announcement");
      return;
    }
    setSubmitting(true);
    try {
      await announcementService.create({
        title,
        message,
        audience,
        priority,
        course: audience === "course" ? course : undefined,
      });
      toast.success("Announcement posted 📢");
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> New Announcement
          </DialogTitle>
          <DialogDescription>Broadcast a message — recipients are also notified.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Write your message..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((o) => (
                    <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {audience === "course" && (
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.code} — {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementDialog;
