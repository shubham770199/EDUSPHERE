import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Film, Play, Trash2, Loader2, Upload, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import NotificationCenter from "@/components/NotificationCenter";
import VideoPlayer from "@/components/VideoPlayer";
import LectureUpload from "@/components/LectureUpload";
import { toast } from "sonner";
import { lectureService, Lecture } from "@/services/lectureService";

const fmtSize = (b: number) => (!b ? "" : b > 1e9 ? (b / 1e9).toFixed(2) + " GB" : (b / 1e6).toFixed(0) + " MB");

const Lectures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.role === "teacher" || user?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [playing, setPlaying] = useState<Lecture | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = async () => {
    try {
      setLectures(await lectureService.list());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = async (lec: Lecture) => {
    // Re-fetch to get a fresh signed URL (and count the view for students).
    try {
      const fresh = await lectureService.get(lec._id);
      setPlaying(fresh);
    } catch {
      setPlaying(lec);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lecture? The video will be removed from storage.")) return;
    try {
      await lectureService.remove(id);
      toast.success("Lecture deleted");
      setLectures((prev) => prev.filter((l) => l._id !== id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur shadow-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/${user?.role}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Film className="h-6 w-6 text-primary" /> Recorded Lectures
              </h1>
              <p className="text-sm text-muted-foreground">
                {isStaff ? "Upload and manage lecture videos" : "Watch your course lectures anytime"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStaff && (
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload Lecture
              </Button>
            )}
            <NotificationCenter />
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : lectures.length === 0 ? (
          <div className="text-center py-20">
            <Film className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {isStaff ? "No lectures uploaded yet — click \"Upload Lecture\" to add one." : "No lectures available for your courses yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lec) => (
              <Card key={lec._id} className="shadow-card hover:shadow-elevated transition-all overflow-hidden group">
                {/* Thumbnail / play area */}
                <button
                  onClick={() => play(lec)}
                  className="relative w-full aspect-video flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${lec.course?.color || "#6366f1"}, #1e1b4b)` }}
                >
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 fill-white" />
                  </div>
                  <Badge className="absolute top-2 left-2 bg-black/50 border-0">{lec.course?.code}</Badge>
                </button>

                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{lec.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
                    {lec.description || "No description."}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {lec.views}</span>
                      {lec.size ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtSize(lec.size)}</span> : null}
                    </span>
                    <span>{lec.teacher?.name}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1" onClick={() => play(lec)}>
                      <Play className="h-4 w-4 mr-1" /> Watch
                    </Button>
                    {isStaff && (
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => remove(lec._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <VideoPlayer isOpen={!!playing} onClose={() => setPlaying(null)} lecture={playing} />
      <LectureUpload isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={load} />
    </div>
  );
};

export default Lectures;
