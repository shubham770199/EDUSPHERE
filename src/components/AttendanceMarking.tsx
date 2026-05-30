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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, X, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { courseService, Course } from "@/services/courseService";
import { attendanceService } from "@/services/attendanceService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Status = "present" | "absent" | "late" | "excused";
const STATUS_OPTIONS: { value: Status; label: string; icon: any; color: string }[] = [
  { value: "present", label: "Present", icon: Check, color: "bg-emerald-500" },
  { value: "absent", label: "Absent", icon: X, color: "bg-rose-500" },
  { value: "late", label: "Late", icon: Clock, color: "bg-amber-500" },
  { value: "excused", label: "Excused", icon: ShieldCheck, color: "bg-blue-500" },
];

const today = () => new Date().toISOString().split("T")[0];

const AttendanceMarking = ({ isOpen, onClose }: Props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      courseService.list().then(setCourses).catch(() => setCourses([]));
      setCourseId("");
      setMarks({});
      setDate(today());
    }
  }, [isOpen]);

  const selectedCourse = courses.find((c) => c._id === courseId);
  const students = selectedCourse?.students || [];

  // Default everyone to present when a course is chosen, and try to preload existing marks.
  useEffect(() => {
    if (!selectedCourse) return;
    const defaults: Record<string, Status> = {};
    selectedCourse.students.forEach((s) => (defaults[s._id] = "present"));
    setMarks(defaults);

    attendanceService
      .forCourse(courseId, date)
      .then((records) => {
        if (records.length) {
          const existing: Record<string, Status> = { ...defaults };
          records.forEach((r) => (existing[r.student._id] = r.status));
          setMarks(existing);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, date]);

  const setStatus = (studentId: string, status: Status) =>
    setMarks((prev) => ({ ...prev, [studentId]: status }));

  const handleSubmit = async () => {
    if (!courseId) {
      toast.error("Select a course first");
      return;
    }
    if (students.length === 0) {
      toast.error("This course has no enrolled students");
      return;
    }
    setSubmitting(true);
    try {
      const records = students.map((s) => ({ student: s._id, status: marks[s._id] || "present" }));
      await attendanceService.mark(courseId, date, records);
      toast.success("Attendance saved ✅");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = students.filter((s) => ["present", "late"].includes(marks[s._id])).length;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Mark Attendance
          </DialogTitle>
          <DialogDescription>Record attendance for a class session.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {selectedCourse && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {students.length} student{students.length !== 1 && "s"} enrolled
            </span>
            <Badge variant="outline">
              {presentCount}/{students.length} present
            </Badge>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto space-y-2">
          {students.length === 0 && selectedCourse && (
            <p className="text-sm text-muted-foreground text-center py-6">No students enrolled in this course.</p>
          )}
          {students.map((s) => (
            <div key={s._id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                {s.rollNumber && <p className="text-xs text-muted-foreground">{s.rollNumber}</p>}
              </div>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((opt) => {
                  const active = marks[s._id] === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(s._id, opt.value)}
                      title={opt.label}
                      className={`h-8 w-8 rounded-md flex items-center justify-center transition-all ${
                        active ? `${opt.color} text-white` : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !courseId}>
            {submitting ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceMarking;
