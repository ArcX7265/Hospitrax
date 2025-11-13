import React, { useState } from 'react';
import { X, Bed, Activity, Wind, Users } from 'lucide-react';

interface ResourceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: ResourceRequest) => void;
}

interface ResourceRequest {
  resourceType: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  hospital: string;
}

const ResourceRequestModal: React.FC<ResourceRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ResourceRequest>({
    resourceType: '',
    quantity: 1,
    priority: 'medium',
    description: '',
    hospital: ''
  });

  const resourceTypes = [
    { id: 'beds', label: 'Hospital Beds', icon: Bed },
    { id: 'icu', label: 'ICU Beds', icon: Activity },
    { id: 'oxygen', label: 'Oxygen Tanks', icon: Wind },
    { id: 'staff', label: 'Medical Staff', icon: Users },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that resource type is selected
    if (!formData.resourceType) {
      alert('Please select a resource type');
      return;
    }
    
    // Validate hospital name
    if (!formData.hospital.trim()) {
      alert('Please enter a hospital name');
      return;
    }
    
    onSubmit(formData);
    onClose();
    setFormData({
      resourceType: '',
      quantity: 1,
      priority: 'medium',
      description: '',
      hospital: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-semibold">Request Resource</h3>
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
              Hospital Name
            </label>
            <input
              type="text"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              className="w-full bg-dark-hover border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Resource Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {resourceTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, resourceType: type.id })}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.resourceType === type.id
                        ? 'border-gray-500 bg-gray-900 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Icon size={20} className="text-white mb-1" />
                    <div className="text-white text-sm">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full bg-dark-hover border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full bg-dark-hover border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-hover border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500 h-20 resize-none"
              placeholder="Describe the specific need..."
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
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceRequestModal;
