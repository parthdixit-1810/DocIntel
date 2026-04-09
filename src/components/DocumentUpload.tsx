import React, { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { analyzeDocument } from '../lib/gemini';
import { DocumentData } from '../types';
import { Button } from './ui/button';
import { Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/utils';

interface DocumentUploadProps {
  user: User;
  onComplete: (doc: DocumentData) => void;
  onCancel: () => void;
  parentDoc?: DocumentData;
}

export function DocumentUpload({ user, onComplete, onCancel, parentDoc }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'txt'].includes(ext || '')) {
        setFile(selected);
      } else {
        toast.error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus('uploading');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract text');
      const { text, fileName } = await response.json();

      setStatus('analyzing');
      const analysis = await analyzeDocument(text);

      if (parentDoc) {
        // Versioning: Move current to versions subcollection and update main
        const versionRef = collection(db, 'documents', parentDoc.id, 'versions');
        await addDoc(versionRef, {
          ...parentDoc,
          id: undefined, // Don't store the ID inside the doc
          archivedAt: Date.now()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `documents/${parentDoc.id}/versions`));

        const docData = {
          name: fileName,
          text,
          analysis,
          userId: user.uid,
          createdAt: Date.now(),
          version: (parentDoc.version || 1) + 1
        };

        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'documents', parentDoc.id), docData).catch(err => handleFirestoreError(err, OperationType.UPDATE, `documents/${parentDoc.id}`));
        
        setStatus('complete');
        toast.success(`New version (v${docData.version}) created!`);
        onComplete({ id: parentDoc.id, ...docData });
      } else {
        // New document
        const docData = {
          name: fileName,
          text,
          analysis,
          userId: user.uid,
          createdAt: Date.now(),
          version: 1
        };

        const docRef = await addDoc(collection(db, 'documents'), docData).catch(err => {
          handleFirestoreError(err, OperationType.CREATE, 'documents');
          return null;
        });
        
        if (!docRef) return;
        
        setStatus('complete');
        toast.success('Document analyzed successfully!');
        onComplete({ id: docRef.id, ...docData });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process document. Please try again.');
      setStatus('idle');
    }
  };


  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
      <div className="p-6 border-bottom border-neutral-100 flex items-center justify-between">
        <h2 className="text-xl font-bold">Upload Document</h2>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={status !== 'idle'}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-8 space-y-8">
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:bg-neutral-50 transition-colors group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="p-4 bg-neutral-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-neutral-500" />
              </div>
              <p className="mb-2 text-sm text-neutral-700 font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-neutral-400">
                PDF, DOCX, or TXT (MAX. 10MB)
              </p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
          </label>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FileText className="w-6 h-6 text-neutral-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">{file.name}</p>
                <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {status === 'idle' && (
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {status !== 'idle' && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 font-medium">
                    {status === 'uploading' ? 'Extracting text...' : 
                     status === 'analyzing' ? 'AI Analysis in progress...' : 
                     'Finalizing...'}
                  </span>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-neutral-900"
                    initial={{ width: 0 }}
                    animate={{ width: status === 'uploading' ? '40%' : status === 'analyzing' ? '80%' : '100%' }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-12" 
                onClick={() => setFile(null)}
                disabled={status !== 'idle'}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-xl h-12 bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={handleUpload}
                disabled={status !== 'idle'}
              >
                {status === 'idle' ? 'Start Analysis' : 'Processing...'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-neutral-50 border-top border-neutral-100">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your documents are processed securely. We use advanced AI to extract key information, identify risks, and provide summaries. No data is used for training without your consent.
          </p>
        </div>
      </div>
    </div>
  );
}
