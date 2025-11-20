'use client';

import React from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // A inicialização do Firebase foi movida para dentro de um useEffect para garantir que seja executada apenas no cliente.
  const [firebase, setFirebase] = React.useState<{
    app: import('firebase/app').FirebaseApp;
    firestore: import('firebase/firestore').Firestore;
    auth: import('firebase/auth').Auth;
  } | null>(null);

  React.useEffect(() => {
    setFirebase(initializeFirebase());
  }, []);

  if (!firebase) {
    // Você pode renderizar um loader aqui enquanto o Firebase inicializa
    return null; 
  }

  return (
    <FirebaseProvider value={firebase}>
      {children}
    </FirebaseProvider>
  );
}
