import { PalmMark } from "@/components/brand/logo";

export function PrototypeRibbon() {
  if (process.env.NEXT_PUBLIC_PROTOTYPE_MODE === "false") return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 hidden sm:block">
      <p className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-salt/15 bg-ink/92 px-3 py-1.5 text-[11px] leading-none text-salt/75 shadow-lift backdrop-blur">
        <PalmMark className="h-3 w-3" />
        Prototype: sample content and demo data
      </p>
    </div>
  );
}
