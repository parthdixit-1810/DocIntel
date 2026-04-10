import { useState } from 'react';
import { DocumentData } from '../types';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { DocumentComparison } from './DocumentComparison';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface DashboardProps {
  documents: DocumentData[];
}

export function Dashboard({ documents }: DashboardProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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



  // ...existing code...
  return (
    <div className="min-h-screen w-full flex items-stretch bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100">
      {/* Sidebar: Document List */}
      <aside className="w-80 border-r border-neutral-200 bg-white/80 backdrop-blur-lg shadow-xl flex flex-col shrink-0 rounded-tr-3xl rounded-br-3xl my-6 ml-4">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-2xl text-indigo-900 tracking-tight drop-shadow-sm">DocIntel</h2>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsUploading(true)}
              className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow-lg hover:scale-105 hover:from-indigo-600 hover:to-sky-500 transition-all"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <Input 
              placeholder="Search documents..." 
              className="pl-12 h-11 bg-white/70 border border-indigo-100 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-200 text-indigo-900 font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <DocumentList 
            documents={filteredDocs} 
            selectedId={selectedDoc?.id} 
            onSelect={handleSelectDoc} 
          />
        </div>
      </aside>

      {/* Main Content: Viewer, Upload, or Comparison */}
      <main className="flex-1 relative overflow-hidden flex flex-col justify-center items-center p-8">
        <AnimatePresence mode="wait">
          {comparisonDocs ? (
            <motion.div 
              key="comparison"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="flex-1 w-full max-w-4xl mx-auto drop-shadow-2xl"
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex-1 flex items-center justify-center w-full max-w-xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-10"
            >
              <DocumentUpload 
                onComplete={(doc) => {
                  setSelectedDoc(doc);
                  setIsUploading(false);
                }}
                onCancel={() => {
                  setIsUploading(false);
                }}
              />
            </motion.div>
          ) : selectedDoc ? (
            <motion.div 
              key={selectedDoc.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              className="flex-1 w-full max-w-4xl mx-auto drop-shadow-2xl"
            >
              <DocumentViewer 
                document={selectedDoc} 
                onCompare={handleStartComparison}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 bg-white/80 rounded-3xl shadow-xl"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-200 to-sky-100 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg">
                <Plus className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-indigo-900 mb-2">No document selected</h3>
                <p className="text-indigo-500 max-w-md text-lg">
                  Select a document from the sidebar or upload a new one to start analyzing.<br />
                  <span className="text-indigo-400">Your workspace is private and secure.</span>
                </p>
              </div>
              <Button onClick={() => setIsUploading(true)} className="bg-gradient-to-tr from-indigo-500 to-sky-400 text-white rounded-xl px-8 py-3 text-lg font-semibold shadow-lg hover:scale-105 transition-all">
                Upload Document
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
