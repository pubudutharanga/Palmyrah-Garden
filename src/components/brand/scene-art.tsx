import type { SceneKey } from "@/content/rooms";
import { cn } from "@/lib/utils";

type PalmSpec = {
  x: number;
  y: number;
  scale: number;
  lean: number;
  opacity?: number;
  flip?: boolean;
};

type StructureKind =
  | "pavilion"
  | "cottage"
  | "church"
  | "temple"
  | "fort"
  | "baobab"
  | "pier"
  | "arches"
  | "chairs";

type LandscapeSpec = {
  kind: "landscape";
  sky: string[];
  horizon: number;
  sun?: { x: number; y: number; r: number; color?: string };
  water?: boolean;
  ground: string;
  palms: PalmSpec[];
  structure?: StructureKind;
  structureX?: number;
  structureScale?: number;
  palmColor?: string;
  birds?: boolean;
  dim?: number;
};

type WeaveSpec = {
  kind: "weave";
  base: string;
  strips: [string, string, string];
};

type InteriorSpec = {
  kind: "interior";
  wall: [string, string];
  floor: string;
  linen: string;
  accent: string;
};

type SceneSpec = LandscapeSpec | WeaveSpec | InteriorSpec;

const SCENES: Record<SceneKey, SceneSpec> = {
  "hero.dusk": {
    kind: "landscape",
    sky: ["#091815", "#17342c", "#7b5c33", "#ddaE65"],
    horizon: 560,
    sun: { x: 850, y: 570, r: 62, color: "#f0c782" },
    water: true,
    ground: "#0c1a15",
    palms: [
      { x: 80, y: 880, scale: 1.55, lean: 0.55 },
      { x: 250, y: 830, scale: 0.9, lean: 0.2, opacity: 0.8 },
      { x: 1120, y: 900, scale: 1.75, lean: -0.7 },
      { x: 990, y: 800, scale: 0.75, lean: -0.15, opacity: 0.7 },
    ],
    structure: "pavilion",
    structureX: 565,
    structureScale: 0.85,
    birds: true,
  },
  "story.garden": {
    kind: "landscape",
    sky: ["#dbe1d1", "#e9e3cc", "#dcc49b"],
    horizon: 590,
    sun: { x: 270, y: 430, r: 110, color: "#f6e4bc" },
    ground: "#33452f",
    palms: [
      { x: 100, y: 860, scale: 1.5, lean: 0.4 },
      { x: 1210, y: 880, scale: 1.7, lean: -0.5 },
      { x: 1000, y: 760, scale: 0.7, lean: -0.1, opacity: 0.65 },
      { x: 330, y: 740, scale: 0.55, lean: 0.15, opacity: 0.5 },
    ],
    structure: "arches",
    structureX: 610,
    structureScale: 0.9,
    birds: true,
  },
  "about.weave": {
    kind: "weave",
    base: "#20362b",
    strips: ["#C08A2E", "#8A6B35", "#E6E8DF"],
  },
  "rooms.garden.1": {
    kind: "landscape",
    sky: ["#d8dfd0", "#ede6cd", "#e2c89c"],
    horizon: 600,
    sun: { x: 900, y: 430, r: 95, color: "#f3dfb4" },
    ground: "#3a4c35",
    palms: [
      { x: 990, y: 880, scale: 1.45, lean: -0.45 },
      { x: 1120, y: 800, scale: 0.75, lean: -0.2, opacity: 0.7 },
      { x: 120, y: 800, scale: 0.7, lean: 0.2, opacity: 0.65 },
    ],
    structure: "pavilion",
    structureX: 470,
    structureScale: 1.15,
    birds: true,
  },
  "rooms.garden.2": {
    kind: "landscape",
    sky: ["#e5e6d5", "#efe5cb", "#dcc59b"],
    horizon: 620,
    ground: "#41533a",
    palms: [
      { x: 190, y: 900, scale: 1.6, lean: 0.4 },
      { x: 1050, y: 900, scale: 1.45, lean: -0.4 },
    ],
    structure: "chairs",
    structureX: 600,
    structureScale: 1,
    palmColor: "#22331f",
  },
  "rooms.garden.3": {
    kind: "interior",
    wall: ["#e8e6d9", "#c9cdbc"],
    floor: "#8b6f4c",
    linen: "#f6f4ea",
    accent: "#3f6b4b",
  },
  "rooms.deluxe.1": {
    kind: "landscape",
    sky: ["#e3dfcb", "#efe2c4", "#d2a96c"],
    horizon: 610,
    sun: { x: 220, y: 470, r: 90, color: "#f7e3b3" },
    ground: "#5a5340",
    palms: [
      { x: 1070, y: 870, scale: 1.5, lean: -0.55 },
      { x: 120, y: 760, scale: 0.6, lean: 0.2, opacity: 0.6 },
    ],
    structure: "arches",
    structureX: 555,
    structureScale: 1.25,
  },
  "rooms.deluxe.2": {
    kind: "interior",
    wall: ["#e6e0cf", "#c8c0aa"],
    floor: "#7a5b3c",
    linen: "#f5f2e6",
    accent: "#2f7a7c",
  },
  "rooms.deluxe.3": {
    kind: "landscape",
    sky: ["#e7e0c9", "#e8d6b3", "#c99a5d"],
    horizon: 650,
    ground: "#5c513a",
    palms: [
      { x: 160, y: 900, scale: 1.3, lean: 0.3 },
      { x: 1090, y: 860, scale: 1.2, lean: -0.3 },
    ],
    structure: "arches",
    structureX: 620,
    structureScale: 1.5,
    palmColor: "#3b3524",
  },
  "rooms.cottage.1": {
    kind: "landscape",
    sky: ["#1a2b24", "#3c4c39", "#bd8a44"],
    horizon: 600,
    sun: { x: 920, y: 520, r: 58, color: "#efc88a" },
    ground: "#17251b",
    palms: [
      { x: 120, y: 880, scale: 1.5, lean: 0.5 },
      { x: 1100, y: 900, scale: 1.6, lean: -0.5 },
    ],
    structure: "cottage",
    structureX: 600,
    structureScale: 1.25,
    birds: true,
  },
  "rooms.cottage.2": {
    kind: "landscape",
    sky: ["#e6e2d0", "#ebe0c5", "#d3b17c"],
    horizon: 640,
    ground: "#4b5439",
    palms: [
      { x: 1050, y: 900, scale: 1.5, lean: -0.4 },
      { x: 160, y: 820, scale: 0.7, lean: 0.2, opacity: 0.6 },
    ],
    structure: "cottage",
    structureX: 560,
    structureScale: 1.55,
  },
  "rooms.family.1": {
    kind: "landscape",
    sky: ["#dfe3d2", "#ece3c9", "#d5b884"],
    horizon: 610,
    sun: { x: 820, y: 440, r: 90, color: "#f4e2b9" },
    ground: "#48533a",
    palms: [
      { x: 100, y: 880, scale: 1.35, lean: 0.4 },
      { x: 1120, y: 890, scale: 1.5, lean: -0.45 },
    ],
    structure: "pavilion",
    structureX: 590,
    structureScale: 1.45,
    birds: true,
  },
  "rooms.family.2": {
    kind: "interior",
    wall: ["#e9e5d4", "#cfc8b4"],
    floor: "#8a6a46",
    linen: "#f7f4e9",
    accent: "#c08a2e",
  },
  "rooms.villa.1": {
    kind: "landscape",
    sky: ["#101f1a", "#37493b", "#9c6e40", "#e2b878"],
    horizon: 580,
    sun: { x: 760, y: 540, r: 66, color: "#f2cf94" },
    water: false,
    ground: "#16241b",
    palms: [
      { x: 140, y: 900, scale: 1.35, lean: 0.4, opacity: 0.9 },
      { x: 1100, y: 920, scale: 1.6, lean: -0.5 },
    ],
    structure: "chairs",
    structureX: 610,
    structureScale: 1.3,
    birds: true,
  },
  "rooms.villa.2": {
    kind: "interior",
    wall: ["#e4ddca", "#beb39a"],
    floor: "#6c5237",
    linen: "#f4f0e2",
    accent: "#3f6b4b",
  },
  "rooms.villa.3": {
    kind: "landscape",
    sky: ["#0e1d18", "#26443a", "#a47442", "#e7bc7c"],
    horizon: 580,
    sun: { x: 320, y: 550, r: 70, color: "#f4d29b" },
    water: true,
    ground: "#12211a",
    palms: [
      { x: 1010, y: 900, scale: 1.7, lean: -0.55 },
      { x: 870, y: 790, scale: 0.7, lean: -0.2, opacity: 0.7 },
    ],
    birds: true,
  },
  "explore.madhu": {
    kind: "landscape",
    sky: ["#c8d2c9", "#e6dfc8", "#d7bd91"],
    horizon: 640,
    sun: { x: 260, y: 390, r: 100, color: "#f2e5c7" },
    ground: "#36452f",
    palms: [
      { x: 100, y: 880, scale: 1.3, lean: 0.3 },
      { x: 1100, y: 900, scale: 1.6, lean: -0.4 },
      { x: 980, y: 780, scale: 0.6, lean: -0.1, opacity: 0.6 },
    ],
    structure: "church",
    structureX: 620,
    structureScale: 1.1,
    birds: true,
  },
  "explore.temple": {
    kind: "landscape",
    sky: ["#e5d9bf", "#ecd3a7", "#c99756"],
    horizon: 660,
    sun: { x: 930, y: 520, r: 75, color: "#f7e2b0" },
    ground: "#4d4a31",
    palms: [
      { x: 120, y: 900, scale: 1.4, lean: 0.35 },
      { x: 1080, y: 890, scale: 1.2, lean: -0.3 },
    ],
    structure: "temple",
    structureX: 590,
    structureScale: 1.2,
  },
  "explore.vankalai": {
    kind: "landscape",
    sky: ["#d4ddd5", "#e8e7d6", "#dccaa4"],
    horizon: 560,
    sun: { x: 720, y: 400, r: 70, color: "#f4e6c8" },
    water: true,
    ground: "#4a5342",
    palms: [
      { x: 1080, y: 800, scale: 0.85, lean: -0.2 },
      { x: 130, y: 780, scale: 0.55, lean: 0.1, opacity: 0.6 },
    ],
    birds: true,
    structure: "pier",
    structureX: 840,
    structureScale: 0.8,
  },
  "explore.fort": {
    kind: "landscape",
    sky: ["#d5d9c9", "#e7ddc6", "#cbaa76"],
    horizon: 560,
    sun: { x: 310, y: 440, r: 80, color: "#f3e1bd" },
    water: true,
    ground: "#3b4634",
    palms: [
      { x: 1080, y: 820, scale: 0.8, lean: -0.2, opacity: 0.8 },
    ],
    structure: "fort",
    structureX: 620,
    structureScale: 1.4,
    birds: true,
  },
  "explore.baobab": {
    kind: "landscape",
    sky: ["#d9d5c0", "#e9d3aa", "#c98a4c"],
    horizon: 650,
    sun: { x: 940, y: 600, r: 85, color: "#f6d79d" },
    ground: "#4a4430",
    palms: [
      { x: 140, y: 890, scale: 1.15, lean: 0.3, opacity: 0.75 },
      { x: 1090, y: 900, scale: 1.3, lean: -0.35, opacity: 0.8 },
    ],
    structure: "baobab",
    structureX: 620,
    structureScale: 1.15,
    birds: true,
  },
  "explore.talaimannar": {
    kind: "landscape",
    sky: ["#cfd8d0", "#e8dfc8", "#d8b980"],
    horizon: 590,
    sun: { x: 280, y: 470, r: 65, color: "#f6e6c4" },
    water: true,
    ground: "#46503e",
    palms: [
      { x: 100, y: 830, scale: 0.75, lean: 0.15, opacity: 0.7 },
    ],
    structure: "pier",
    structureX: 640,
    structureScale: 1.05,
    birds: true,
  },
  "gallery.1": {
    kind: "landscape",
    sky: ["#0c1c18", "#2a4439", "#b07d45", "#ecc98c"],
    horizon: 590,
    sun: { x: 600, y: 545, r: 60, color: "#f4d49c" },
    water: true,
    ground: "#101f18",
    palms: [
      { x: 1000, y: 900, scale: 1.65, lean: -0.5 },
      { x: 150, y: 780, scale: 0.7, lean: 0.15, opacity: 0.7 },
    ],
    birds: true,
  },
  "gallery.2": {
    kind: "weave",
    base: "#31452f",
    strips: ["#E6E8DF", "#C08A2E", "#20362b"],
  },
  "gallery.3": {
    kind: "landscape",
    sky: ["#d8dfd3", "#ece5cf", "#dcc297"],
    horizon: 600,
    sun: { x: 780, y: 450, r: 85, color: "#f6e6c1" },
    water: true,
    ground: "#48523e",
    palms: [{ x: 120, y: 830, scale: 0.8, lean: 0.2 }],
    birds: true,
    structure: "pier",
    structureX: 880,
    structureScale: 0.7,
  },
  "gallery.4": {
    kind: "interior",
    wall: ["#e7e2d1", "#c9c2ae"],
    floor: "#80613f",
    linen: "#f6f3e8",
    accent: "#2f7a7c",
  },
  "gallery.5": {
    kind: "landscape",
    sky: ["#ded5bb", "#ecd0a0", "#c48745"],
    horizon: 650,
    ground: "#494230",
    palms: [
      { x: 1080, y: 900, scale: 1.25, lean: -0.35, opacity: 0.8 },
    ],
    structure: "baobab",
    structureX: 520,
    structureScale: 1.3,
    birds: true,
  },
  "gallery.6": {
    kind: "landscape",
    sky: ["#0f1f19", "#324a3e", "#8d6840", "#d9ae72"],
    horizon: 600,
    sun: { x: 900, y: 565, r: 55, color: "#f2ce92" },
    ground: "#122119",
    palms: [
      { x: 170, y: 900, scale: 1.45, lean: 0.45 },
      { x: 1060, y: 760, scale: 0.65, lean: -0.15, opacity: 0.65 },
    ],
    structure: "pavilion",
    structureX: 600,
    structureScale: 1,
  },
};

