"use client";

/**
 * IntroProvider — expose l'état "intro terminée".
 *
 * Le SplashScreen "juice fill" affiche le V qui se remplit puis part en fade.
 * Tant qu'il n'a pas fini (`done` = false), le hero attend. `onReveal`
 * déclenche la révélation du contenu pendant le fade ; `onComplete` démonte
 * le splash une fois celui-ci invisible (sans coupure visuelle).
 */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import SplashScreen from "@/components/SplashScreen";

type IntroContextValue = {
  done: boolean;
};

const IntroContext = createContext<IntroContextValue>({ done: false });

export function useIntro() {
  return useContext(IntroContext);
}

export default function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);
  const [keepSplash, setKeepSplash] = useState(true);

  const onReveal = useCallback(() => setDone(true), []);
  const onComplete = useCallback(() => setKeepSplash(false), []);

  return (
    <IntroContext.Provider value={{ done }}>
      {children}
      {keepSplash && (
        <SplashScreen onReveal={onReveal} onComplete={onComplete} />
      )}
    </IntroContext.Provider>
  );
}