import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, X, Info, AlertCircle, CheckCircle, FileText, Calendar, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService, NotificationItem } from "@/services/notificationService";

const formatTime = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

const NotificationCenter = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.list();
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch {
      /* ignore */
    }
  }, [isAuthenticated]);

  // Initial load + light polling so new notifications appear during a demo.
  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const markAsRead = async (id: string) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const remove = async (id: string) => {
    const wasUnread = notifications.find((n) => n._id === id && !n.read);
    await notificationService.remove(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnread((u) => Math.max(0, u - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
      case "grade":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "assignment":
        return <FileText className="h-4 w-4 text-primary" />;
      case "attendance":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6 px-2">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n._id}
                className="flex-col items-start gap-2 p-3 cursor-pointer"
                onClick={() => !n.read && markAsRead(n._id)}
              >
                <div className="flex w-full items-start gap-2">
                  {getIcon(n.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(n._id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1" />}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