function Palm({
  x,
  y,
  scale,
  lean,
  color,
  opacity = 1,
  flip = false,
}: PalmSpec & { color: string }) {
  const tipX = 30 + lean * 120;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
      fill={color}
      opacity={opacity}
    >
      <path
        d={`M0 0C${-4 + lean * 20} -70 ${-14 + lean * 55} -150 ${tipX} -238`}
        stroke={color}
        strokeWidth={7 / scale}
        strokeLinecap="round"
        fill="none"
      />
      <g transform={`translate(${tipX} -238)`}>
        {[
          [-84, 0.72],
          [-58, 0.9],
          [-34, 1.05],
          [-12, 0.95],
          [12, 0.8],
          [38, 0.7],
        ].map(([angle, length], index) => (
          <path
            key={index}
            d={`M0 0C${32 * length} ${-26 * length} ${92 * length} ${-30 * length} ${
              148 * length
            } ${-10 * length}C${94 * length} ${6 * length} ${38 * length} ${
              10 * length
            } 0 0Z`}
            transform={`rotate(${angle})`}
          />
        ))}
        <path
          d="M2 0C-8 -30 -2 -62 4 -88C10 -60 12 -28 2 0Z"
          transform="rotate(-3)"
        />
        <circle cx={-2} cy={18} r={7} />
        <circle cx={12} cy={20} r={6} />
      </g>
    </g>
  );
}

