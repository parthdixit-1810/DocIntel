/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DocumentData } from './types';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { FileText, Shield } from 'lucide-react';
import { motion } from 'motion/react';
// import { handleFirestoreError, OperationType } from './lib/utils';

export default function App() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(setDocuments)
      .catch(() => setDocuments([]));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <Toaster position="top-right" />
      <main className="flex-1 overflow-hidden">
  <Dashboard documents={documents} />
      </main>
    </div>
  );
}

