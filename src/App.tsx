/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { DocumentData } from './types';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { FileText, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from './lib/utils';

export default function App() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'documents'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DocumentData[];
      setDocuments(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <Toaster position="top-right" />
      <main className="flex-1 overflow-hidden">
        <Dashboard documents={documents} user={null} />
      </main>
    </div>
  );
}

