// src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface ToastState { msg: string; tipo: 'ok' | 'err'; visible: boolean }

const ToastContext = createContext<(msg: string, tipo?: 'ok' | 'err') => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ msg: '', tipo: 'ok', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((msg: string, tipo: 'ok' | 'err' = 'ok') => {
    clearTimeout(timerRef.current);
    setToast({ msg, tipo, visible: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast toast--${toast.tipo}${toast.visible ? ' toast--show' : ''}`}
           role="status" aria-live="polite">
        {toast.msg}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
