import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import primaryLogo from "@/assets/prefud-full-logo-v2.png.asset.json";
import horizontalWhite from "@/assets/prefud-horizontal-white.png.asset.json";
import horizontalBlack from "@/assets/prefud-horizontal-black.png.asset.json";
import horizontalCitrus from "@/assets/prefud-horizontal-citrus.png.asset.json";
import horizontalAqua from "@/assets/prefud-horizontal-aqua.png.asset.json";
import horizontalDusk from "@/assets/prefud-horizontal-dusk.png.asset.json";
import logoDefault from "@/assets/logo-default.png.asset.json";
import logoCitrus from "@/assets/logo-citrus.png.asset.json";
import logoAqua from "@/assets/logo-aqua.png.asset.json";
import logoDusk from "@/assets/logo-dusk.png.asset.json";
import markDefault from "@/assets/isotype-default.png.asset.json";
import markCitrus from "@/assets/isotype-citrus.png.asset.json";
import markAqua from "@/assets/isotype-aqua.png.asset.json";
import markDusk from "@/assets/isotype-dusk.png.asset.json";

type ThemeKey = "default" | "citrus" | "aqua" | "dusk";

interface PaletteSwatch {
  name: string;
  hex: string;
  hsl: string;
  token: string;
}

interface Palette {
  id: ThemeKey;
  name: string;
  spanish: string;
  tagline: string;
  swatches: PaletteSwatch[];
}

const PALETTES: Palette[] = [
  {
    id: "default",
    name: "Classic Green",
    spanish: "Verde Corporativo",
    tagline: "The signature identity. Rooted, natural, trustworthy.",
    swatches: [
      { name: "Verde Teal Primario", hex: "#186047", hsl: "hsl(155, 60%, 24%)", token: "--primary" },
      { name: "Verde Oliva Secundario", hex: "#A4B237", hsl: "hsl(66, 53%, 46%)", token: "--accent" },
      { name: "Fondo de Papel", hex: "#F7F6F1", hsl: "hsl(48, 27%, 96%)", token: "--background" },
    ],
  },
  {
    id: "citrus",
    name: "Citrus Bloom",
    spanish: "Floración Cítrica Digital",
    tagline: "Bright, energetic, appetite-forward.",
    swatches: [
      { name: "Coral Cítrico", hex: "#FF7F50", hsl: "hsl(16, 100%, 66%)", token: "--primary" },
      { name: "Verde Lima Digital", hex: "#32CD32", hsl: "hsl(120, 61%, 50%)", token: "--accent" },
    ],
  },
  {
    id: "aqua",
    name: "Aquatic Flow",
    spanish: "Flujo Acuático de Bytes",
    tagline: "Calm, clear, technologically fresh.",
    swatches: [
      { name: "Teal Profundo", hex: "#008080", hsl: "hsl(180, 100%, 25%)", token: "--primary" },
      { name: "Azul Cielo Bytes", hex: "#87CEEB", hsl: "hsl(197, 71%, 73%)", token: "--accent" },
    ],
  },
  {
    id: "dusk",
    name: "Evening Flavors",
    spanish: "Sabores del Anochecer",
    tagline: "Rich, sophisticated, after-hours warmth.",
    swatches: [
      { name: "Púrpura Profundo", hex: "#800080", hsl: "hsl(300, 100%, 25%)", token: "--primary" },
      { name: "Bronce Cobrizo", hex: "#B87333", hsl: "hsl(30, 56%, 46%)", token: "--accent" },
    ],
  },
];

const HORIZONTAL_LOGOS: Array<{ theme: ThemeKey; label: string; asset: typeof logoDefault }> = [
  { theme: "default", label: "Classic Green", asset: logoDefault },
  { theme: "citrus", label: "Citrus Bloom", asset: logoCitrus },
  { theme: "aqua", label: "Aquatic Flow", asset: logoAqua },
  { theme: "dusk", label: "Evening Flavors", asset: logoDusk },
];

const LOGOMARKS: Array<{ theme: ThemeKey; label: string; asset: typeof markDefault }> = [
  { theme: "default", label: "Classic Green", asset: markDefault },
  { theme: "citrus", label: "Citrus Bloom", asset: markCitrus },
  { theme: "aqua", label: "Aquatic Flow", asset: markAqua },
  { theme: "dusk", label: "Evening Flavors", asset: markDusk },
];

