import React from 'react';
import { Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { ActionItem, Participant } from '../types/meeting';

interface ExportOptionsProps {
  actionItems: ActionItem[];
  participants: Participant[];
  meetingTitle: string;
}

export default function ExportOptions({ actionItems, participants, meetingTitle }: ExportOptionsProps) {
  const generateCSV = () => {
    const headers = ['Description', 'Assigned To', 'Priority', 'Status', 'Category', 'Deadline', 'Context'];
    const rows = actionItems.map(item => [
      item.description,
      item.assignedTo?.name || 'Unassigned',
      item.priority,
      item.status,
      item.category,
      item.deadline || '',
      item.extractedFromContext
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_action_items.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateJSON = () => {
    const data = {
      meeting: {
        title: meetingTitle,
        date: new Date().toISOString(),
        participants,
        actionItems
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_action_items.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateWordDocument = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 30px; }
          .action-item { margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .priority-high { border-left: 4px solid #dc3545; }
          .priority-medium { border-left: 4px solid #ffc107; }
          .priority-low { border-left: 4px solid #28a745; }
          .meta { font-size: 12px; color: #666; margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>Meeting Action Items: ${meetingTitle}</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Action Items:</strong> ${actionItems.length}</p>
        
        <h2>Participants</h2>
        <ul>
          ${participants.map(p => `<li>${p.name}${p.email ? ` (${p.email})` : ''}${p.role ? ` - ${p.role}` : ''}</li>`).join('')}
        </ul>
        
        <h2>Action Items</h2>
        ${actionItems.map(item => `
          <div class="action-item priority-${item.priority}">
            <h3>${item.description}</h3>
            <div class="meta">
              <strong>Assigned to:</strong> ${item.assignedTo?.name || 'Unassigned'}<br>
              <strong>Priority:</strong> ${item.priority}<br>
              <strong>Status:</strong> ${item.status}<br>
              <strong>Category:</strong> ${item.category}<br>
              ${item.deadline ? `<strong>Deadline:</strong> ${item.deadline}<br>` : ''}
              <strong>Context:</strong> ${item.extractedFromContext}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_action_items.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      type: 'csv',
      label: 'CSV Spreadsheet',
      description: 'For Excel, Google Sheets, or other spreadsheet applications',
      icon: FileSpreadsheet,
      action: generateCSV
    },
    {
      type: 'html',
      label: 'Word Document',
      description: 'Formatted document with all action items and details',
      icon: FileText,
      action: generateWordDocument
    },
    {
      type: 'json',
      label: 'JSON Data',
      description: 'Structured data format for integration with other systems',
      icon: Database,
      action: generateJSON
    }
  ];

  if (actionItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          <Download className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>No action items available for export. Process a meeting first to generate action items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Export Action Items
        </h3>
        <p className="text-gray-600 mt-1">Download your meeting action items in various formats</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={option.action}
                className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-600 transition-colors mb-4">
                  <Icon className="h-8 w-8 text-blue-600 group-hover:text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{option.label}</h4>
                <p className="text-sm text-gray-600 text-center">{option.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Export Summary</h4>
              <p className="text-sm text-gray-600 mt-1">
                Ready to export <strong>{actionItems.length} action items</strong> for{' '}
                <strong>{participants.length} participants</strong> from "{meetingTitle}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}