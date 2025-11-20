'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';

interface HookState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useCollection<T extends DocumentData>(query: Query<T> | null) {
  const [state, setState] = useState<HookState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!query) {
      setState(prevState => ({ ...prevState, loading: false }));
      return;
    }
    
    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(query, 
      (snapshot: QuerySnapshot<T>) => {
        const data: T[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState({ data, loading: false, error: null });
      },
      (error) => {
        console.error("Error fetching collection: ", error);
        setState({ data: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, [query]);

  return state;
}