function Structure({
  kind,
  x,
  scale,
  baseY,
  dim,
}: {
  kind: StructureKind;
  x: number;
  scale: number;
  baseY: number;
  dim: number;
}) {
  const dark = `rgba(9, 20, 16, ${0.86 * dim})`;
  const glow = `rgba(232, 185, 107, ${0.75 * dim})`;

  if (kind === "pavilion") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-180 0V-118H180V0" fill={dark} />
        <path d="M-212 -118L0 -172L212 -118Z" fill={dark} />
        <path d="M-128 -46H-62V0H-128Z" fill={glow} opacity="0.55" />
        <path d="M62 -46H128V0H62Z" fill={glow} opacity="0.35" />
        <path d="M-6 -86V0" stroke={dark} strokeWidth="5" />
      </g>
    );
  }

  if (kind === "cottage") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-155 0V-96H155V0" fill={dark} />
        <path d="M-205 -96L0 -200L205 -96L168 -76L0 -156L-168 -76Z" fill={dark} />
        <path d="M-34 -50H2V0H-34Z" fill={glow} opacity="0.6" />
        <path d="M64 -62H112V-24H64Z" fill={glow} opacity="0.4" />
        <path d="M-125 -78V0" stroke={glow} strokeWidth="2" opacity="0.3" />
      </g>
    );
  }

  if (kind === "church") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-180 0V-130H120V0" fill={dark} />
        <path d="M-38 -130V-230H38V-130" fill={dark} />
        <path d="M0 -230V-270M-12 -256H12" stroke={dark} strokeWidth="5" />
        <path d="M-30 -18H18V0H-30Z" fill={glow} opacity="0.55" />
        <path d="M76 -82H112V-42H76Z" fill={glow} opacity="0.35" />
        <path d="M-120 -150L-190 -110" stroke={dark} strokeWidth="9" />
      </g>
    );
  }

  if (kind === "temple") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-170 0V-40H170V0" fill={dark} />
        <path d="M-120 -40V-96H120V-40" fill={dark} />
        <path d="M-92 -96V-150H92V-96" fill={dark} />
        <path d="M-64 -150V-204H64V-150" fill={dark} />
        <path d="M-36 -204V-252H36V-204" fill={dark} />
        <path d="M-14 -252L0 -300L14 -252Z" fill={dark} />
        <path d="M-18 -8H18V0H-18Z" fill={glow} opacity="0.5" />
        <path d="M-10 -60V-76M10 -60V-76" stroke={glow} strokeWidth="2" opacity="0.4" />
      </g>
    );
  }

  if (kind === "fort") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-260 0V-92H260V0Z" fill={dark} />
        {Array.from({ length: 9 }, (_, index) => (
          <path
            key={index}
            d={`M${-250 + index * 60} -92H${-220 + index * 60}V-116H${-250 + index * 60}Z`}
            fill={dark}
          />
        ))}
        <path d="M-40 -48H30V0H-40Z" fill={glow} opacity="0.25" />
        <path d="M-260 -40H-300V0H-260Z" fill={dark} />
      </g>
    );
  }

  if (kind === "baobab") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path
          d="M-72 0C-58 -80 -66 -160 -40 -230C-20 -180 -8 -120 -6 -60C8 -140 28 -200 64 -260C68 -180 50 -100 30 0Z"
          fill={dark}
        />
        <path
          d="M-36 -214C-120 -266 -190 -286 -256 -278M-20 -238C-70 -310 -90 -360 -86 -404M24 -252C76 -320 132 -356 188 -370M8 -220C68 -256 128 -270 196 -262"
          stroke={dark}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M-256 -278C-282 -290 -300 -310 -312 -332M188 -370C214 -380 238 -398 252 -420M-86 -404C-96 -424 -96 -446 -88 -466"
          stroke={dark}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M-40 -20V0H40V-20" fill={glow} opacity="0.15" />
      </g>
    );
  }

  if (kind === "pier") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-210 -10H210V4H-210Z" fill={dark} />
        <path d="M-150 -10V54M-60 -10V54M30 -10V54M120 -10V54" stroke={dark} strokeWidth="7" />
        <path d="M-210 -24H-190V0H-210Z" fill={dark} />
        <path d="M180 -50V-10" stroke={dark} strokeWidth="5" />
      </g>
    );
  }

  if (kind === "arches") {
    return (
      <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
        <path d="M-230 0V-210H230V0H176V-210H-176V0Z" fill={dark} opacity="0.2" />
        <path
          d="M-190 0V-130C-190 -182 -144 -214 -92 -214C-40 -214 6 -182 6 -130V0H-44V-130C-44 -156 -66 -172 -92 -172C-118 -172 -140 -156 -140 -130V0Z"
          fill={dark}
        />
        <path
          d="M76 0V-150C76 -194 114 -220 158 -220C202 -220 240 -194 240 -150V0H196V-150C196 -172 180 -184 158 -184C136 -184 120 -172 120 -150V0Z"
          fill={dark}
        />
        <path d="M-92 -190V-214M158 -196V-220" stroke={dark} strokeWidth="4" />
        <path d="M-140 -30H-44V0H-140Z" fill={glow} opacity="0.18" />
        <path d="M120 -40H196V0H120Z" fill={glow} opacity="0.14" />
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
      <path d="M-92 -30H-40V0H-92Z" fill={dark} />
      <path d="M40 -30H92V0H40Z" fill={dark} />
      <path d="M-104 -30H-28V-44H-104Z" fill={dark} opacity="0.85" />
      <path d="M28 -30H104V-44H28Z" fill={dark} opacity="0.85" />
      <path d="M-14 -18H14V0H-14Z" fill={dark} opacity="0.8" />
    </g>
  );
}

