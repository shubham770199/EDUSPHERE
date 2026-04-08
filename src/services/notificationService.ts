import axios from "axios";

export const getNotifications = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const res = await axios.get(`${apiUrl}/api/notifications`);
  return res.data;
};

class NotificationService {
  // We'll store a mock list locally since the backend only has a simple get/post right now
  private localNotifications = [
    {
      id: "1",
      title: "Welcome!",
      message: "Welcome to EduSphere.",
      type: "info" as const,
      read: false,
      createdAt: new Date().toISOString()
    }
  ];

  getUserNotifications(userId: string) {
    return this.localNotifications;
  }

  markAsRead(id: string) {
    const notification = this.localNotifications.find(n => n.id === id);
    if(notification) notification.read = true;
  }

  markAllAsRead(userId: string) {
    this.localNotifications.forEach(n => n.read = true);
  }

  deleteNotification(id: string) {
    this.localNotifications = this.localNotifications.filter(n => n.id !== id);
  }

  sendNotification(message: string) {
    console.log("Notification:", message);
  }
}

export const notificationService = new NotificationService();