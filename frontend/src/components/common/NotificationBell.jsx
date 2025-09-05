import React, { useState } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../../contexts/AuthContext';
import {
  useNotifications,
  useUnreadNotifications,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useClearAllNotifications
} from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

const NotificationBell = ({ className = "" }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useNotifications();
  const { data: unreadNotifications = [] } = useUnreadNotifications();

  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearAllNotificationsMutation = useClearAllNotifications();

  const unreadCount = unreadNotifications.length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'validation_requise': return <Check className="w-4 h-4 text-orange-500" />;
      case 'demande_approuvee': return <Check className="w-4 h-4 text-green-500" />;
      case 'demande_rejetee': return <X className="w-4 h-4 text-red-500" />;
      case 'stock_alerte': return <Bell className="w-4 h-4 text-orange-500" />;
      case 'stock_rupture': return <Bell className="w-4 h-4 text-red-500" />;
      case 'livraison': return <Check className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;

    return date.toLocaleDateString('fr-FR');
  };

  // ✅ Marquer toutes les notifications comme lues à l’ouverture
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      markAllAsReadMutation.mutate(null, {
        onSuccess: () => {
          queryClient.setQueryData(['notifications'], (old = []) =>
            old.map(n => ({ ...n, read_at: new Date().toISOString() }))
          );
          queryClient.invalidateQueries(['unreadNotifications']);
        }
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative w-9 h-9 ${className}`}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAllNotificationsMutation.mutate()}
                className="text-red-500 hover:text-red-700 flex items-center"
                aria-label="Tout supprimer"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Tout supprimer
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start justify-between p-4 transition-colors hover:bg-muted/50 ${!notification.read_at ? "bg-muted/20 border-l-4 border-l-blue-500" : ""
                        }`}
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className={`text-sm font-medium ${!notification.read_at ? "text-foreground" : "text-muted-foreground"}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.data.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Supprimer la notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
