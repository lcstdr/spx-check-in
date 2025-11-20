'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';

interface HookState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDoc<T extends DocumentData>(ref: DocumentReference<T> | null) {
  const [state, setState] = useState<HookState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!ref) {
      setState(prevState => ({ ...prevState, loading: false }));
      return;
    }

    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(ref, 
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() } as T;
          setState({ data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: null });
        }
      },
      (error) => {
        console.error("Error fetching document: ", error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return state;
}
