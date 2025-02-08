import { useEffect, useState } from 'react';
import { supabase, clearAppCache } from '../lib/supabase';

interface User {
  id: string;
  role: 'client' | 'landlord' | 'admin';
  name?: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Checar o estado inicial da autenticação
    checkUser();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      console.log('Checking user session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Session found:', session.user.id);
        await loadUserProfile(session.user.id);
      } else {
        console.log('No session found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      console.log('Loading profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, name, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        throw error;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        throw new Error('No profile found');
      }

      console.log('Profile loaded successfully:', profile);
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUser(null);
      setIsAuthenticated(false);
      
      // Fazer logout se não encontrar o perfil
      await signOut();
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar cache ao fazer logout
      clearAppCache();
      
      // Limpar estado do usuário
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    checkUser,
    signOut
  };
}
