"use client";

/**
 * SignatureSection — portage de legacy/js/advanced-animations.js
 * (initSignatureAnimation).
 *
 * La signature SVG est "écrite" au scroll (section pinée) : les 6 chemins
 * (SIGNATURE_PATHS) sont dessinés via stroke-dasharray/offset et le stylo
 * (NV-IMG/stylo.png) suit la pointe grâce à path.getScreenCTM().
 * Parallaxe souris sur le wrapper + trait final (#sig-line).
 */
import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SIGNATURE_PATHS } from "@/lib/signature";

export default function SignatureSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
        return;

      const section = sectionRef.current;
      const sigWrap = section?.querySelector<HTMLElement>("#sig-wrap");
      const sigSVG = section?.querySelector<SVGSVGElement>("#sig-svg");
      const penImg = section?.querySelector<HTMLImageElement>("#pen-img");
      const sigLine = section?.querySelector<HTMLElement>("#sig-line");

      if (!section || !penImg || !sigWrap || !sigSVG || !sigLine) return;

      const sec = section;
      const wrap = sigWrap;
      const svg = sigSVG;
      const pen = penImg;

      // 1. Récupération des chemins
      const paths = SIGNATURE_PATHS.map(
        (_, i) =>
          document.getElementById(`sp${i + 1}`) as unknown as SVGPathElement
      ).filter((p): p is SVGPathElement => Boolean(p));
      if (!paths.length) return;

      const lengths = paths.map((p) => p.getTotalLength());
      const totalLen = lengths.reduce((a, b) => a + b, 0);

      // 2. Initialisation stroke-dasharray
      paths.forEach((p, i) => {
        p.style.strokeDasharray = String(lengths[i]);
        p.style.strokeDashoffset = String(lengths[i]);
      });

      // 3. Constantes du stylo
      const PEN_W = 140;
      const TIP_FX = 0.5;
      const TIP_FY = 0.97;

      // 4. Helper coordonnées — getScreenCTM()
      function svgPtToWrap(
        path: SVGPathElement,
        x: number,
        y: number
      ): { x: number; y: number } {
        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        const ctm = path.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const m = pt.matrixTransform(ctm);
        const box = wrap.getBoundingClientRect();
        return { x: m.x - box.left, y: m.y - box.top };
      }

      function placePen(sx: number, sy: number) {
        const penH = pen.offsetHeight || PEN_W;
        pen.style.left = `${sx - PEN_W * TIP_FX}px`;
        pen.style.top = `${sy - penH * TIP_FY}px`;
      }

      function getPointAt(t: number): {
        path: SVGPathElement;
        pt: DOMPoint;
      } {
        const target = t * totalLen;
        let acc = 0;
        for (let i = 0; i < paths.length; i++) {
          const L = lengths[i];
          if (acc + L >= target || i === paths.length - 1) {
            const local = Math.max(0, Math.min(1, (target - acc) / L));
            return {
              path: paths[i],
              pt: paths[i].getPointAtLength(local * L),
            };
          }
          acc += L;
        }
        return { path: paths[0], pt: paths[0].getPointAtLength(0) };
      }

      // 5. Sync maître — appelé à chaque frame GSAP
      function syncAll(t: number) {
        let acc = 0;
        paths.forEach((p, i) => {
          const L = lengths[i];
          const start = acc / totalLen;
          const end = (acc + L) / totalLen;
          let drawn = 0;
          if (t >= end) drawn = L;
          else if (t > start) drawn = ((t - start) / (end - start)) * L;
          p.style.strokeDashoffset = String(L - drawn);
          acc += L;
        });

        if (t > 0 && t < 1) {
          const { path, pt } = getPointAt(Math.min(t, 0.9999));
          const sc = svgPtToWrap(path, pt.x, pt.y);
          placePen(sc.x, sc.y);
        }
      }

      // 6. Initialisation
      syncAll(0);
      pen.style.opacity = "0";

      function placePenAtStart() {
        const { path, pt } = getPointAt(0.001);
        const sc = svgPtToWrap(path, pt.x, pt.y);
        placePen(sc.x, sc.y);
      }

      if (pen.complete) {
        placePenAtStart();
      } else {
        pen.addEventListener("load", placePenAtStart);
      }

      // 7. Timeline GSAP avec pin
      const driver = { progress: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=1500",
          pin: true,
          toggleActions: "play none none reverse",
        },
        onStart() {
          if (pen) pen.style.opacity = "1";
        },
      });

      tl.to(
        driver,
        {
          progress: 1,
          duration: 2.4,
          ease: "power1.inOut",
          onUpdate() {
            syncAll(driver.progress);
          },
        },
        0.3
      )
        .to(pen, { opacity: 0, duration: 0.35, ease: "power2.in" }, 2.5)
        .to(
          sigLine,
          { width: "220px", opacity: 0.7, duration: 0.8, ease: "power3.out" },
          2.4
        );

      // 8. Parallaxe souris
      const onMove = (e: MouseEvent) => {
        const r = sec.getBoundingClientRect();
        const rx = ((e.clientX - r.left) / r.width - 0.5) * 16;
        const ry = ((e.clientY - r.top) / r.height - 0.5) * -10;
        gsap.to(wrap, {
          rotateY: rx,
          rotateX: ry,
          duration: 0.6,
          ease: "power2.out",
        });
      };
      const onLeave = () => {
        gsap.to(wrap, {
          rotateX: 0,
          rotateY: 0,
          duration: 1.3,
          ease: "elastic.out(1,0.4)",
        });
      };
      sec.addEventListener("mousemove", onMove);
      sec.addEventListener("mouseleave", onLeave);

      return () => {
        sec.removeEventListener("mousemove", onMove);
        sec.removeEventListener("mouseleave", onLeave);
        pen.removeEventListener("load", placePenAtStart);
        tl.kill();
        ScrollTrigger.refresh();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="signature-section"
      style={{ position: "relative", zIndex: 35, isolation: "isolate" }}
    >
      <div id="sig-wrap">
        <svg
          id="sig-svg"
          viewBox="0 0 1536 1024"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="translate(0,1024) scale(0.1,-0.1)">
            {SIGNATURE_PATHS.map((d, i) => (
              <path
                key={i}
                id={`sp${i + 1}`}
                d={d}
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={7}
              />
            ))}
          </g>
        </svg>

        <Image
          id="pen-img"
          src="/NV-IMG/stylo.png"
          alt="pen"
          width={516}
          height={483}
          style={{
            position: "absolute",
            width: "140px",
            height: "auto",
            pointerEvents: "none",
            transformOrigin: "50% 97%",
            transform: "rotate(-38deg)",
            top: 0,
            left: 0,
            zIndex: 10,
            opacity: 0,
            filter: "drop-shadow(0 4px 18px rgba(0,0,0,.7))",
            willChange: "transform,left,top",
          }}
        />
      </div>

      <div className="sig-line" id="sig-line" />
    </section>
  );
}