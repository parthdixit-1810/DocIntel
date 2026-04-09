import { DocumentData } from '../types';
import { FileText, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface DocumentListProps {
  documents: DocumentData[];
  selectedId?: string;
  onSelect: (doc: DocumentData) => void;
}

export function DocumentList({ documents, selectedId, onSelect }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400">
        <FileText className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">No documents found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc)}
          className={cn(
            "w-full p-4 text-left transition-all hover:bg-neutral-50 flex items-start gap-3 group",
            selectedId === doc.id && "bg-neutral-50 border-left-2 border-neutral-900"
          )}
        >
          <div className={cn(
            "p-2 rounded-lg shrink-0 transition-colors",
            selectedId === doc.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
          )}>
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "text-sm font-medium truncate",
              selectedId === doc.id ? "text-neutral-900" : "text-neutral-700"
            )}>
              {doc.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <ChevronRight className={cn(
            "w-4 h-4 text-neutral-300 transition-transform group-hover:translate-x-0.5",
            selectedId === doc.id && "text-neutral-900"
          )} />
        </button>
      ))}
    </div>
  );
}
