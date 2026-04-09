/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { DocumentData } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { FileText, LogIn, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      return;
    }

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid),
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
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-neutral-200 rounded-full" />
          <div className="h-4 w-32 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <Toaster position="top-right" />
      
      {user ? (
        <div className="flex flex-col h-screen">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-hidden">
            <Dashboard documents={documents} user={user} />
          </main>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-8"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-neutral-900 text-white rounded-2xl shadow-xl">
                <Shield className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                DocuIntel AI
              </h1>
              <p className="text-neutral-500 text-lg">
                Intelligent document analysis for legal, business, and HR professionals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-neutral-50">
                  <FileText className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-sm">Smart Extraction</p>
                    <p className="text-xs text-neutral-500">Extract clauses, dates, and parties automatically.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-neutral-50">
                  <Shield className="w-5 h-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-sm">Risk Analysis</p>
                    <p className="text-xs text-neutral-500">Identify ambiguous terms and potential risks.</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleLogin}
                className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white gap-2 text-base"
              >
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </Button>
            </div>

            <p className="text-xs text-neutral-400">
              Secure, encrypted, and private document processing.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

