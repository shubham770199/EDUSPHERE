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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { submissionService, Submission } from "@/services/submissionService";
import { Assignment } from "@/services/assignmentService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onGraded?: () => void;
}

const GradeSubmissions = ({ isOpen, onClose, assignment, onGraded }: Props) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});

  useEffect(() => {
    if (isOpen && assignment) {
      setLoading(true);
      submissionService
        .forAssignment(assignment._id)
        .then((subs) => {
          setSubmissions(subs);
          const d: Record<string, { grade: string; feedback: string }> = {};
          subs.forEach((s) => {
            d[s._id] = { grade: s.grade != null ? String(s.grade) : "", feedback: s.feedback || "" };
          });
          setDrafts(d);
        })
        .catch(() => setSubmissions([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, assignment]);

  if (!assignment) return null;

  const saveGrade = async (sub: Submission) => {
    const draft = drafts[sub._id];
    const grade = Number(draft?.grade);
    if (draft?.grade === "" || isNaN(grade)) {
      toast.error("Enter a numeric grade");
      return;
    }
    if (grade < 0 || grade > assignment.maxMarks) {
      toast.error(`Grade must be between 0 and ${assignment.maxMarks}`);
      return;
    }
    try {
      const updated = await submissionService.grade(sub._id, grade, draft.feedback);
      setSubmissions((prev) => prev.map((s) => (s._id === sub._id ? { ...s, ...updated } : s)));
      toast.success(`Graded ${sub.student.name}`);
      onGraded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to grade");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Grade: {assignment.title}</DialogTitle>
          <DialogDescription>
            {submissions.length} submission{submissions.length !== 1 && "s"} • Max {assignment.maxMarks} marks
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No submissions yet.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {submissions.map((sub) => (
              <div key={sub._id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{sub.student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.student.rollNumber || sub.student.email} •{" "}
                      {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={sub.status === "graded" ? "default" : sub.status === "late" ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    {sub.status}
                  </Badge>
                </div>

                {sub.content && (
                  <div className="rounded bg-muted/40 p-2 text-sm whitespace-pre-wrap">{sub.content}</div>
                )}

                <div className="flex gap-2 items-end">
                  <div className="w-24">
                    <label className="text-xs text-muted-foreground">Grade</label>
                    <Input
                      type="number"
                      min={0}
                      max={assignment.maxMarks}
                      value={drafts[sub._id]?.grade ?? ""}
                      onChange={(e) =>
                        setDrafts((p) => ({ ...p, [sub._id]: { ...p[sub._id], grade: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Feedback</label>
                    <Textarea
                      rows={1}
                      value={drafts[sub._id]?.feedback ?? ""}
                      onChange={(e) =>
                        setDrafts((p) => ({ ...p, [sub._id]: { ...p[sub._id], feedback: e.target.value } }))
                      }
                      placeholder="Optional feedback..."
                    />
                  </div>
                  <Button size="sm" onClick={() => saveGrade(sub)}>
                    {sub.status === "graded" ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GradeSubmissions;
