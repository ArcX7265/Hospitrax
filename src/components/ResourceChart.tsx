import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Percent } from 'lucide-react';

const ResourceChart: React.FC = () => {
  const data = [
    { name: 'Available', value: 82.4, color: '#FFFFFF' },
    { name: 'In Use', value: 17.5, color: '#6B7280' },
  ];

  // Removed unused custom label to satisfy linter

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Percent size={20} className="text-gray-400" />
          <h3 className="text-white text-lg font-semibold">Resource Availability</h3>
        </div>
      </div>

      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#2d2d2d',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="text-gray-400 text-sm">Available Resources</span>
          </div>
          <span className="text-white font-semibold">2,987</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">In Use</span>
          </div>
          <span className="text-white font-semibold">635</span>
        </div>
      </div>
    </div>
  );
};

export default ResourceChart;
