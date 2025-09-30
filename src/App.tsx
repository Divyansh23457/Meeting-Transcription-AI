import React, { useState } from 'react';
import { Calendar, Users, Target, Upload, FileText, Download, Mic } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProgressSteps from './components/ProgressSteps';
import TranscriptViewer from './components/TranscriptViewer';
import ActionItemsList from './components/ActionItemsList';
import ExportOptions from './components/ExportOptions';
import { useMeetingProcessor } from './hooks/useMeetingProcessor';

function App() {
  const [meetingTitle, setMeetingTitle] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const {
    meetings,
    currentMeeting,
    processing,
    error,
    createMeeting,
    processMeeting,
    updateActionItem,
    deleteActionItem,
    addActionItem,
    setCurrentMeeting
  } = useMeetingProcessor();

  const handleFileUpload = async (file: File) => {
    const title = meetingTitle || `Meeting - ${new Date().toLocaleDateString()}`;
    const meeting = createMeeting(title, file);
    setCurrentStep(2);
    
    // Auto-start processing
    setTimeout(() => {
      processMeeting(meeting);
    }, 500);
  };

  const getCurrentStep = () => {
    if (!currentMeeting) return 1;
    
    switch (currentMeeting.status) {
      case 'uploaded': return 1;
      case 'transcribing': return 2;
      case 'processing': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const resetFlow = () => {
    setCurrentMeeting(null);
    setMeetingTitle('');
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MeetingFlow</h1>
                <p className="text-sm text-gray-600">AI-Powered Action Item Management</p>
              </div>
            </div>
            
            {currentMeeting && (
              <button
                onClick={resetFlow}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                New Meeting
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <ProgressSteps currentStep={getCurrentStep()} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {!currentMeeting && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <Upload className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Meeting Audio</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Transform your meeting recordings into organized action items automatically. 
                  Our AI will transcribe, analyze, and extract actionable tasks for your team.
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Weekly Team Standup, Project Review..."
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <FileUpload onFileUpload={handleFileUpload} />
              </div>

              {/* Features Overview */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="flex justify-center mb-4">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Transcription</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered speech-to-text with speaker identification and high accuracy
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="flex justify-center mb-4">
                    <Target className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Action Extraction</h3>
                  <p className="text-sm text-gray-600">
                    Automatically identify and categorize action items from discussions
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="flex justify-center mb-4">
                    <Download className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Export Options</h3>
                  <p className="text-sm text-gray-600">
                    Download results in multiple formats for easy sharing and tracking
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing States */}
        {currentMeeting && (currentMeeting.status === 'transcribing' || currentMeeting.status === 'processing') && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {currentMeeting.status === 'transcribing' ? 'Transcribing Audio...' : 'Extracting Action Items...'}
              </h2>
              <p className="text-gray-600 mb-6">
                {currentMeeting.status === 'transcribing' 
                  ? 'Converting your audio to text and identifying speakers'
                  : 'Analyzing the transcript and extracting actionable items'
                }
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: currentMeeting.status === 'transcribing' ? '50%' : '75%' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {currentMeeting && currentMeeting.status === 'completed' && (
          <div className="space-y-8">
            {/* Meeting Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {currentMeeting.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {currentMeeting.participants.length} participants
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {currentMeeting.actionItems.length} action items
                </div>
                <div>
                  Processed on {new Date(currentMeeting.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Transcript */}
            {currentMeeting.transcript && (
              <TranscriptViewer transcript={currentMeeting.transcript} />
            )}

            {/* Action Items */}
            <ActionItemsList
              actionItems={currentMeeting.actionItems}
              participants={currentMeeting.participants}
              onUpdateActionItem={(item) => updateActionItem(currentMeeting.id, item)}
              onDeleteActionItem={(id) => deleteActionItem(currentMeeting.id, id)}
              onAddActionItem={(item) => addActionItem(currentMeeting.id, item)}
            />

            {/* Export Options */}
            <ExportOptions
              actionItems={currentMeeting.actionItems}
              participants={currentMeeting.participants}
              meetingTitle={currentMeeting.title}
            />
          </div>
        )}

        {/* Previous Meetings */}
        {meetings.length > 1 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Previous Meetings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.slice(1).map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => setCurrentMeeting(meeting)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900 mb-2">{meeting.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(meeting.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      {meeting.actionItems.length} action items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;