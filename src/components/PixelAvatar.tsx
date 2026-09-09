import { useMemo } from "react";

// Sprite 16x16 — lutador em guarda, estilo pixel art.
// Paleta: . transparente | S pele | H cabelo | R faixa | W kimono | B faixa(lutador) | P calça | K pés | E olho
const SPRITE = [
  "................",
  ".....HHHHHH.....",
  "....HHHHHHHH....",
  "....SSSSSSSS....",
  "....SESSSSES....",
  "....SSSSSSSS....",
  "....RRRRRRRR....",
  "..WWWWWWWWWWWW..",
  ".SWWWWWWWWWWWWS.",
  "SWWWWWWWWWWWWWS",
  ".SWWWBBBBWWWWWS.",
  "..WWWBBBBWWWWW..",
  "...WWBBBBWWWW...",
  "....PPP..PPP....",
  "....PPP..PPP....",
  "....KKK..KKK....",
];

const STAGE_COLORS = [
  { band: "#e5e7eb", belt: "#e5e7eb", aura: null as string | null }, // calouro/branca
  { band: "#38bdf8", belt: "#38bdf8", aura: null }, // azul
  { band: "#a855f7", belt: "#a855f7", aura: null }, // roxa
  { band: "#b45309", belt: "#b45309", aura: null }, // marrom
  { band: "#111827", belt: "#111827", aura: "#facc15" }, // preta + dourado
  { band: "#111827", belt: "#facc15", aura: "#facc15" }, // mestre
];

interface Props {
  stage: number; // 0..5
  size?: number;
}

export function PixelAvatar({ stage, size = 128 }: Props) {
  const colors = STAGE_COLORS[Math.min(stage, STAGE_COLORS.length - 1)];
  const cells = 16;
  const px = size / cells;

  const rects = useMemo(() => {
    const out: React.ReactNode[] = [];
    SPRITE.forEach((row, y) => {
      row.split("").forEach((ch, x) => {
        if (ch === ".") return;
        const fill =
          ch === "S" ? "#f0c8a0" :
          ch === "H" ? "#26221f" :
          ch === "R" ? colors.band :
          ch === "W" ? "#f8fafc" :
          ch === "B" ? colors.belt :
          ch === "P" ? "#e2e8f0" :
          ch === "K" ? "#26221f" :
          ch === "E" ? "#1f2937" : "#000";
        out.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />);
      });
    });
    return out;
  }, [colors]);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {colors.aura && (
        <svg
          className="absolute inset-0 avatar-aura"
          viewBox={`0 0 ${cells} ${cells}`}
          width={size}
          height={size}
          style={{ imageRendering: "pixelated" }}
        >
          <rect x="2" y="4" width="12" height="11" fill={colors.aura} opacity="0.18" />
          <rect x="3" y="5" width="10" height="9" fill={colors.aura} opacity="0.22" />
          <rect x="1" y="7" width="14" height="7" fill={colors.aura} opacity="0.12" />
        </svg>
      )}
      <svg
        viewBox={`0 0 ${cells} ${cells}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
        style={{ imageRendering: "pixelated" }}
        className="relative"
      >
        {rects}
      </svg>
      {/* sombra pixelada no chão */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bg-black/40"
        style={{ bottom: -px * 0.6, width: size * 0.5, height: px * 0.7 }}
      />
    </div>
  );
}