const THEMED_HORIZONTAL: Array<{ theme: Exclude<ThemeKey, "default">; label: string; asset: typeof horizontalCitrus }> = [
  { theme: "citrus", label: "Citrus Bloom", asset: horizontalCitrus },
  { theme: "aqua", label: "Aquatic Flow", asset: horizontalAqua },
  { theme: "dusk", label: "Evening Flavors", asset: horizontalDusk },
];

const CheckerBg: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div
    className={`relative rounded-lg overflow-hidden flex items-center justify-center ${className}`}
    style={{
      backgroundImage:
        "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
      backgroundSize: "20px 20px",
      backgroundPosition: "0 0, 0 10px, 10px -10px, 10px 0",
    }}
  >
    {children}
  </div>
);

const DownloadButton: React.FC<{ url: string; filename: string; label?: string }> = ({ url, filename, label = "Download PNG" }) => (
  <a href={url} download={filename} target="_blank" rel="noreferrer">
    <Button size="sm" className="gap-2">
      <Download className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  </a>
);

const HexChip: React.FC<{ hex: string }> = ({ hex }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy hex ${hex}`}
      className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
      {hex}
    </button>
  );
};

const SwatchRow: React.FC<{ swatch: PaletteSwatch }> = ({ swatch }) => (
  <div className="flex items-center gap-3 py-2">
    <div
      className="h-12 w-12 rounded-md border border-border shadow-sm shrink-0"
      style={{ backgroundColor: swatch.hex }}
      aria-hidden="true"
    />
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium truncate">{swatch.name}</div>
      <div className="text-xs text-muted-foreground font-mono truncate">{swatch.hsl} · {swatch.token}</div>
    </div>
    <HexChip hex={swatch.hex} />
  </div>
);

const PaletteCard: React.FC<{ palette: Palette }> = ({ palette }) => (
  <div data-theme={palette.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
    <div className="p-6 bg-background">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h3 className="text-xl font-bold text-foreground">{palette.name}</h3>
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{palette.id}</span>
      </div>
      <p className="text-sm text-muted-foreground italic mb-1">{palette.spanish}</p>
      <p className="text-sm text-foreground/80 mb-4">{palette.tagline}</p>

      <div className="divide-y divide-border border-y border-border">
        {palette.swatches.map((s) => (
          <SwatchRow key={s.hex} swatch={s} />
        ))}
      </div>

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tokens in action</div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Primary</Button>
          <span className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
            Accent
          </span>
          <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">
            Secondary
          </span>
          <span
            className="inline-block h-8 w-8 rounded-full border-2"
            style={{ borderColor: "hsl(var(--ring))" }}
            aria-label="Ring color sample"
          />
        </div>
      </div>
    </div>
  </div>
);

const Brand: React.FC = () => {
  useDocumentTitle("Brand Manual");

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* Top nav */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to app
          </Link>
          <img
            src={primaryLogo.url}
            alt="Prefud"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Visual Identity · v1
        </div>
        <img
          src={primaryLogo.url}
          alt="Prefud"
          className="mx-auto max-h-24 sm:max-h-32 w-auto object-contain"
        />
        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold text-foreground">Brand Manual</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          A living reference for the Prefud visual system — logo variants, typography, and the four
          color palettes that adapt across every surface of the app.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20 pb-24">
        {/* Primary Logo */}
        <section aria-labelledby="primary-logo-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">01</div>
            <h2 id="primary-logo-heading" className="text-3xl font-bold">Primary Logo</h2>
            <p className="text-muted-foreground mt-1">
              The full lockup. Use whenever space and context allow.
            </p>
          </div>
          <Card className="p-6 sm:p-10">
            <CheckerBg className="min-h-[280px] p-8">
              <img
                src={primaryLogo.url}
                alt="Prefud primary logo"
                className="max-h-64 w-auto object-contain"
                loading="lazy"
              />
            </CheckerBg>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Transparent PNG · full lockup
              </div>
              <DownloadButton url={primaryLogo.url} filename="prefud-primary-logo.png" />
            </div>
          </Card>
        </section>

        {/* Horizontal Logo Variants */}
        <section aria-labelledby="horizontal-variants-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">02</div>
            <h2 id="horizontal-variants-heading" className="text-3xl font-bold">Horizontal Logo — Color / White / Black</h2>
            <p className="text-muted-foreground mt-1">
              Three flavors of the same lockup for every background. All transparent PNGs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-5">
              <CheckerBg className="h-40 p-4">
                <img src={primaryLogo.url} alt="Prefud horizontal color" className="max-h-full w-auto object-contain" loading="lazy" />
              </CheckerBg>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Color</div>
                  <div className="text-xs text-muted-foreground font-mono">on any light surface</div>
                </div>
                <DownloadButton url={primaryLogo.url} filename="prefud-horizontal-color.png" label="Download" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="rounded-lg overflow-hidden flex items-center justify-center h-40 p-4 bg-neutral-900">
                <img src={horizontalWhite.url} alt="Prefud horizontal white" className="max-h-full w-auto object-contain" loading="lazy" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">White</div>
                  <div className="text-xs text-muted-foreground font-mono">for dark backgrounds</div>
                </div>
                <DownloadButton url={horizontalWhite.url} filename="prefud-horizontal-white.png" label="Download" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="rounded-lg overflow-hidden flex items-center justify-center h-40 p-4 bg-neutral-100">
                <img src={horizontalBlack.url} alt="Prefud horizontal black" className="max-h-full w-auto object-contain" loading="lazy" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Black</div>
                  <div className="text-xs text-muted-foreground font-mono">for light backgrounds</div>
                </div>
                <DownloadButton url={horizontalBlack.url} filename="prefud-horizontal-black.png" label="Download" />
              </div>
            </Card>
          </div>

          <div className="mt-10">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Themed variants — isotype left, wordmark right
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {THEMED_HORIZONTAL.map((item) => (
                <Card key={item.theme} className="p-5">
                  <CheckerBg className="h-40 p-4">
                    <img
                      src={item.asset.url}
                      alt={`Prefud horizontal logo — ${item.label}`}
                      className="max-h-full w-auto object-contain"
                      loading="lazy"
                    />
                  </CheckerBg>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.theme}</div>
                    </div>
                    <DownloadButton
                      url={item.asset.url}
                      filename={`prefud-horizontal-${item.theme}.png`}
                      label="Download"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vertical Logos */}
        <section aria-labelledby="vertical-logo-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">03</div>
            <h2 id="vertical-logo-heading" className="text-3xl font-bold">Vertical Logos</h2>
            <p className="text-muted-foreground mt-1">
              Vertical lockups — bowl mark stacked above the Pacifico wordmark. One per palette theme.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {HORIZONTAL_LOGOS.map((item) => (
              <Card key={item.theme} className="p-5">
                <CheckerBg className="h-32 p-4">
                  <img
                    src={item.asset.url}
                    alt={`Prefud vertical logo — ${item.label}`}
                    className="max-h-20 w-auto object-contain"
                    loading="lazy"
                  />
                </CheckerBg>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">{item.theme}</div>
                  </div>
                  <DownloadButton
                    url={item.asset.url}
                    filename={`prefud-vertical-${item.theme}.png`}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Logomarks / Isotypes */}
        <section aria-labelledby="isotype-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">04</div>
            <h2 id="isotype-heading" className="text-3xl font-bold">Isotypes</h2>
            <p className="text-muted-foreground mt-1">
              The signature bowl mark on its own — no wordmark. One version per palette theme.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LOGOMARKS.map((item) => (
              <Card key={item.theme} className="p-5">
                <CheckerBg className="aspect-square p-4">
                  <img
                    src={item.asset.url}
                    alt={`Prefud isotype — ${item.label}`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </CheckerBg>
                <div className="mt-4">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground font-mono mb-3">{item.theme}</div>
                  <DownloadButton
                    url={item.asset.url}
                    filename={`prefud-isotype-${item.theme}.png`}
                    label="Download"
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section aria-labelledby="typography-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">05</div>
            <h2 id="typography-heading" className="text-3xl font-bold">Typography</h2>
            <p className="text-muted-foreground mt-1">
              Two typefaces carry the entire system. One sings, the other speaks clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-8">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-xl font-bold">Pacifico</h3>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Logo</span>
              </div>
              <div className="font-logo text-primary text-7xl sm:text-8xl leading-none mb-6">prefud</div>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>· Reserved for the logo wordmark.</li>
                <li>· Never body copy, never UI labels, never long headings.</li>
                <li>· Always lowercase.</li>
                <li>
                  · Tailwind utility: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">font-logo</code>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-xl font-bold">Montserrat</h3>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">UI</span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bold · 700 · H1–H3</div>
                  <div className="text-3xl font-bold">The quick brown fox</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Medium · 500 · H4–H6</div>
                  <div className="text-lg font-medium">The quick brown fox jumps</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Regular · 400 · Body</div>
                  <div className="text-base">
                    The quick brown fox jumps over the lazy dog — a full sentence at body size to
                    check rhythm and comfort.
                  </div>
                </div>
              </div>

              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>· All UI, headings, and body copy.</li>
                <li>
                  · Legacy aliases <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">font-inter</code> and{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">font-poppins</code> both resolve to Montserrat.
                </li>
                <li>· Minimum 16px on inputs to prevent iOS zoom.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Colors */}
        <section aria-labelledby="color-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">06</div>
            <h2 id="color-heading" className="text-3xl font-bold">Color System</h2>
            <p className="text-muted-foreground mt-1">
              Four palettes. Users pick their theme; every surface adapts through semantic tokens.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PALETTES.map((p) => (
              <PaletteCard key={p.id} palette={p} />
            ))}
          </div>
        </section>

        {/* Download summary */}
        <section aria-labelledby="downloads-heading">
          <div className="mb-6">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">07</div>
            <h2 id="downloads-heading" className="text-3xl font-bold">All Downloads</h2>
            <p className="text-muted-foreground mt-1">
              Every logo asset in one place.
            </p>
          </div>
          <Card className="p-6">
            <ul className="divide-y divide-border">
              <li className="flex items-center justify-between py-3 gap-3">
                <div>
                  <div className="font-medium">Primary Logo</div>
                  <div className="text-xs text-muted-foreground font-mono">prefud-primary-logo.png</div>
                </div>
                <DownloadButton url={primaryLogo.url} filename="prefud-primary-logo.png" />
              </li>
              <li className="flex items-center justify-between py-3 gap-3">
                <div>
                  <div className="font-medium">Horizontal — Color</div>
                  <div className="text-xs text-muted-foreground font-mono">prefud-horizontal-color.png</div>
                </div>
                <DownloadButton url={primaryLogo.url} filename="prefud-horizontal-color.png" label="Download" />
              </li>
              <li className="flex items-center justify-between py-3 gap-3">
                <div>
                  <div className="font-medium">Horizontal — White</div>
                  <div className="text-xs text-muted-foreground font-mono">prefud-horizontal-white.png</div>
                </div>
                <DownloadButton url={horizontalWhite.url} filename="prefud-horizontal-white.png" label="Download" />
              </li>
              <li className="flex items-center justify-between py-3 gap-3">
                <div>
                  <div className="font-medium">Horizontal — Black</div>
                  <div className="text-xs text-muted-foreground font-mono">prefud-horizontal-black.png</div>
                </div>
                <DownloadButton url={horizontalBlack.url} filename="prefud-horizontal-black.png" label="Download" />
              </li>
              {HORIZONTAL_LOGOS.map((item) => (
                <li key={`h-${item.theme}`} className="flex items-center justify-between py-3 gap-3">
                  <div>
                    <div className="font-medium">Vertical — {item.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      prefud-vertical-{item.theme}.png
                    </div>
                  </div>
                  <DownloadButton url={item.asset.url} filename={`prefud-vertical-${item.theme}.png`} label="Download" />
                </li>
              ))}
              {LOGOMARKS.map((item) => (
                <li key={`m-${item.theme}`} className="flex items-center justify-between py-3 gap-3">
                  <div>
                    <div className="font-medium">Isotype — {item.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      prefud-isotype-{item.theme}.png
                    </div>
                  </div>
                  <DownloadButton url={item.asset.url} filename={`prefud-isotype-${item.theme}.png`} label="Download" />
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <footer className="pt-8 border-t border-border text-center text-xs text-muted-foreground">
          © Prefud · Brand Manual · Please use these assets exactly as provided.
        </footer>
      </div>
    </main>
  );
};

export default Brand;