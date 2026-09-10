"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ContactStatusValue = {
  isSubmitting: boolean;
  sendSuccess: boolean;
  startSubmit: () => void;
  resolveSubmit: (ok: boolean) => void;
};

const ContactStatusContext = createContext<ContactStatusValue | null>(null);

/**
 * État partagé de soumission du formulaire de contact :
 * - Contact (formulaire) → startSubmit()/resolveSubmit()
 * - Header (logo V)     → isSubmitting / sendSuccess pour piloter le "liquid fill"
 */
export default function ContactStatusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  const startSubmit = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setSendSuccess(false);
    setIsSubmitting(true);
  }, []);

  const resolveSubmit = useCallback((ok: boolean) => {
    setIsSubmitting(false);
    if (ok) {
      setSendSuccess(true);
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setSendSuccess(false);
        resetTimerRef.current = null;
      }, 2500);
    }
  }, []);

  return (
    <ContactStatusContext.Provider
      value={{ isSubmitting, sendSuccess, startSubmit, resolveSubmit }}
    >
      {children}
    </ContactStatusContext.Provider>
  );
}

export function useContactStatus() {
  const ctx = useContext(ContactStatusContext);
  if (!ctx) {
    throw new Error(
      "useContactStatus must be used inside <ContactStatusProvider>."
    );
  }
  return ctx;
}