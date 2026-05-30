import { useState, useEffect, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { courseService, Course } from "@/services/courseService";
import { lectureService } from "@/services/lectureService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: () => void;
}

const fmtSize = (b: number) => (b > 1e9 ? (b / 1e9).toFixed(2) + " GB" : (b / 1e6).toFixed(1) + " MB");

const LectureUpload = ({ isOpen, onClose, onUploaded }: Props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      courseService.list().then(setCourses).catch(() => setCourses([]));
      setCourseId("");
      setTitle("");
      setDescription("");
      setFile(null);
      setProgress(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !file) {
      toast.error("Course, title and a video file are required");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      await lectureService.upload(
        { title, description, course: courseId, file },
        (p) => setProgress(p)
      );
      toast.success("Lecture uploaded ✅ Students have been notified.");
      onUploaded?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && !uploading && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" /> Upload Recorded Lecture
          </DialogTitle>
          <DialogDescription>Upload a video to one of your courses (stored on AWS S3).</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId} disabled={uploading}>
              <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.code} — {c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lecture 1 — Introduction" disabled={uploading} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this lecture cover?" disabled={uploading} />
          </div>

          <div className="space-y-2">
            <Label>Video File</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => !uploading && fileRef.current?.click()}
            >
              <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              {file ? (
                <p className="text-sm font-medium">{file.name} <span className="text-muted-foreground">({fmtSize(file.size)})</span></p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to choose a video (MP4, WebM, MOV…) — up to 500 MB</p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {uploading && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Uploading… {progress}%</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload Lecture"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LectureUpload;
