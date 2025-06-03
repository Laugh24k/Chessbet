import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Notification({ id, type, title, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeConfig = {
    success: {
      bgColor: "bg-green-600",
      borderColor: "border-green-500",
      icon: "fas fa-check-circle",
      iconColor: "text-green-100",
    },
    error: {
      bgColor: "bg-red-600",
      borderColor: "border-red-500",
      icon: "fas fa-exclamation-circle",
      iconColor: "text-red-100",
    },
    warning: {
      bgColor: "bg-yellow-600",
      borderColor: "border-yellow-500",
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-yellow-100",
    },
    info: {
      bgColor: "bg-blue-600",
      borderColor: "border-blue-500",
      icon: "fas fa-info-circle",
      iconColor: "text-blue-100",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg max-w-sm transition-all duration-300 ${
        isVisible ? "animate-slide-up opacity-100" : "opacity-0 transform translate-y-2"
      }`}
    >
      <div className="flex items-start space-x-3">
        <i className={`${config.icon} ${config.iconColor} text-lg mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm">{title}</div>
          <div className="text-white/90 text-sm mt-1">{message}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-auto"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
        >
          <i className="fas fa-times text-xs" />
        </Button>
      </div>
    </div>
  );
}

export interface NotificationSystemProps {
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onRemove}
        />
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, "id" | "onClose">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [
      ...prev,
      { ...notification, id, onClose: removeNotification },
    ]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
