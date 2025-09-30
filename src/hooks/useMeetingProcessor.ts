import { useState, useCallback } from 'react';
import { Meeting, ActionItem, Transcript, SpeakerSegment } from '../types/meeting';
import { GoogleGenAI } from "@google/genai";

// Type for Deepgram API response
type DeepgramResponse = {
  metadata: any;
  results: {
    channels: Array<{
      search?: any;
      alternatives: Array<{
        transcript: string;
        confidence: number;
        words?: Array<{
          word: string;
          start: number;
          end: number;
          confidence: number;
        }>;
        paragraphs?: any;
        summaries?: any;
        topics?: any;
      }>;
      detected_language?: string;
    }>;
    utterances?: Array<{
      start: number;
      end: number;
      confidence: number;
      channel: number;
      transcript: string;
      words: Array<{
        word: string;
        start: number;
        end: number;
        confidence: number;
        speaker?: number;
        speaker_confidence?: number;
        punctuated_word?: string;
      }>;
      speaker?: number;
      id: string;
    }>;
    summary?: {
      result: string;
      short: string;
    };
    topics?: any;
    intents?: any;
    sentiments?: any;
  };
};

// Deepgram API transcription function
const transcribeAudioWithDeepgram = async (audioFile: File): Promise<Transcript> => {
  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
  const url = "https://api.deepgram.com/v1/listen";
  const summaryURL = "https://api.deepgram.com/v1/read?language=en&summarize=true"
  const transcriptTextRes = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": audioFile.type || "audio/mp3"
    },
    body: audioFile
  })
  // if (!transcriptTextRes.ok) {
  //   console.log("Failed to transcribe audio: ", transcriptTextRes.statusText);
  //   throw new Error("Failed to transcribe audio: " + transcriptTextRes.statusText);
  // }
  let transcriptText = await transcriptTextRes.json();
  
  // console.log("Deepgram response: ", JSON.stringify(transcriptText));

  // Analyze Text (POST /v1/read)
  const transcriptSummaryRes = await fetch( summaryURL, {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify({
      "text": transcriptText?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""
    }),
  });

  // if (!transcriptSummaryRes.ok) {
  //   console.log("Error in summary response: ", transcriptSummaryRes.statusText);
  //   throw new Error("Failed to summarize text: " + transcriptSummaryRes.statusText);
  // }
  let transcriptSummary = await transcriptSummaryRes.json();
  
  // console.log("Deepgram summary res: ", JSON.stringify(transcriptSummary));

  // Manipulate and normalize response to Transcript type
  const confidence = transcriptText?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;
  // const speakers: SpeakerSegment[] = Array.isArray(transcriptText?.results?.utterances)
  // ? transcriptText.results.utterances.map((u: any) => ({
  //   speaker: u.speaker ? `Speaker ${u.speaker}` : 'Unknown',
  //   text: u.transcript || '',
  //   timestamp: u.start ? u.start.toString() : '',
  //   confidence: u.confidence || 0
  // }))
  // : [];
  
  transcriptText = transcriptText?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
  transcriptSummary = transcriptSummary?.results?.summary?.text || 0;
  
    console.log("final result response " , JSON.stringify( {
    summary :transcriptSummary,  
    text: transcriptText,
    speakers : [],
    confidence
  }));
  return {
    summary :transcriptSummary,
    text: transcriptText,
    speakers : [],
    confidence
  };
};
 
