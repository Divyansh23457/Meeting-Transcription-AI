import React, { useState } from 'react';
import { Target, User, Calendar, CreditCard as Edit2, Trash2, Plus } from 'lucide-react';
import { ActionItem, Participant } from '../types/meeting';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  participants: Participant[];
  onUpdateActionItem: (item: ActionItem) => void;
  onDeleteActionItem: (id: string) => void;
  onAddActionItem: (item: Omit<ActionItem, 'id'>) => void;
}

export default function ActionItemsList({
  actionItems,
  participants,
  onUpdateActionItem,
  onDeleteActionItem,
  onAddActionItem
}: ActionItemsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ActionItem, 'id'>>({
    description: '',
    priority: 'medium',
    status: 'pending',
    category: 'General',
    extractedFromContext: 'Manually added'
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddItem = () => {
    if (newItem.description.trim()) {
      onAddActionItem(newItem);
      setNewItem({
        description: '',
        priority: 'medium',
        status: 'pending',
        category: 'General',
        extractedFromContext: 'Manually added'
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Action Items ({actionItems.length})
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>
      </div>

      <div className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Add New Action Item</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter action item description..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-3">
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={newItem.assignedTo?.id || ''}
                  onChange={(e) => {
                    const participant = participants.find(p => p.id === e.target.value);
                    setNewItem({ ...newItem, assignedTo: participant });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {participants.map(participant => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {actionItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No action items extracted yet. Upload and process a meeting to get started.</p>
            </div>
          ) : (
            actionItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      {item.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-900 font-medium mb-2">{item.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {item.assignedTo && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {item.assignedTo.name}
                        </div>
                      )}
                      {item.deadline && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {item.deadline}
                        </div>
                      )}
                    </div>

                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer">Context</summary>
                      <p className="text-xs text-gray-500 mt-1 italic">{item.extractedFromContext}</p>
                    </details>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteActionItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}