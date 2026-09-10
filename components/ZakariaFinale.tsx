// "use client";

// /**
//  * ZakariaFinale — portage de la section "ZAKARIA Finale" de legacy/index.html
//  * (script inline). Le nom "ZAKARIA" est dessiné/décoloré en boucle via GSAP
//  * dès que la section entre dans le viewport (IntersectionObserver).
//  */
// import { useEffect, useRef } from "react";
// import { gsap } from "@/lib/gsap";

// export default function ZakariaFinale() {
//   const sectionRef = useRef<HTMLElement>(null);
//   const revealRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const section = sectionRef.current;
//     const reveal = revealRef.current;
//     if (!reveal || !section || typeof gsap === "undefined") return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             reveal.style.opacity = "1";
//             reveal.style.transform = "translateY(0)";

//             if (!window.zakariaAnimLoop) {
//               window.zakariaAnimLoop = gsap.timeline({
//                 repeat: -1,
//                 repeatDelay: 1,
//               });

//               window.zakariaAnimLoop
//                 // 1. Dessin du contour gauche → droite
//                 .to(".draw-char", {
//                   strokeDashoffset: 0,
//                   duration: 2,
//                   stagger: 0.15,
//                   ease: "power2.inOut",
//                 })
//                 // 2. Remplissage blanc
//                 .to(
//                   ".draw-char",
//                   {
//                     fill: "#ffffff",
//                     stroke: "transparent",
//                     duration: 0.8,
//                     stagger: 0.1,
//                     ease: "power1.inOut",
//                     onStart: () => {
//                       document
//                         .querySelectorAll(".draw-char")
//                         .forEach((el) =>
//                           el.classList.add("filled-glow")
//                         );
//                     },
//                   },
//                   "-=1.2"
//                 )
//                 // 3. Pause
//                 .to({}, { duration: 2.5 })
//                 // 4. Effacement
//                 .to(".draw-char", {
//                   opacity: 0,
//                   duration: 0.8,
//                   stagger: 0.05,
//                   ease: "power2.inOut",
//                   onComplete: () => {
//                     gsap.set(".draw-char", {
//                       fill: "transparent",
//                       stroke: "white",
//                       strokeDashoffset: 1000,
//                     });
//                     document
//                       .querySelectorAll(".draw-char")
//                       .forEach((el) => el.classList.remove("filled-glow"));
//                   },
//                 })
//                 // 5. Réinitialisation instantanée de l'opacité
//                 .to(".draw-char", { opacity: 1, duration: 0 });
//             }
//           } else {
//             const rect = entry.boundingClientRect;
//             if (rect.top > 0) {
//               reveal.style.opacity = "0";
//               reveal.style.transform = "translateY(50px)";
//             }
//           }
//         });
//       },
//       { threshold: 0.1 }
//     );

//     observer.observe(section);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <section
//       ref={sectionRef}
//       className="w-full h-fit bg-black flex items-center justify-center relative overflow-clip py-8 md:py-12"
//       style={{ zIndex: 50 }}
//       id="zakaria-finale-section"
//     >
//       <div
//         ref={revealRef}
//         id="zakaria-reveal"
//         className="w-full px-2 md:px-4 flex justify-center"
//         style={{
//           opacity: 0,
//           transform: "translateY(50px)",
//           transition: "all 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
//         }}
//       >
//         <svg
//           viewBox="0 0 1500 220"
//           className="w-full h-auto overflow-visible select-none"
//         >
//           <text
//             x="50%"
//             y="55%"
//             textAnchor="middle"
//             dominantBaseline="middle"
//             className="font-sans font-[900] uppercase zakaria-svg-text"
//           >
//             <tspan className="draw-char">Z</tspan>
//             <tspan className="draw-char">A</tspan>
//             <tspan className="draw-char">K</tspan>
//             <tspan className="draw-char">A</tspan>
//             <tspan className="draw-char">R</tspan>
//             <tspan className="draw-char">I</tspan>
//             <tspan className="draw-char">A</tspan>
//           </text>
//         </svg>
//       </div>

//       <style>{`
//         .zakaria-svg-text {
//           font-size: 190px;
//           letter-spacing: 0.1em;
//         }
//         .draw-char {
//           fill: transparent;
//           stroke: white;
//           stroke-width: 2.5px;
//           stroke-dasharray: 1000;
//           stroke-dashoffset: 1000;
//           opacity: 1;
//           transition: filter 0.5s ease;
//         }
//         .draw-char.filled-glow {
//           filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
//         }
//       `}</style>
//     </section>
//   );
// }