const mockActionExtraction = async (transcript: Transcript): Promise<ActionItem[]> => {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: geminiApiKey});
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are given a transcript summary of a meeting. Your task is to extract all clear and implicit action items and return them strictly in JSON format according to the given TypeScript interface.

    Each action item must use this structure:

    ts
    export interface ActionItem {
      id: string; // unique identifier like 'AI-1', 'AI-2' etc.
      description: string; // concise action starting with a verb
      assignedTo?: Participant; // person responsible, if mentioned
      priority: 'high' | 'medium' | 'low'; // infer based on urgency or importance
      deadline?: string; // standard ISO 8601 date format if mentioned
      status: 'pending' | 'in-progress' | 'completed'; // default to 'pending' unless otherwise stated
      category: string; // categorize based on context (e.g., 'Development', 'Design', 'Operations')
      extractedFromContext: string; // the original sentence/phrase in transcript that led to this action item
    }
    Guidelines:

    If no owner is mentioned, assign assignedTo: null.

    If no deadline is explicitly mentioned, omit it.

    Always output a valid JSON array of ActionItem objects only.

    Each description must begin with a verb (e.g., 'Prepare the report', 'Schedule the demo').

    Now extract action items from this transcript summary:
    ${transcript.summary}`,
  });

  try {
    // Get the text response from Gemini
    const cleanResponse = response.text.replace(/```json\n|\n```/g, '').trim();
    const arr = JSON.parse(cleanResponse);
       
    // Ensure each action item has the required properties
    return arr.map(item => ({
      id: item.id || `AI-${Date.now()}`,
      description: item.description,
      assignedTo: item.assignedTo || undefined,
      priority: item.priority || 'medium',
      status: item.status || 'pending',
      category: item.category,
      extractedFromContext: item.extractedFromContext,
      deadline: item.deadline
    }));
  } catch (error) {
    console.error('Error parsing action items:', error);
    return [];
  }
    };

export function useMeetingProcessor() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const createMeeting = useCallback((title: string, audioFile: File) => {
    const meeting: Meeting = {
      id: Date.now().toString(),
      title,
      date: new Date().toISOString(),
      participants: [
        { id: '1', name: 'Speaker 1', role: 'Project Manager' },
        { id: '2', name: 'Speaker 2', role: 'Marketing Specialist' },
        { id: '3', name: 'Speaker 3', role: 'Account Manager' }
      ],
      audioFile,
      actionItems: [],
      status: 'uploaded',
      createdAt: new Date().toISOString()
    };
    
    setCurrentMeeting(meeting);
    setMeetings(prev => [meeting, ...prev]);
    return meeting;
  }, []);

  const processMeeting = useCallback(async (meeting: Meeting) => {
    if (!meeting.audioFile) return;
    
    setProcessing(true);
    setError('');
    
    try {
      // Update status to transcribing
      const updatedMeeting = { ...meeting, status: 'transcribing' as const };
      setCurrentMeeting(updatedMeeting);
      setMeetings(prev => prev.map(m => m.id === meeting.id ? updatedMeeting : m));
      
      // Deepgram transcription
      const dgResponse = await transcribeAudioWithDeepgram(meeting.audioFile);
      // Map Deepgram utterances to SpeakerSegment[]
      const speakers: SpeakerSegment[] =[]
      console.log("Speakers :", speakers);
      const transcript: Transcript = {
        summary :dgResponse.summary,
        text: dgResponse.text,
        speakers,
        confidence: dgResponse.confidence
      };
      console.log("transcript :", transcript);
      // Update with transcript
      const transcribedMeeting = { ...updatedMeeting, transcript, status: 'processing' as const };
      setCurrentMeeting(transcribedMeeting);
      setMeetings(prev => prev.map(m => m.id === meeting.id ? transcribedMeeting : m));

      // Mock action item extraction (can be replaced with real API)
      const actionItems = await mockActionExtraction(transcript);
      console.log("typeof actionItems" + typeof actionItems);
      console.log("Extracted1 Action Items: ", actionItems);
      // Final update
      const completedMeeting = { ...transcribedMeeting, actionItems, status: 'completed' as const };
      setCurrentMeeting(completedMeeting);
      setMeetings(prev => prev.map(m => m.id === meeting.id ? completedMeeting : m));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      const errorMeeting = { ...meeting, status: 'uploaded' as const };
      setCurrentMeeting(errorMeeting);
      setMeetings(prev => prev.map(m => m.id === meeting.id ? errorMeeting : m));
    } finally {
      setProcessing(false);
    }
  }, []);
 
  const updateActionItem = useCallback((meetingId: string, updatedItem: ActionItem) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? {
            ...meeting,
            actionItems: meeting.actionItems.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            )
          }
        : meeting
    ));
    
    if (currentMeeting && currentMeeting.id === meetingId) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        actionItems: prev.actionItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      } : prev);
    }
  }, [currentMeeting]);

  const deleteActionItem = useCallback((meetingId: string, itemId: string) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? {
            ...meeting,
            actionItems: meeting.actionItems.filter(item => item.id !== itemId)
          }
        : meeting
    ));
    
    if (currentMeeting && currentMeeting.id === meetingId) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        actionItems: prev.actionItems.filter(item => item.id !== itemId)
      } : prev);
    }
  }, [currentMeeting]);

  const addActionItem = useCallback((meetingId: string, newItem: Omit<ActionItem, 'id'>) => {
    const actionItem: ActionItem = {
      ...newItem,
      id: Date.now().toString()
    };
    
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? {
            ...meeting,
            actionItems: [...meeting.actionItems, actionItem]
          }
        : meeting
    ));
    
    if (currentMeeting && currentMeeting.id === meetingId) {
      setCurrentMeeting(prev => prev ? {
        ...prev,
        actionItems: [...prev.actionItems, actionItem]
      } : prev);
    }
  }, [currentMeeting]);

  return {
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
  };
}