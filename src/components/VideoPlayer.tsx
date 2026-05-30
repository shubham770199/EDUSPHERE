import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lecture } from "@/services/lectureService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
}

const VideoPlayer = ({ isOpen, onClose, lecture }: Props) => {
  if (!lecture) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>{lecture.title}</DialogTitle>
          <DialogDescription>
            {lecture.course?.code} — {lecture.course?.title} • {lecture.teacher?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-black">
          {lecture.videoUrl ? (
            <video
              key={lecture._id}
              src={lecture.videoUrl}
              controls
              autoPlay
              className="w-full max-h-[70vh] aspect-video bg-black"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="aspect-video flex items-center justify-center text-white/70 text-sm">
              Video unavailable. The playback link may have expired — please refresh.
            </div>
          )}
        </div>

        {lecture.description && (
          <div className="p-4 pt-3">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lecture.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;
