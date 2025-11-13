import React, { useState } from 'react';
import { AlertTriangle, X, Phone, MapPin } from 'lucide-react';

interface EmergencyAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: EmergencyAlertData) => void;
}

interface EmergencyAlertData {
  type: 'medical' | 'equipment' | 'staff' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  contact: string;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<EmergencyAlertData>({
    type: 'medical',
    severity: 'medium',
    description: '',
    location: '',
    contact: ''
  });

  const emergencyTypes = [
    { id: 'medical', label: 'Medical Emergency', color: 'text-red-400' },
    { id: 'equipment', label: 'Equipment Failure', color: 'text-orange-400' },
    { id: 'staff', label: 'Staff Shortage', color: 'text-yellow-400' },
    { id: 'other', label: 'Other', color: 'text-gray-400' },
  ];

  const severityLevels = [
    { id: 'low', label: 'Low', color: 'bg-green-500' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { id: 'high', label: 'High', color: 'bg-orange-500' },
    { id: 'critical', label: 'Critical', color: 'bg-red-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }
    
    if (!formData.contact.trim()) {
      alert('Please enter contact information');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description of the emergency');
      return;
    }
    
    onSubmit(formData);
    onClose();
    setFormData({
      type: 'medical',
      severity: 'medium',
      description: '',
      location: '',
      contact: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={24} className="text-red-400" />
            <h3 className="text-white text-xl font-semibold">Emergency Alert</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Emergency Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {emergencyTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.id as any })}
                  className={`p-3 rounded-lg border transition-colors ${
                    formData.type === type.id
                      ? 'border-red-500 bg-red-900 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className={`text-sm font-medium ${type.color}`}>
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Severity Level
            </label>
            <div className="flex space-x-2">
              {severityLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: level.id as any })}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                    formData.severity === level.id
                      ? `${level.color} opacity-100`
                      : `${level.color} opacity-50 hover:opacity-75`
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-dark-hover border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="Hospital name or address"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Contact Information
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full bg-dark-hover border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-red-500"
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-hover border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 h-24 resize-none"
              placeholder="Describe the emergency situation..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <AlertTriangle size={16} />
              <span>Send Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyAlert;
