import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
  // Defensive: ensure all array fields are true arrays before sending
  function ensureArray(val: any) {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') return Object.values(val);
    return [];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Analyze the following document text and provide a structured JSON response.
        
        Document Text:
        ${text}
        
        Required JSON Structure:
        {
          "summary": "Concise summary of the document",
          "entities": {
            "parties": ["List of parties involved"],
            "dates": ["Important dates mentioned"],
            "obligations": ["Key obligations or requirements"],
            "clauses": [{"title": "Clause Title", "content": "Brief content", "type": "Category"}]
          },
          "risks": [{"level": "low|medium|high", "description": "Why it is a risk", "term": "The specific text causing concern"}],
          "highlights": ["Key takeaways"]
        }` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          entities: {
            type: Type.OBJECT,
            properties: {
              parties: { type: Type.ARRAY, items: { type: Type.STRING } },
              dates: { type: Type.ARRAY, items: { type: Type.STRING } },
              obligations: { type: Type.ARRAY, items: { type: Type.STRING } },
              clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    type: { type: Type.STRING }
                  }
                }
              }
            }
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING },
                description: { type: Type.STRING },
                term: { type: Type.STRING }
              }
            }
          },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "entities", "risks", "highlights"]
      }
    }
  });

  // Defensive: ensure all array fields in the result are arrays
  const result = JSON.parse(response.text);
  if (result.entities) {
    result.entities.parties = ensureArray(result.entities.parties);
    result.entities.dates = ensureArray(result.entities.dates);
    result.entities.obligations = ensureArray(result.entities.obligations);
    result.entities.clauses = ensureArray(result.entities.clauses);
  }
  result.risks = ensureArray(result.risks);
  result.highlights = ensureArray(result.highlights);
  return result;
}

export async function askDocumentQuestion(text: string, question: string, history: { role: string, parts: { text: string }[] }[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an expert document analyst. Use the following document context to answer the user's questions. 
      If the answer is not in the document, say you don't know based on the provided text.
      
      Document Context:
      ${text}`
    },
    history: history
  });

  const response = await chat.sendMessage({ message: question });
  return response.text;
}

export async function compareDocuments(doc1: { name: string, text: string }, doc2: { name: string, text: string }) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Compare the following two documents and identify key differences in clauses, entities, and risks.
        
        Document 1 (${doc1.name}):
        ${doc1.text}
        
        Document 2 (${doc2.name}):
        ${doc2.text}
        
        Provide a structured JSON response:
        {
          "summary": "Overall summary of changes",
          "changes": [
            {
              "type": "added|removed|modified",
              "description": "What changed",
              "category": "clause|entity|general",
              "oldValue": "text from doc 1 (if modified/removed)",
              "newValue": "text from doc 2 (if modified/added)"
            }
          ],
          "riskChanges": [
            {
              "description": "How risks changed",
              "impact": "increased|decreased|neutral"
            }
          ]
        }` }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          changes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                oldValue: { type: Type.STRING },
                newValue: { type: Type.STRING }
              }
            }
          },
          riskChanges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "changes", "riskChanges"]
      }
    }
  });

  return JSON.parse(response.text);
}