function Landscape({ spec, uid }: { spec: LandscapeSpec; uid: string }) {
  const horizon = spec.horizon;
  const palmColor = spec.palmColor ?? "#10231a";
  const dim = spec.dim ?? 1;
  return (
    <>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.sky[0]} />
          <stop offset="42%" stopColor={spec.sky[1]} />
          <stop offset="72%" stopColor={spec.sky[2]} />
          <stop offset="100%" stopColor={spec.sky[3] ?? spec.sky[2]} />
        </linearGradient>
        <radialGradient id={`sun-${uid}`}>
          <stop offset="0%" stopColor={spec.sun?.color ?? "#f5dfb0"} stopOpacity="0.85" />
          <stop offset="100%" stopColor={spec.sun?.color ?? "#f5dfb0"} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7d663f" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#12231c" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`vignette-${uid}`} cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
        </radialGradient>
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="1200" height="800" fill={`url(#sky-${uid})`} />

      {spec.sun ? (
        <>
          <circle
            cx={spec.sun.x}
            cy={spec.sun.y}
            r={spec.sun.r * 3.6}
            fill={`url(#sun-${uid})`}
          />
          <circle
            cx={spec.sun.x}
            cy={spec.sun.y}
            r={spec.sun.r}
            fill={spec.sun.color ?? "#f5dfb0"}
            opacity="0.9"
          />
        </>
      ) : null}

      {spec.water ? (
        <>
          <rect
            y={horizon}
            width="1200"
            height={800 - horizon}
            fill={`url(#water-${uid})`}
          />
          <path
            d={`M0 ${horizon + 14}H1200M0 ${horizon + 38}H1200M0 ${horizon + 68}H1200`}
            stroke="#f4d7a4"
            strokeOpacity="0.18"
            strokeWidth="2"
          />
          {Array.from({ length: 14 }, (_, index) => (
            <path
              key={index}
              d={`M${(index * 97) % 1100} ${horizon + 30 + (index % 5) * 26}h${40 + (index % 4) * 30}`}
              stroke="#f6e3bd"
              strokeOpacity="0.13"
              strokeWidth="1.5"
            />
          ))}
        </>
      ) : (
        <rect
          y={horizon}
          width="1200"
          height={800 - horizon}
          fill={spec.ground}
        />
      )}

      {spec.water ? (
        <rect y={horizon + 150} width="1200" height={800 - horizon - 150} fill={spec.ground} opacity="0.92" />
      ) : null}

      {spec.structure ? (
        <Structure
          kind={spec.structure}
          x={spec.structureX ?? 600}
          scale={spec.structureScale ?? 1}
          baseY={horizon + (spec.water ? 152 : 30)}
          dim={dim}
        />
      ) : null}

      {spec.palms.map((palm, index) => (
        <Palm key={index} {...palm} color={palmColor} />
      ))}

      {spec.birds ? (
        <g stroke="#1d3128" strokeOpacity="0.6" strokeWidth="2" fill="none">
          <path d="M360 210c8-8 16-8 24 0c8-8 16-8 24 0" />
          <path d="M520 150c6-6 12-6 18 0c6-6 12-6 18 0" />
          <path d="M660 250c5-5 10-5 15 0c5-5 10-5 15 0" />
        </g>
      ) : null}

      <rect width="1200" height="800" fill={`url(#vignette-${uid})`} />
      <rect
        width="1200"
        height="800"
        filter={`url(#grain-${uid})`}
        opacity="0.09"
        style={{ mixBlendMode: "overlay" }}
      />
    </>
  );
}

