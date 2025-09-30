import React from 'react';
import { User, Clock, Zap, FileText, BookOpen } from 'lucide-react';
import { Transcript, SpeakerSegment } from '../types/meeting';


interface TranscriptViewerProps {
  transcript: Transcript;
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const getSpeakerColor = (speaker: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
    ];
    const hash = speaker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Meeting Transcript
          </h3>
        </div>
      </div>

      <div className="p-6">
        {transcript.summary && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Meeting Summary</h4>
            </div>
            <p className="text-blue-800 leading-relaxed">{transcript.summary}</p>
          </div>
        )}

      </div>
    </div>
  );
}