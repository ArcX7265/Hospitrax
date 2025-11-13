import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationCategory,
  DeliveryChannel, 
  NotificationSettings 
} from '../types/notifications';

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings;
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
    this.loadNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      userId: 'user-123',
      channels: {
        [DeliveryChannel.IN_APP]: true,
        [DeliveryChannel.PUSH]: true,
        [DeliveryChannel.EMAIL]: false,
        [DeliveryChannel.SMS]: false,
      },
      categories: {
        [NotificationCategory.APPOINTMENTS]: true,
        [NotificationCategory.RESOURCES]: true,
        [NotificationCategory.EMERGENCY]: true,
        [NotificationCategory.STAFF]: true,
        [NotificationCategory.AI_INSIGHTS]: true,
        [NotificationCategory.PATIENT_COMMUNICATION]: true,
        [NotificationCategory.ADMINISTRATIVE]: false,
        [NotificationCategory.SYSTEM]: true,
      },
      priorities: {
        [NotificationPriority.CRITICAL]: true,
        [NotificationPriority.URGENT]: true,
        [NotificationPriority.HIGH]: true,
        [NotificationPriority.MEDIUM]: true,
        [NotificationPriority.LOW]: false,
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
        timezone: 'UTC-5',
      },
      emailDigest: {
        enabled: true,
        frequency: 'daily',
      },
    };
  }

  // Subscribe to notification updates
  public subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(notifications: Notification[]) {
    this.listeners.forEach(listener => listener(notifications));
  }

  // Create and send a notification
  public async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
    };

    // Store in in-app list IMMEDIATELY if IN_APP is among delivery channels (for instant visibility)
    if (newNotification.deliveryChannels.includes(DeliveryChannel.IN_APP)) {
      this.notifications = [newNotification, ...this.notifications];
      // Broadcast to all subscribers IMMEDIATELY (before sending to other channels)
      this.notifyListeners(this.notifications);
      // Save to localStorage (non-blocking)
      this.saveNotifications();
    }

    // Send to other channels asynchronously (don't wait)
    if (this.shouldSendNotification(newNotification)) {
      // Fire and forget - don't block on sending
      this.sendNotification(newNotification).catch(error => {
        console.error('Error sending notification:', error);
      });
    }

    return newNotification;
  }

  // Check if notification should be sent based on user settings
  private shouldSendNotification(notification: Notification): boolean {
    // Emergency, urgent, and critical notifications always bypass settings
    if (notification.priority === NotificationPriority.CRITICAL || 
        notification.priority === NotificationPriority.URGENT ||
        notification.category === NotificationCategory.EMERGENCY) {
      return true;
    }

    // Check if category is enabled
    if (!this.settings.categories[notification.category as keyof typeof this.settings.categories]) {
      return false;
    }

    // Check if priority is enabled
    if (!this.settings.priorities[notification.priority as keyof typeof this.settings.priorities]) {
      return false;
    }

    // Check quiet hours (critical and urgent already bypassed above)
    if (this.isInQuietHours()) {
      return false;
    }

    return true;
  }

  // Check if current time is within quiet hours
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const { start, end } = this.settings.quietHours;

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }

  // Send notification through appropriate channels
  private async sendNotification(notification: Notification): Promise<void> {
    const promises = notification.deliveryChannels.map(channel => {
      if (this.settings.channels[channel]) {
        return this.sendToChannel(notification, channel);
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
  }

  // Send notification to specific channel
  private async sendToChannel(notification: Notification, channel: DeliveryChannel): Promise<void> {
    switch (channel) {
      case DeliveryChannel.IN_APP:
        await this.sendInAppNotification(notification);
        break;
      case DeliveryChannel.PUSH:
        await this.sendPushNotification(notification);
        break;
      case DeliveryChannel.EMAIL:
        await this.sendEmailNotification(notification);
        break;
      case DeliveryChannel.SMS:
        await this.sendSMSNotification(notification);
        break;
    }
  }

  // Send in-app notification
  private async sendInAppNotification(notification: Notification): Promise<void> {
    // In a real app, this would update the UI state
    console.log('In-app notification:', notification);
    
    // No delay - instant delivery
    return Promise.resolve();
  }

  // Send push notification
  private async sendPushNotification(notification: Notification): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: notification.id,
          data: notification,
          requireInteraction: notification.priority === NotificationPriority.CRITICAL,
          actions: notification.actionUrl ? [
            {
              action: 'view',
              title: 'View Details',
              icon: '/view-icon.png'
            }
          ] : []
        });
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  // Send email notification
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // In a real app, this would call your email service
    console.log('Email notification:', notification);
    
    // Send immediately (in production, this would be a real API call)
    return Promise.resolve();
  }

  // Send SMS notification
  private async sendSMSNotification(notification: Notification): Promise<void> {
    // In a real app, this would call your SMS service (Twilio, etc.)
    console.log('SMS notification:', notification);
    
    // Send immediately (in production, this would be a real API call)
    return Promise.resolve();
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Public notifications API used by UI
  public getNotifications(): Notification[] {
    return this.notifications;
  }

  // Mark as read helpers
  public markAsRead(id: string): void {
    this.notifications = this.notifications.map(n => (
      n.id === id ? { ...n, isRead: true } : n
    ));
    this.saveNotifications();
    this.notifyListeners(this.notifications);
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.saveNotifications();
    this.notifyListeners(this.notifications);
  }

  // Update notification settings
  public updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    // In a real app, save to backend
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  // Get current settings
  public getSettings(): NotificationSettings {
    return this.settings;
  }

  // Load settings from storage
  public loadSettings(): void {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    try {
      const serialized = this.notifications.map(notif => ({
        ...notif,
        timestamp: notif.timestamp.toISOString(),
        expiresAt: notif.expiresAt ? notif.expiresAt.toISOString() : undefined,
      }));
      localStorage.setItem('notifications', JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = new Date();
        this.notifications = parsed
          .map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp),
            expiresAt: notif.expiresAt ? new Date(notif.expiresAt) : undefined,
          }))
          .filter((notif: Notification) => {
            // Remove expired notifications
            if (notif.expiresAt && notif.expiresAt < now) {
              return false;
            }
            // Keep notifications from last 30 days
            const daysSince = (now.getTime() - notif.timestamp.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 30;
          });
        
        // Save cleaned notifications back
        if (this.notifications.length !== parsed.length) {
          this.saveNotifications();
        }
        
        // Notify listeners with loaded notifications
        this.notifyListeners(this.notifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  // Clear old notifications (optional utility method)
  public clearOldNotifications(daysToKeep: number = 30): void {
    const now = new Date();
    const cutoffTime = now.getTime() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    this.notifications = this.notifications.filter(notif => {
      // Keep if not expired and within cutoff time
      if (notif.expiresAt && notif.expiresAt < now) {
        return false;
      }
      return notif.timestamp.getTime() >= cutoffTime;
    });
    
    this.saveNotifications();
    this.notifyListeners(this.notifications);
  }

  // Create specific notification types
  public async createEmergencyAlert(message: string, location?: string, severity?: string, type?: string, contact?: string): Promise<Notification> {
    // Determine priority based on severity if provided
    let priority = NotificationPriority.CRITICAL;
    if (severity) {
      switch (severity.toLowerCase()) {
        case 'low':
          priority = NotificationPriority.LOW;
          break;
        case 'medium':
          priority = NotificationPriority.MEDIUM;
          break;
        case 'high':
          priority = NotificationPriority.HIGH;
          break;
        case 'urgent':
          priority = NotificationPriority.URGENT;
          break;
        case 'critical':
        default:
          priority = NotificationPriority.CRITICAL;
          break;
      }
    }
    
    return this.createNotification({
      type: NotificationType.EMERGENCY_CODE_BLUE,
      title: '🚨 Emergency Alert',
      message,
      isRead: false,
      priority,
      category: NotificationCategory.EMERGENCY,
      deliveryChannels: [DeliveryChannel.IN_APP, DeliveryChannel.PUSH, DeliveryChannel.SMS],
      metadata: { location, severity, type, contact },
    });
  }

  public async createResourceAlert(resource: string, status: string): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.RESOURCE_SHORTAGE,
      title: 'Resource Alert',
      message: `${resource}: ${status}`,
      isRead: false,
      priority: NotificationPriority.HIGH,
      category: NotificationCategory.RESOURCES,
      deliveryChannels: [DeliveryChannel.IN_APP, DeliveryChannel.PUSH],
    });
  }

  public async createResourceRequest(request: {
    hospital: string;
    resourceType: string;
    quantity: number;
    priority: string;
    description: string;
  }): Promise<Notification> {
    // Map priority to notification priority
    let notificationPriority = NotificationPriority.MEDIUM;
    switch (request.priority.toLowerCase()) {
      case 'low':
        notificationPriority = NotificationPriority.LOW;
        break;
      case 'medium':
        notificationPriority = NotificationPriority.MEDIUM;
        break;
      case 'high':
        notificationPriority = NotificationPriority.HIGH;
        break;
      case 'urgent':
        notificationPriority = NotificationPriority.URGENT;
        break;
    }

    // Format resource type label
    const resourceLabels: Record<string, string> = {
      beds: 'Hospital Beds',
      icu: 'ICU Beds',
      oxygen: 'Oxygen Tanks',
      staff: 'Medical Staff',
    };
    const resourceLabel = resourceLabels[request.resourceType] || request.resourceType;

    // Build detailed message
    let message = `New resource request from patient:\n\n`;
    message += `Hospital: ${request.hospital}\n`;
    message += `Resource: ${resourceLabel}\n`;
    message += `Quantity: ${request.quantity}\n`;
    message += `Priority: ${request.priority.toUpperCase()}\n`;
    if (request.description) {
      message += `Description: ${request.description}`;
    }

    return this.createNotification({
      type: NotificationType.RESOURCE_SHORTAGE,
      title: '📋 New Resource Request',
      message: message.trim(),
      isRead: false,
      priority: notificationPriority,
      category: NotificationCategory.RESOURCES,
      deliveryChannels: [DeliveryChannel.IN_APP, DeliveryChannel.PUSH],
      metadata: { ...request, resourceLabel, isRequest: true },
    });
  }

  public async createAppointmentReminder(patientName: string, time: string): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Appointment Reminder',
      message: `${patientName} has an appointment at ${time}`,
      isRead: false,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.APPOINTMENTS,
      deliveryChannels: [DeliveryChannel.IN_APP, DeliveryChannel.PUSH],
    });
  }

  public async createAIInsight(insight: string, confidence: number): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.AI_RESOURCE_SURGE,
      title: 'AI Insight',
      message: `${insight} (Confidence: ${confidence}%)`,
      isRead: false,
      priority: NotificationPriority.MEDIUM,
      category: NotificationCategory.AI_INSIGHTS,
      deliveryChannels: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
    });
  }
}

export default NotificationService;
