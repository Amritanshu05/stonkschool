type ClassValue = string | number | null | false | undefined | ClassValue[];

/** Tiny class-name joiner. Avoids pulling in clsx/twMerge for the MVP. */
export function cn(...args: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (Array.isArray(v)) {
      for (const x of v) walk(x);
      return;
    }
    if (typeof v === "string" || typeof v === "number") out.push(String(v));
  };
  walk(args);
  return out.join(" ");
}
