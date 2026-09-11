"use client";

/**
 * Contact — portage de la section #contact de legacy/index.html.
 *
 *  - Côté logo : V rempli en rouge (JuiceLogo, même visuel que le splash)
 *  - Côté formulaire : formulaire multi-étapes (4 steps) avec barre de
 *    progression, validation HTML5, touche ENTER, et envoi vers /api/contact.
 */
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import JuiceLogo from "@/components/JuiceLogo";
import { onIdle } from "@/lib/defer";
import Logo065Tooltip from "@/components/Logo065Tooltip";
import SectionTitle from "@/components/SectionTitle";
import { useContactStatus } from "@/contexts/ContactStatusContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  PaperPlaneIcon,
  SpinnerIcon,
  TriangleAlertIcon,
} from "@/components/icons";

function TopographicLines() {
  return (
    <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,200 Q250,150 500,200 T1000,200" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0,400 Q250,350 500,400 T1000,400" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0,600 Q250,550 500,600 T1000,600" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0,800 Q250,750 500,800 T1000,800" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M100,0 Q150,250 100,500 T100,1000" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M300,0 Q350,250 300,500 T300,1000" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M700,0 Q750,250 700,500 T700,1000" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M900,0 Q950,250 900,500 T900,1000" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const currentStepNumRef = useRef<HTMLSpanElement>(null);
  const successMsgRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Entrée au scroll : différée après paint (TBT)
  useGSAP(
    () => {
      try {
        if (window.matchMedia("(pointer: coarse), (max-width: 767px)").matches) return;
      } catch {
        /* ignore */
      }
      let cancelled = false;
      const cancelIdle = onIdle(async () => {
        if (cancelled) return;
        const [{ gsap }] = await Promise.all([import("gsap")]);
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        if (cancelled) return;
        gsap.fromTo(
          ".contact-split-container",
          { y: 90, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 78%", toggleActions: "play none none reverse" },
          }
        );
      });
      return () => {
        cancelled = true;
        cancelIdle();
      };
    },
    { scope: sectionRef }
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const { startSubmit, resolveSubmit } = useContactStatus();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "success" && successMsgRef.current) {
      import("gsap").then(({ gsap }) => {
        gsap.fromTo(successMsgRef.current, { opacity: 0, translateY: 20 }, { opacity: 1, translateY: 0, duration: 0.8, ease: "power2.out" });
      });
    }
  }, [status]);

  const updateProgressBar = (step: number) => {
    const total = 4;
    const progress = (step / total) * 100;
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${progress}%`;
    }
    if (currentStepNumRef.current) {
      currentStepNumRef.current.textContent = String(step);
    }
  };

  const showStep = (step: number) => {
    const container = stepsContainerRef.current;
    if (!container || !formRef.current) return;
    container.querySelectorAll<HTMLElement>(".form-step").forEach((s) =>
      s.classList.remove("active")
    );
    const active = container.querySelector<HTMLElement>(
      `.form-step[data-step="${step}"]`
    );
    if (active) {
      active.classList.add("active");
      const firstInput = active.querySelector<HTMLInputElement>(
        "input, textarea"
      );
      if (firstInput) firstInput.focus();
    }
    updateProgressBar(step);
  };

  const validateStep = (step: number): boolean => {
    const container = stepsContainerRef.current;
    if (!container) return true;
    const active = container.querySelector<HTMLElement>(
      `.form-step[data-step="${step}"]`
    );
    let isValid = true;
    active
      ?.querySelectorAll<HTMLInputElement>("input, textarea")
      .forEach((input) => {
        if (!input.checkValidity()) {
          isValid = false;
          input.classList.add("border-red-500");
          window.setTimeout(
            () => input.classList.remove("border-red-500"),
            500
          );
        }
      });
    return isValid;
  };

  const currentStep = () => {
    const container = stepsContainerRef.current;
    if (!container) return 1;
    const active = container.querySelector<HTMLElement>(".form-step.active");
    return active ? Number(active.dataset.step || "1") : 1;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    const step = currentStep();
    if (!validateStep(step)) return;

    setStatus("loading");
    startSubmit();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Contact API error:", data);
        setStatus("error");
        resolveSubmit(false);
        return;
      }

      setStatus("success");
      resolveSubmit(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      formRef.current?.reset();
    } catch (err) {
      console.error("Contact API error:", err);
      setStatus("error");
      resolveSubmit(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    e.preventDefault();
    const step = currentStep();
    if (step < 4) {
      if (validateStep(step)) {
        showStep(step + 1);
      }
    } else if (step === 4) {
      formRef.current?.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-24 bg-white dark:bg-black transition-colors duration-300 relative overflow-clip"
      style={{ position: "relative", zIndex: 30 }}
    >
      <TopographicLines />

      <div className="container mx-auto px-6 relative z-10">
        <SectionTitle white={t("contact.titleWhite")} red={t("contact.titleRed")} align="center" className="mb-14" />

        <div className="contact-split-container transition-all duration-300">
          {/* Logo Side */}
          <div className="contact-logo-side">
            <div className="relative inline-block">
              <Logo065Tooltip>
                <JuiceLogo className="juice-logo--lg" />
              </Logo065Tooltip>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-side">
            <div className="multistep-form-container mx-auto">
              <div className="step-indicator">
                <span className="step-label uppercase">
                  {t("contact.stepLabel")}{" "}
                  <span id="current-step-num" ref={currentStepNumRef}>
                    1
                  </span>{" "}
                  / 4
                </span>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    id="step-progress"
                    ref={progressFillRef}
                  ></div>
                </div>
              </div>

              <form
                ref={formRef}
                id="multistep-contact-form"
                className={status === "success" ? "hidden" : "mt-12"}
                onSubmit={onSubmit}
                onKeyDown={onKeyDown}
              >
                <div ref={stepsContainerRef}>
                  {/* Step 1 */}
                  <div className="form-step active" data-step="1">
                    <h3 className="step-heading text-3xl md:text-5xl font-black text-white uppercase mb-8">
                      {t("contact.steps.0.heading")}
                    </h3>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="step-name"
                        className="step-input-large"
                        placeholder={t("contact.steps.0.placeholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="step-actions mt-10 flex items-center gap-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep(1)) showStep(2);
                        }}
                        className="btn-step-next bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                      >
                        {t("contact.next")} <ChevronRightIcon className="h-4 w-4" />
                      </button>
                      <span className="press-enter-hint text-xs text-gray-500 uppercase tracking-widest hidden md:block">
                        {t("contact.pressEnter")}{" "}
                        <span className="border border-gray-700 px-1 rounded">
                          {t("contact.enterKey")}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="form-step" data-step="2">
                    <h3 className="step-heading text-3xl md:text-5xl font-black text-white uppercase mb-8">
                      {t("contact.steps.1.heading")}
                    </h3>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="step-email"
                        className="step-input-large"
                        placeholder={t("contact.steps.1.placeholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="step-actions mt-10 flex items-center gap-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep(2)) showStep(3);
                        }}
                        className="btn-step-next bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                      >
                        {t("contact.next")} <ChevronRightIcon className="h-4 w-4" />
                      </button>
                      <span className="press-enter-hint text-xs text-gray-500 uppercase tracking-widest hidden md:block">
                        {t("contact.pressEnter")}{" "}
                        <span className="border border-gray-700 px-1 rounded">
                          {t("contact.enterKey")}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="form-step" data-step="3">
                    <h3 className="step-heading text-3xl md:text-5xl font-black text-white uppercase mb-8">
                      {t("contact.steps.2.heading")}
                    </h3>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="step-subject"
                        className="step-input-large"
                        placeholder={t("contact.steps.2.placeholder")}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="step-actions mt-10 flex items-center gap-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep(3)) showStep(4);
                        }}
                        className="btn-step-next bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all"
                      >
                        {t("contact.next")} <ChevronRightIcon className="h-4 w-4" />
                      </button>
                      <span className="press-enter-hint text-xs text-gray-500 uppercase tracking-widest hidden md:block">
                        {t("contact.pressEnter")}{" "}
                        <span className="border border-gray-700 px-1 rounded">
                          {t("contact.enterKey")}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="form-step" data-step="4">
                    <h3 className="step-heading text-3xl md:text-5xl font-black text-white uppercase mb-8">
                      {t("contact.steps.3.heading")}
                    </h3>
                    <div className="input-wrapper">
                      <textarea
                        id="step-message"
                        className="step-input-large"
                        placeholder={t("contact.steps.3.placeholder")}
                        rows={1}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div className="step-actions mt-10 flex items-center gap-10">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="btn-step-submit bg-white text-black px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? (
                          <>
                            <SpinnerIcon className="h-4 w-4 animate-spin" /> {t("contact.sending")}
                          </>
                        ) : (
                          <>
                            {t("contact.submit")} <PaperPlaneIcon className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <span className="press-enter-hint text-xs text-gray-500 uppercase tracking-widest hidden md:block">
                        {t("contact.pressEnter")}{" "}
                        <span className="border border-gray-700 px-1 rounded">
                          {t("contact.enterKey")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </form>

              {status === "success" && (
                <div
                  id="form-success-msg"
                  ref={successMsgRef}
                  className="mt-8 p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-center"
                >
                  <CheckCircleIcon className="mx-auto mb-4 block h-10 w-10 text-green-500" />
                  <h4 className="text-xl font-bold text-white mb-2">
                    {t("contact.successTitle")}
                  </h4>
                  <p className="text-gray-400">
                    {t("contact.successText")}
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mt-8 p-6 bg-red-600/10 border border-red-600/50 rounded-xl text-center">
                  <TriangleAlertIcon className="mx-auto mb-4 block h-10 w-10 text-red-600" />
                  <h4 className="text-xl font-bold text-white mb-2">
                    {t("contact.errorTitle")}
                  </h4>
                  <p className="text-gray-400">
                    {t("contact.errorText")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}