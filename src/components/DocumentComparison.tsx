import { useState, useEffect } from 'react';
import { DocumentData, ComparisonResult } from '../types';
import { compareDocuments } from '../lib/gemini';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Diff, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface DocumentComparisonProps {
  doc1: DocumentData;
  doc2: DocumentData;
  onBack: () => void;
}

export function DocumentComparison({ doc1, doc2, onBack }: DocumentComparisonProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runComparison() {
      try {
        setLoading(true);
        const result = await compareDocuments(doc1, doc2);
        setComparison(result);
      } catch (error) {
        console.error('Comparison error:', error);
      } finally {
        setLoading(false);
      }
    }
    runComparison();
  }, [doc1, doc2]);

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="px-6 py-4 border-bottom border-neutral-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-900 text-white rounded-lg">
              <Diff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">Document Comparison</h2>
              <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-semibold">
                Comparing: {doc1.name} vs {doc2.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Left: Comparison Results */}
        <div className="flex-1 flex flex-col border-right border-neutral-100">
          <ScrollArea className="flex-1">
            <div className="p-8 max-w-4xl mx-auto space-y-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-neutral-900" />
                  <p className="text-neutral-500 font-medium">AI is analyzing differences...</p>
                </div>
              ) : comparison ? (
                <>
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-neutral-400" />
                      Comparison Summary
                    </h3>
                    <p className="text-neutral-600 leading-relaxed text-lg italic font-serif">
                      "{comparison.summary}"
                    </p>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Detailed Changes</h3>
                    <div className="space-y-4">
                      {comparison.changes.map((change, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-5 rounded-2xl border border-neutral-100 bg-neutral-50/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {change.type === 'added' ? (
                                <PlusCircle className="w-4 h-4 text-green-500" />
                              ) : change.type === 'removed' ? (
                                <MinusCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-sm font-bold capitalize">{change.type} {change.category}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{change.category}</Badge>
                          </div>
                          
                          <p className="text-sm text-neutral-700 font-medium">{change.description}</p>
                          
                          {(change.oldValue || change.newValue) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {change.oldValue && (
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-neutral-400">Previous</p>
                                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs text-red-700 font-mono line-through">
                                    {change.oldValue}
                                  </div>
                                </div>
                              )}
                              {change.newValue && (
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-neutral-400">New</p>
                                  <div className="p-3 bg-green-50/50 border border-green-100 rounded-xl text-xs text-green-700 font-mono">
                                    {change.newValue}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Risk Impact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comparison.riskChanges.map((risk, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-neutral-100 flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            risk.impact === 'increased' ? 'bg-red-100 text-red-600' : 
                            risk.impact === 'decreased' ? 'bg-green-100 text-green-600' : 
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-neutral-900">{risk.description}</p>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{risk.impact}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <div className="text-center py-20 text-neutral-400">
                  Failed to generate comparison.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Side-by-Side Text (Optional/Simplified) */}
        <aside className="w-[400px] border-left border-neutral-100 bg-neutral-50/30 flex flex-col shrink-0">
          <div className="p-4 border-bottom border-neutral-100 bg-white flex items-center justify-between">
            <h3 className="font-bold text-sm">Source View</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-neutral-400 px-2">{doc1.name}</p>
                <div className="p-4 bg-white border border-neutral-100 rounded-xl text-[10px] text-neutral-500 font-mono leading-relaxed">
                  {doc1.text.slice(0, 1000)}...
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-neutral-400 px-2">{doc2.name}</p>
                <div className="p-4 bg-white border border-neutral-100 rounded-xl text-[10px] text-neutral-500 font-mono leading-relaxed">
                  {doc2.text.slice(0, 1000)}...
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
