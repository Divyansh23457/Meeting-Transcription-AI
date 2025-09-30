export interface Meeting {
  id: string;
  title: string;
  date: string;
  participants: Participant[];
  audioFile?: File;
  transcript?: Transcript;
  actionItems: ActionItem[];
  status: 'uploaded' | 'transcribing' | 'processing' | 'completed';
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Transcript {
  summary : string,
  text: string;
  speakers: SpeakerSegment[];
  confidence: number;
}

export interface SpeakerSegment {
  speaker: string;
  text: string;
  timestamp: string;
  confidence: number;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo?: Participant;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  extractedFromContext: string;
}

export interface ExportFormat {
  type: 'excel' | 'word' | 'csv';
  label: string;
  icon: string;
}