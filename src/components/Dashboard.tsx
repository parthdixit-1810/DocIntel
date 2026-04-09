import { useState } from 'react';
import { User } from 'firebase/auth';
import { DocumentData } from '../types';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { DocumentComparison } from './DocumentComparison';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Plus, Diff } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface DashboardProps {
  documents: DocumentData[];
  user: User;
}

export function Dashboard({ documents, user }: DashboardProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parentDoc, setParentDoc] = useState<DocumentData | undefined>(undefined);
  const [comparisonDocs, setComparisonDocs] = useState<DocumentData[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartComparison = (doc: DocumentData) => {
    setIsComparing(true);
    toast.info('Select another document from the sidebar to compare with.');
  };

  const handleSelectDoc = (doc: DocumentData) => {
    if (isComparing && selectedDoc && selectedDoc.id !== doc.id) {
      setComparisonDocs([selectedDoc, doc]);
      setIsComparing(false);
    } else {
      setSelectedDoc(doc);
      setComparisonDocs(null);
      setIsComparing(false);
    }
  };

  const handleNewVersion = (doc: DocumentData) => {
    setParentDoc(doc);
    setIsUploading(true);
  };

  return (
    <div className="flex h-full bg-neutral-50 overflow-hidden">
      {/* Sidebar: Document List */}
      <aside className="w-80 border-right border-neutral-200 bg-white flex flex-col shrink-0">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">My Documents</h2>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => {
                setParentDoc(undefined);
                setIsUploading(true);
              }}
              className="h-8 w-8 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Search documents..." 
              className="pl-9 h-9 bg-neutral-50 border-none rounded-lg focus-visible:ring-1 focus-visible:ring-neutral-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DocumentList 
            documents={filteredDocs} 
            selectedId={selectedDoc?.id} 
            onSelect={handleSelectDoc} 
          />
        </div>
      </aside>

      {/* Main Content: Viewer, Upload, or Comparison */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {comparisonDocs ? (
            <motion.div 
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 overflow-hidden"
            >
              <DocumentComparison 
                doc1={comparisonDocs[0]} 
                doc2={comparisonDocs[1]} 
                onBack={() => setComparisonDocs(null)} 
              />
            </motion.div>
          ) : isUploading ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex items-center justify-center p-8"
            >
              <DocumentUpload 
                user={user} 
                parentDoc={parentDoc}
                onComplete={(doc) => {
                  setSelectedDoc(doc);
                  setIsUploading(false);
                  setParentDoc(undefined);
                }}
                onCancel={() => {
                  setIsUploading(false);
                  setParentDoc(undefined);
                }}
              />
            </motion.div>
          ) : selectedDoc ? (
            <motion.div 
              key="viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-hidden"
            >
              <DocumentViewer 
                document={selectedDoc} 
                onCompare={handleStartComparison}
                onNewVersion={handleNewVersion}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4"
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No document selected</h3>
                <p className="text-neutral-500 max-w-xs">
                  Select a document from the sidebar or upload a new one to start analyzing.
                </p>
              </div>
              <Button onClick={() => setIsUploading(true)} className="bg-neutral-900 text-white rounded-xl">
                Upload Document
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
