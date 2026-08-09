// Adversarial fixtures — not part of the good/bad regression sweep in
// detect.test.mjs. These exist to document known bypasses of the
// DS-SLOP-002 (AI-gradient) regex, not to assert "must always fire."
// See detect.test.mjs's adversarial block for what each one proves.

export function ArbitraryHexGradient() {
  // Same purple->blue AI gradient as bad.tsx's DS-SLOP-002 case, but spelled
  // with arbitrary hex values instead of named Tailwind palette classes.
  // registry.mjs's DS-SLOP-002 pattern only matches `from-<hue>-<shade>` /
  // `to-<hue>-<shade>` against a fixed hue-name list — it has no color-space
  // math to recognize that #7c3aed and #3b82f6 are the same purple/blue
  // family. This bypasses the detector while producing an identical result.
  return <div className="bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]" />;
}
