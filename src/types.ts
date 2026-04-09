export interface DocumentData {
  id: string;
  name: string;
  text: string;
  analysis?: AnalysisResult;
  createdAt: number;
  userId: string;
  version?: number;
  parentId?: string; // If this is a version, this points to the original doc ID
}

export interface ComparisonResult {
  summary: string;
  changes: {
    type: 'added' | 'removed' | 'modified';
    description: string;
    category: 'clause' | 'entity' | 'general';
    oldValue?: string;
    newValue?: string;
  }[];
  riskChanges: {
    description: string;
    impact: 'increased' | 'decreased' | 'neutral';
  }[];
}


export interface AnalysisResult {
  summary: string;
  entities: {
    parties: string[];
    dates: string[];
    obligations: string[];
    clauses: { title: string; content: string; type: string }[];
  };
  risks: { level: 'low' | 'medium' | 'high'; description: string; term: string }[];
  highlights: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
