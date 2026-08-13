import type * as React from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const ACCENTS = [
  { liquid: "#8C9A7C", label: "#7C8A6E" }, // sage
  { liquid: "#D9C39F", label: "#C7AC7C" }, // champagne
  { liquid: "#C9A896", label: "#B78D76" }, // clay
  { liquid: "#B7C4B0", label: "#93A488" }, // soft mint-sage
  { liquid: "#DDBFA0", label: "#C7A377" }, // warm sand
];

function accentForId(id: string) {
  const n = parseInt(id, 10) || 0;
  return ACCENTS[n % ACCENTS.length];
}

function DropperBottle({ liquid, label }: { liquid: string; label: string }) {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="240" rx="52" ry="8" fill="#00000010" />
      <rect x="55" y="110" width="90" height="120" rx="14" fill="#ffffff" fillOpacity="0.55" stroke="#00000012" />
      <rect x="63" y="150" width="74" height="72" rx="8" fill={liquid} fillOpacity="0.55" />
      <rect x="70" y="130" width="60" height="34" rx="4" fill={label} />
      <rect x="78" y="139" width="44" height="4" rx="2" fill="#ffffff" fillOpacity="0.85" />
      <rect x="78" y="148" width="30" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.6" />
      <rect x="80" y="60" width="40" height="52" rx="6" fill="#e8e2d3" stroke="#00000010" />
      <rect x="86" y="34" width="28" height="30" rx="4" fill="#3a352f" />
      <rect x="94" y="18" width="12" height="20" rx="4" fill="#3a352f" />
    </svg>
  );
}

function JarBottle({ liquid, label }: { liquid: string; label: string }) {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="235" rx="62" ry="8" fill="#00000010" />
      <rect x="45" y="110" width="110" height="120" rx="20" fill="#ffffff" fillOpacity="0.55" stroke="#00000012" />
      <rect x="45" y="150" width="110" height="80" rx="16" fill={liquid} fillOpacity="0.45" />
      <rect x="70" y="165" width="60" height="34" rx="6" fill={label} />
      <rect x="78" y="174" width="44" height="4" rx="2" fill="#ffffff" fillOpacity="0.85" />
      <rect x="78" y="183" width="28" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.6" />
      <rect x="40" y="90" width="120" height="26" rx="10" fill="#e8e2d3" stroke="#00000010" />
    </svg>
  );
}

function TubeBottle({ liquid, label }: { liquid: string; label: string }) {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="240" rx="34" ry="6" fill="#00000010" />
      <path
        d="M78 60 h44 v40 c14 12 14 130 -6 130 h-32 c-20 0 -20 -118 -6 -130 z"
        fill="#ffffff"
        fillOpacity="0.6"
        stroke="#00000012"
      />
      <path
        d="M82 140 c-8 20 -8 68 2 82 h32 c10 -14 10 -62 2 -82 z"
        fill={liquid}
        fillOpacity="0.5"
      />
      <rect x="76" y="118" width="48" height="30" rx="6" fill={label} />
      <rect x="83" y="126" width="34" height="4" rx="2" fill="#ffffff" fillOpacity="0.85" />
      <rect x="82" y="40" width="36" height="24" rx="4" fill="#3a352f" />
    </svg>
  );
}

function BalmStick({ liquid, label }: { liquid: string; label: string }) {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="235" rx="26" ry="6" fill="#00000010" />
      <rect x="76" y="130" width="48" height="100" rx="10" fill={label} />
      <rect x="83" y="150" width="34" height="4" rx="2" fill="#ffffff" fillOpacity="0.8" />
      <path d="M78 130 q22 -30 44 0 z" fill="#f3ead9" stroke="#00000010" />
      <rect x="72" y="96" width="56" height="36" rx="8" fill="#ffffff" fillOpacity="0.6" stroke="#00000012" />
      <circle cx="100" cy="114" r="8" fill={liquid} fillOpacity="0.5" />
    </svg>
  );
}

function SetGroup({ liquid, label }: { liquid: string; label: string }) {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="240" rx="72" ry="8" fill="#00000010" />
      <g transform="translate(-38,20)">
        <rect x="55" y="130" width="60" height="90" rx="12" fill="#ffffff" fillOpacity="0.5" stroke="#00000010" />
        <rect x="60" y="160" width="50" height="55" rx="8" fill={liquid} fillOpacity="0.4" />
      </g>
      <g>
        <rect x="65" y="90" width="70" height="130" rx="14" fill="#ffffff" fillOpacity="0.65" stroke="#00000012" />
        <rect x="70" y="140" width="60" height="75" rx="10" fill={label} fillOpacity="0.55" />
        <rect x="80" y="60" width="40" height="34" rx="6" fill="#3a352f" />
      </g>
      <g transform="translate(38,20)">
        <rect x="55" y="130" width="60" height="90" rx="12" fill="#ffffff" fillOpacity="0.5" stroke="#00000010" />
        <rect x="60" y="160" width="50" height="55" rx="8" fill={label} fillOpacity="0.4" />
      </g>
    </svg>
  );
}

const VISUAL_BY_CATEGORY: Record<
  Product["category"],
  (props: { liquid: string; label: string }) => React.JSX.Element
> = {
  Serums: DropperBottle,
  Essences: DropperBottle,
  Moisturizers: JarBottle,
  Masks: JarBottle,
  "Eye Care": TubeBottle,
  Treatments: TubeBottle,
  "Lip Care": BalmStick,
  Sets: SetGroup,
};

export function ProductVisual({
  product,
  className,
}: {
  product: Pick<Product, "id" | "category">;
  className?: string;
}) {
  const accent = accentForId(product.id);
  const Visual = VISUAL_BY_CATEGORY[product.category];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-beige to-ivory",
        className
      )}
    >
      <div className="absolute inset-0 opacity-40" style={{
        background: `radial-gradient(circle at 30% 20%, ${accent.liquid}22, transparent 60%)`,
      }} />
      <div className="relative w-2/3 max-w-[180px] drop-shadow-[0_18px_24px_rgba(38,34,32,0.12)] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
        <Visual liquid={accent.liquid} label={accent.label} />
      </div>
    </div>
  );
}
