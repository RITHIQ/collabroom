import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';

export type AuthMode = 'login' | 'signup' | 'forgot';

export function useAuthFlow() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    authService.getSession()
      .then(session => { /* session handled by _layout.tsx via onAuthStateChange */ })
      .catch(() => { /* no session */ })
      .finally(() => setIsBootstrapping(false));
  }, []);

  const clearMessages = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const signIn = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;
    setIsLoading(true);
    clearMessages();
    try {
      await authService.signIn(trimmedEmail, password);
      // Navigation handled by _layout.tsx via Supabase onAuthStateChange
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, clearMessages]);

  const signUp = useCallback(async () => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    if (!trimmedEmail || !password || !trimmedName) return;
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const data = await authService.signUp(trimmedEmail, password, { full_name: trimmedName });
      if (data.session) {
        // Navigation handled by _layout.tsx
      } else {
        setSuccessMessage('Account created! Check your email to verify, then sign in.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, fullName, clearMessages]);

  const forgotPassword = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    setIsLoading(true);
    clearMessages();
    try {
      await authService.resetPassword(trimmedEmail);
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  }, [email, clearMessages]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setEmail('');
      setPassword('');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Unable to log out.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    fullName, setFullName,
    isBootstrapping,
    isLoading,
    errorMessage,
    successMessage,
    signIn,
    signUp,
    forgotPassword,
    signOut,
    clearMessages,
  };
}
