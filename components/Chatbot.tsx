"use client";

/**
 * Chatbot — portage fidèle de legacy/js/chatbot.js + markup de index.html.
 * Widget fixe (bouton + fenêtre), Q&A par page (home / services), badge
 * de notification, et visibilité limitée au hero via ScrollTrigger.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLanguage } from "@/contexts/LanguageContext";

/** Q&R traduites (locales/*.json → chatbot.home / chatbot.services). */
type QAItem = { id: string; label: string; answer: string };

export default function Chatbot() {
  const pathname = usePathname();
  const { t, dict, lang } = useLanguage();

  const toggleRef = useRef<HTMLButtonElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const stateRef = useRef({ isOpen: false, isTyping: false, greeted: false });
  const qaRef = useRef<QAItem[]>([]);

  useEffect(() => {
    const toggle = toggleRef.current;
    const chatWindow = windowRef.current;
    const closeBtn = closeRef.current;
    const messages = messagesRef.current;
    const pills = pillsRef.current;
    const badge = badgeRef.current;
    if (!toggle || !chatWindow || !closeBtn || !messages || !pills) return;

    const tg = toggle;
    const win = chatWindow;
    const cBtn = closeBtn;
    const msgs = messages;
    const pls = pills;
    const bdg = badge;

    qaRef.current = pathname.startsWith("/services")
      ? dict.chatbot.services
      : dict.chatbot.home;
    stateRef.current = { isOpen: false, isTyping: false, greeted: false };
    pls.innerHTML = "";
    msgs.innerHTML = `<div class="cb-date-chip">${dict.chatbot.dateChip}</div>`;

    let badgeTimer: ReturnType<typeof setTimeout> | undefined;

    function scrollToBottom() {
      msgs.scrollTop = msgs.scrollHeight;
    }

    function createBubble(html: string, role: "user" | "bot", animate = true) {
      const wrap = document.createElement("div");
      wrap.className = `cb-msg cb-msg--${role}${animate ? " cb-msg--in" : ""}`;

      if (role === "bot") {
        const avatar = document.createElement("div");
        avatar.className = "cb-avatar";
        avatar.innerHTML =
          '<img src="/NV-IMG/heroP_pro.png" alt="Zak">';
        wrap.appendChild(avatar);
      }

      const bubble = document.createElement("div");
      bubble.className = "cb-bubble";
      bubble.innerHTML = html;
      wrap.appendChild(bubble);
      msgs.appendChild(wrap);

      requestAnimationFrame(() => scrollToBottom());
      return wrap;
    }

    function showTyping() {
      const wrap = document.createElement("div");
      wrap.className = "cb-msg cb-msg--bot cb-msg--in";
      wrap.id = "cb-typing-indicator";

      const avatar = document.createElement("div");
      avatar.className = "cb-avatar";
      avatar.innerHTML = '<img src="/NV-IMG/heroP_pro.png" alt="Zak">';
      wrap.appendChild(avatar);

      const bubble = document.createElement("div");
      bubble.className = "cb-bubble cb-typing";
      bubble.innerHTML = "<span></span><span></span><span></span>";
      wrap.appendChild(bubble);

      msgs.appendChild(wrap);
      scrollToBottom();
      return wrap;
    }

    function removeTyping() {
      const el = document.getElementById("cb-typing-indicator");
      if (el) el.remove();
    }

    function sendAnswer(qa: QAItem) {
      const state = stateRef.current;
      if (state.isTyping) return;
      state.isTyping = true;

      pls.classList.add("cb-pills--disabled");

      const strip = /^[\p{Emoji}\s]+/u;
      createBubble(
        qa.label.replace(strip, "").trim(),
        "user"
      );

      const delay = 900 + Math.random() * 600;
      showTyping();

      setTimeout(() => {
        removeTyping();
        createBubble(qa.answer, "bot");
        state.isTyping = false;
        pls.classList.remove("cb-pills--disabled");
      }, delay);
    }

    function buildPills() {
      pls.innerHTML = "";
      qaRef.current.forEach((qa) => {
        const btn = document.createElement("button");
        btn.className = "cb-pill";
        btn.innerHTML = qa.label;
        btn.addEventListener("click", () => sendAnswer(qa));
        pls.appendChild(btn);
      });
    }

    function openChat() {
      const state = stateRef.current;
      state.isOpen = true;
      win.classList.add("cb-window--open");
      tg.classList.add("cb-toggle--active");
      tg.setAttribute("aria-expanded", "true");

      if (!state.greeted) {
        state.greeted = true;
        setTimeout(() => {
          createBubble(dict.chatbot.greeting, "bot", false);
          scrollToBottom();
        }, 300);
      }
    }

    function closeChat() {
      const state = stateRef.current;
      state.isOpen = false;
      win.classList.remove("cb-window--open");
      tg.classList.remove("cb-toggle--active");
      tg.setAttribute("aria-expanded", "false");
    }

    const onToggle = () => {
      stateRef.current.isOpen ? closeChat() : openChat();
    };
    const onClose = () => closeChat();
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        stateRef.current.isOpen &&
        !win.contains(t) &&
        !tg.contains(t)
      ) {
        closeChat();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stateRef.current.isOpen) closeChat();
    };

    tg.addEventListener("click", onToggle);
    cBtn.addEventListener("click", onClose);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    buildPills();

    badgeTimer = setTimeout(() => {
      if (bdg && !stateRef.current.isOpen)
        bdg.classList.add("cb-badge--show");
    }, 3000);

    // Hero-only visibility du bouton
    let heroST: ScrollTrigger | undefined;
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      heroST = ScrollTrigger.create({
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        onEnter: () =>
          gsap.to(tg, {
            opacity: 1,
            scale: 1,
            pointerEvents: "auto",
            duration: 0.4,
          }),
        onLeave: () =>
          gsap.to(tg, {
            opacity: 0,
            scale: 0.8,
            pointerEvents: "none",
            duration: 0.4,
          }),
        onEnterBack: () =>
          gsap.to(tg, {
            opacity: 1,
            scale: 1,
            pointerEvents: "auto",
            duration: 0.4,
          }),
      });
    }

    return () => {
      tg.removeEventListener("click", onToggle);
      cBtn.removeEventListener("click", onClose);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
      if (badgeTimer) clearTimeout(badgeTimer);
      heroST?.kill();
    };
  }, [pathname, lang, dict]);

  return (
    <>
      {/* Toggle Button */}
      <button
        ref={toggleRef}
        id="cb-toggle"
        aria-label={t("chatbot.toggleLabel")}
        aria-expanded="false"
        aria-controls="cb-window"
      >
        <i className="fas fa-comment-dots cb-icon-open"></i>
        <i className="fas fa-times cb-icon-close"></i>
        <span ref={badgeRef} id="cb-badge" aria-hidden="true">
          1
        </span>
      </button>

      {/* Chat Window */}
      <div
        ref={windowRef}
        id="cb-window"
        role="dialog"
        aria-labelledby="cb-header-name"
        aria-modal="true"
      >
        <div className="cb-header">
          <div className="cb-header-avatar" aria-hidden="true">
            <Image
              src="/NV-IMG/heroP_pro.png"
              alt="Zakaria"
              width={1024}
              height={1024}
            />
          </div>
          <div className="cb-header-info">
            <div className="cb-header-name" id="cb-header-name">
              {t("chatbot.headerName")}
            </div>
            <div className="cb-header-status">{t("chatbot.headerStatus")}</div>
          </div>
          <button
            ref={closeRef}
            id="cb-close"
            className="cb-close"
            aria-label={t("chatbot.closeLabel")}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div
          ref={messagesRef}
          id="cb-messages"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className="cb-date-chip">{dict.chatbot.dateChip}</div>
        </div>

        <p className="cb-pills-label">{t("chatbot.pillsLabel")}</p>
        <div
          ref={pillsRef}
          id="cb-pills"
          role="group"
          aria-label={t("chatbot.pillsGroupLabel")}
        />
      </div>
    </>
  );
}