function Weave({ spec, uid }: { spec: WeaveSpec; uid: string }) {
  return (
    <>
      <defs>
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
        </filter>
        <radialGradient id={`vignette-${uid}`} cx="50%" cy="45%" r="80%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill={spec.base} />
      {Array.from({ length: 14 }, (_, row) =>
        Array.from({ length: 18 }, (_, column) => {
          const even = (row + column) % 2 === 0;
          const color = even ? spec.strips[0] : spec.strips[1];
          return (
            <g key={`${row}-${column}`} opacity={even ? 0.92 : 0.78}>
              <path
                d={`M${column * 80 - 40} ${row * 64}l70 -34l40 22l-70 34Z`}
                fill={color}
                opacity={even ? 0.16 : 0.1}
              />
              <path
                d={`M${column * 80 - 40} ${row * 64}l70 -34`}
                stroke={spec.strips[2]}
                strokeOpacity="0.08"
                strokeWidth="2"
              />
            </g>
          );
        }),
      )}
      <path
        d="M0 640C260 570 470 700 720 620C930 552 1090 610 1200 580V800H0Z"
        fill={spec.strips[2]}
        opacity="0.06"
      />
      <rect width="1200" height="800" fill={`url(#vignette-${uid})`} />
      <rect
        width="1200"
        height="800"
        filter={`url(#grain-${uid})`}
        opacity="0.12"
        style={{ mixBlendMode: "overlay" }}
      />
    </>
  );
}

