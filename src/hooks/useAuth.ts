import { useState, useEffect, useContext } from 'react';
import { auth } from '@/lib/firebase'; // Assuming your firebase auth instance is here
import { onAuthStateChanged, User } from 'firebase/auth';
import { AuthContext } from '@/context/auth-context'; // Assuming your context is here

const useAuth = () => {
  const context = useContext(AuthContext);

  // Return default values during prerendering
  if (typeof window === 'undefined') {
    return { user: null, loading: false };
  }

  // If using a context provider, return context values
  if (context !== undefined) {
    return context;
  }

  // Fallback or direct auth state management if not using context provider everywhere
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export { useAuth };