import { useState, useEffect } from 'react';
import { DocumentData } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { ChatInterface } from './ChatInterface';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  ClipboardList,
  MessageSquare,
  Search,
  Download,
  History,
  RotateCcw,
  Plus,
  Diff
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '@/lib/utils';

interface DocumentViewerProps {
  document: DocumentData;
  onCompare?: (doc: DocumentData) => void;
  onNewVersion?: (doc: DocumentData) => void;
}

export function DocumentViewer({ document, onCompare, onNewVersion }: DocumentViewerProps) {
  const [versions, setVersions] = useState<DocumentData[]>([]);
  const analysis = document.analysis;

  useEffect(() => {
    const q = query(
      collection(db, 'documents', document.id, 'versions'),
      orderBy('archivedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVersions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `documents/${document.id}/versions`);
    });
    return () => unsubscribe();
  }, [document.id]);

  const handleRevert = async (version: DocumentData) => {
    try {
      // Create a version of the CURRENT state before reverting
      const versionRef = collection(db, 'documents', document.id, 'versions');
      await addDoc(versionRef, {
        ...document,
        id: undefined,
        archivedAt: Date.now()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, `documents/${document.id}/versions`));

      // Update main doc with the old version's data
      const { archivedAt, ...revertData } = version as any;
      await updateDoc(doc(db, 'documents', document.id), {
        ...revertData,
        version: (document.version || 1) + 1,
        createdAt: Date.now()
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `documents/${document.id}`));
      toast.success('Document reverted to previous version');
    } catch (error) {
      console.error('Revert error:', error);
      toast.error('Failed to revert document');
    }
  };

  if (!analysis) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-bottom border-neutral-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-100 rounded-lg">
            <FileText className="w-5 h-5 text-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg leading-none">{document.name}</h2>
              {document.version && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-neutral-100">v{document.version}</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-semibold">
              Last updated on {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onCompare?.(document)} className="rounded-lg gap-2">
            <Diff className="w-4 h-4" />
            Compare
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNewVersion?.(document)} className="rounded-lg gap-2">
            <Plus className="w-4 h-4" />
            New Version
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col border-right border-neutral-100">
          <Tabs defaultValue="summary" className="flex-1 flex flex-col">
            <div className="px-6 border-bottom border-neutral-100 shrink-0">
              <TabsList className="bg-transparent h-12 gap-6 p-0">
                <TabsTrigger value="summary" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-bottom-2 data-[state=active]:border-neutral-900 rounded-none h-full px-0 text-sm font-medium">Summary</TabsTrigger>
                <TabsTrigger value="clauses" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-bottom-2 data-[state=active]:border-neutral-900 rounded-none h-full px-0 text-sm font-medium">Clauses</TabsTrigger>
                <TabsTrigger value="entities" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-bottom-2 data-[state=active]:border-neutral-900 rounded-none h-full px-0 text-sm font-medium">Entities</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-bottom-2 data-[state=active]:border-neutral-900 rounded-none h-full px-0 text-sm font-medium">History</TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-bottom-2 data-[state=active]:border-neutral-900 rounded-none h-full px-0 text-sm font-medium">Full Text</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8 max-w-4xl mx-auto">
                <TabsContent value="summary" className="mt-0 space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-neutral-400" />
                      Executive Summary
                    </h3>
                    <p className="text-neutral-600 leading-relaxed text-lg italic font-serif">
                      "{analysis.summary}"
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Key Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.highlights.map((highlight, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-sm text-neutral-700"
                        >
                          {highlight}
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Indicators
                    </h3>
                    <div className="space-y-3">
                      {analysis.risks.map((risk, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-red-100 bg-red-50/30 flex items-start gap-4">
                          <Badge variant={risk.level === 'high' ? 'destructive' : 'secondary'} className="capitalize shrink-0">
                            {risk.level} Risk
                          </Badge>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-neutral-900">"{risk.term}"</p>
                            <p className="text-sm text-neutral-600">{risk.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="clauses" className="mt-0 space-y-6">
                  {analysis.entities.clauses.map((clause, i) => (
                    <div key={i} className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-neutral-900">{clause.title}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{clause.type}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{clause.content}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="entities" className="mt-0 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Parties
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.entities.parties.map((party, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 border-none">
                            {party}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Key Dates
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.entities.dates.map((date, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 border-none">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Key Obligations
                    </h4>
                    <ul className="space-y-2">
                      {analysis.entities.obligations.map((ob, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 shrink-0" />
                          {ob}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Version History
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border-2 border-neutral-900 bg-neutral-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold">
                            v{document.version || 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm">Current Version</p>
                            <p className="text-xs text-neutral-500">{new Date(document.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge className="bg-neutral-900 text-white">Active</Badge>
                      </div>

                      {versions.map((v: any, i) => (
                        <motion.div 
                          key={v.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-2xl border border-neutral-100 bg-white flex items-center justify-between hover:border-neutral-200 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center font-bold">
                              v{v.version || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{v.name}</p>
                              <p className="text-xs text-neutral-500">Archived on {new Date(v.archivedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => onCompare?.(v)} className="rounded-lg gap-2 text-xs">
                              <Diff className="w-3 h-3" />
                              Compare
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRevert(v)} className="rounded-lg gap-2 text-xs">
                              <RotateCcw className="w-3 h-3" />
                              Revert
                            </Button>
                          </div>
                        </motion.div>
                      ))}

                      {versions.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-neutral-200 rounded-2xl">
                          <p className="text-sm text-neutral-400">No previous versions found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-0">
                  <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-100 font-mono text-xs leading-relaxed text-neutral-600 whitespace-pre-wrap">
                    {document.text}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Chat Sidebar */}
        <aside className="w-[400px] flex flex-col shrink-0 bg-neutral-50/50">
          <div className="p-4 border-bottom border-neutral-100 bg-white flex items-center gap-2 shrink-0">
            <MessageSquare className="w-4 h-4 text-neutral-400" />
            <h3 className="font-bold text-sm">Document Assistant</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface documentText={document.text} />
          </div>
        </aside>
      </div>
    </div>
  );
}