function Interior({ spec, uid }: { spec: InteriorSpec; uid: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`wall-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={spec.wall[0]} />
          <stop offset="100%" stopColor={spec.wall[1]} />
        </linearGradient>
        <linearGradient id={`window-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8dccb" />
          <stop offset="55%" stopColor="#e7d9ba" />
          <stop offset="100%" stopColor="#b98d55" />
        </linearGradient>
        <linearGradient id={`floor-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={spec.floor} />
          <stop offset="100%" stopColor="#3c2f21" />
        </linearGradient>
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="1200" height="800" fill={`url(#wall-${uid})`} />
      <rect y="640" width="1200" height="160" fill={`url(#floor-${uid})`} />

      <path
        d="M690 640V300C690 208 762 140 850 140C938 140 1010 208 1010 300V640Z"
        fill={`url(#window-${uid})`}
      />
      <path
        d="M700 640V304C700 220 764 158 850 158C936 158 1000 220 1000 304V640"
        fill="none"
        stroke={spec.accent}
        strokeOpacity="0.28"
        strokeWidth="10"
      />
      <path d="M850 158V640M700 410H1000" stroke={spec.accent} strokeOpacity="0.22" strokeWidth="5" />

      <g opacity="0.85">
        <path
          d="M810 620V300C810 300 810 260 850 260C890 260 890 300 890 300V620"
          stroke="#28402f"
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />
        <path d="M850 262C820 240 790 238 762 246C786 258 816 266 850 272" fill="#28402f" opacity="0.5" />
        <path d="M850 262C880 240 910 238 938 246C914 258 884 266 850 272" fill="#28402f" opacity="0.5" />
      </g>

      <path d="M700 640H1000V700H700Z" fill="#f2e6ce" opacity="0.08" />
      <path d="M738 650L900 470H1112L950 650Z" fill="#f7e2b4" opacity="0.16" />

      <g>
        <path d="M80 640H600V700H80Z" fill={spec.linen} opacity="0.8" />
        <path d="M104 700H580V800H104Z" fill="#2c241a" opacity="0.55" />
        <path d="M80 640H600V668H80Z" fill="#ffffff" opacity="0.28" />
        <path d="M118 560H330V640H118Z" fill={spec.linen} opacity="0.92" />
        <path d="M118 560H330V588H118Z" fill="#ffffff" opacity="0.35" />
        <path d="M360 570H520V640H360Z" fill={spec.accent} opacity="0.25" />
        <path d="M64 700H620" stroke="#20180f" strokeOpacity="0.4" strokeWidth="4" />
      </g>

      <g>
        <path d="M560 520C560 500 620 500 620 520" stroke="#3c2f21" strokeWidth="3" fill="none" />
        <path d="M580 520V560H600V520" fill="#3c2f21" opacity="0.7" />
        <circle cx="590" cy="528" r="14" fill="#f6e7c4" opacity="0.8" />
        <circle cx="590" cy="528" r="30" fill="#f6e7c4" opacity="0.12" />
      </g>

      <rect width="1200" height="800" fill="#000" opacity="0.04" />
      <rect
        width="1200"
        height="800"
        filter={`url(#grain-${uid})`}
        opacity="0.1"
        style={{ mixBlendMode: "multiply" }}
      />
    </>
  );
}

export function SceneArt({
  scene,
  className,
}: {
  scene: SceneKey;
  className?: string;
}) {
  const spec = SCENES[scene];
  const uid = scene.replaceAll(".", "-");
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      {spec.kind === "landscape" ? <Landscape spec={spec} uid={uid} /> : null}
      {spec.kind === "weave" ? <Weave spec={spec} uid={uid} /> : null}
      {spec.kind === "interior" ? <Interior spec={spec} uid={uid} /> : null}
    </svg>
  );
}
