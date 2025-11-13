import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import OverviewCards from './OverviewCards';
import PerformanceChart from './PerformanceChart';
import ResourceChart from './ResourceChart';
import ResourceTable from './ResourceTable';
import ResourceRequestModal from './ResourceRequestModal';
import EmergencyAlert from './EmergencyAlert';
import NotificationCenter from './NotificationCenter';
import DoctorAdminPanel from './DoctorAdminPanel';
import NotificationBanner from './NotificationBanner';
import ReportsDashboard from './ReportsDashboard';
import PatientAnalytics from './PatientAnalytics';
import HumanBodyAnalytics from './HumanBodyAnalytics';
import AppointmentBooking from './AppointmentBooking';
import { Plus, AlertTriangle } from 'lucide-react';
import { Notification, NotificationPriority } from '../types/notifications';
import NotificationService from '../services/NotificationService';

interface DashboardProps {
  role?: 'patient' | 'doctor';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [, setNotifications] = useState<Notification[]>([]);
  const [activeBanners, setActiveBanners] = useState<Notification[]>([]);
  const notificationService = NotificationService.getInstance();

  const handleResourceRequest = async (request: any) => {
    console.log('Resource request submitted:', request);
    
    try {
      // Import ResourceService to update the resource table
      const ResourceService = (await import('../services/ResourceService')).default;
      const resourceService = ResourceService.getInstance();
      
      // Update the resource service IMMEDIATELY (synchronous)
      resourceService.addOrUpdateResource({
        hospital: request.hospital,
        resourceType: request.resourceType,
        quantity: -request.quantity, // Negative to indicate it's a request/need
        note: `Request: ${request.description || 'No description'}`,
      });
      
      // Create notification IMMEDIATELY (fire and forget for instant delivery)
      notificationService.createResourceRequest({
        hospital: request.hospital,
        resourceType: request.resourceType,
        quantity: request.quantity,
        priority: request.priority,
        description: request.description || '',
      }).catch(error => {
        console.error('Error creating notification:', error);
      });
    } catch (error) {
      console.error('Error handling resource request:', error);
      // Show error to user if possible
      alert('Failed to submit resource request. Please try again.');
    }
  };

  const handleEmergencyAlert = async (alert: any) => {
    console.log('Emergency alert sent:', alert);
    
    try {
      // Build detailed message with all alert information
      const severityLabels: Record<string, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      };
      
      const typeLabels: Record<string, string> = {
        medical: 'Medical Emergency',
        equipment: 'Equipment Failure',
        staff: 'Staff Shortage',
        other: 'Other Emergency'
      };
      
      const severityLabel = severityLabels[alert.severity] || alert.severity;
      const typeLabel = typeLabels[alert.type] || alert.type;
      
      // Create detailed message
      let message = `${typeLabel} - ${severityLabel} Priority\n\n`;
      if (alert.description) {
        message += `Description: ${alert.description}\n`;
      }
      if (alert.location) {
        message += `Location: ${alert.location}\n`;
      }
      if (alert.contact) {
        message += `Contact: ${alert.contact}\n`;
      }
      
      // Create emergency notification IMMEDIATELY (fire and forget for instant delivery)
      notificationService.createEmergencyAlert(
        message.trim(),
        alert.location,
        alert.severity,
        alert.type,
        alert.contact
      ).catch(error => {
        console.error('Error creating emergency notification:', error);
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      alert('Failed to send emergency alert. Please try again.');
    }
  };

  // Initialize notification service
  useEffect(() => {
    notificationService.loadSettings();
    
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      
      // Show banners for high priority notifications
      const highPriorityNotifications = newNotifications.filter(
        n => !n.isRead && (n.priority === NotificationPriority.CRITICAL || n.priority === NotificationPriority.URGENT)
      );
      setActiveBanners(highPriorityNotifications);
    });

    return unsubscribe;
  }, [notificationService]);

  const handleBannerDismiss = (notificationId: string) => {
    setActiveBanners(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleBannerAction = (notification: Notification) => {
    if (notification.actionUrl) {
      // Navigate to the action URL
      console.log('Navigating to:', notification.actionUrl);
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg dark:bg-dark-bg bg-gray-50 text-white dark:text-white text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      
      <div className="w-px bg-gray-700 dark:bg-gray-700 bg-gray-200"></div>
      
      <div className="flex-1 flex flex-col">
        <Header currentSection={activeTab} role={role} />
        
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'notifications' ? (
            <NotificationCenter canSend={role === 'doctor'} />
          ) : activeTab === 'reports' ? (
            <ReportsDashboard />
          ) : activeTab === 'analytics' ? (
            role === 'patient' ? (
              <div className="space-y-6">
                <HumanBodyAnalytics />
                <PatientAnalytics />
              </div>
            ) : (
              <div className="p-6">
                <div className="bg-dark-card rounded-lg p-6 border border-gray-700 text-gray-300">
                  Analytics will be available here.
                </div>
              </div>
            )
          ) : activeTab === 'appointments' ? (
            <div className="p-6 space-y-6">
              {role === 'patient' ? (
                <AppointmentBooking />
              ) : (
                <div className="bg-dark-card rounded-lg p-6 border border-gray-700 text-gray-300">
                  Admins can view appointments in Reports for now.
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mb-6">
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>Request Resource</span>
                </button>
                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle size={20} />
                  <span>Emergency Alert</span>
                </button>
              </div>

              <div className="space-y-6">
                {role === 'doctor' && (
                  <DoctorAdminPanel />
                )}
                {/* Overview Cards */}
                <OverviewCards />
                
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PerformanceChart />
                  <ResourceChart />
                </div>
                
                {/* Resource Table */}
                <ResourceTable />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Notification Banners */}
      {activeBanners.map((notification) => (
        <NotificationBanner
          key={notification.id}
          notification={notification}
          onDismiss={handleBannerDismiss}
          onAction={handleBannerAction}
        />
      ))}

      {/* Modals */}
      <ResourceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleResourceRequest}
      />
      <EmergencyAlert
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSubmit={handleEmergencyAlert}
      />
    </div>
  );
};

export default Dashboard;
