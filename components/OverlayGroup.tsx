"use client";

/**
 * OverlayGroup — composants non essentiels au premier rendu, chargés en
 * différé (next/dynamic + ssr:false) pour ne pas alourdir le bundle initial :
 *  - CustomCursor : curseur custom (only pointer:fine), GSAP différé
 *  - ScrollTopButton : bouton retour-haut (n'apparaît qu'après 500px scroll)
 */
import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

const ScrollTopButton = dynamic(() => import("@/components/ScrollTopButton"), {
  ssr: false,
});

export default function OverlayGroup() {
  return (
    <>
      <CustomCursor />
      <ScrollTopButton />
    </>
  );
}