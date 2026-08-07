// ari.mjs — computes the Automated Readability Index (ARI) and grade level
// for a piece of copy, matching the formula and grade table in SKILL.md.
//
// Usage:
//   node ari.mjs "Your copy text here"
//   node ari.mjs --before "old copy" --after "new copy"
//   echo "Your copy text here" | node ari.mjs

const GRADE_TABLE = [
  { grade: "Kindergarten", age: "5–6" },
  { grade: "Grade 1", age: "6–7" },
  { grade: "Grade 2", age: "7–8" },
  { grade: "Grade 3", age: "8–9" },
  { grade: "Grade 4", age: "9–10" },
  { grade: "Grade 5", age: "10–11" },
  { grade: "Grade 6", age: "11–12" },
  { grade: "Grade 7", age: "12–13" },
  { grade: "Grade 8", age: "13–14" },
  { grade: "Grade 9", age: "14–15" },
  { grade: "Grade 10", age: "15–16" },
  { grade: "Grade 11", age: "16–17" },
  { grade: "Grade 12", age: "17–18" },
];

function gradeForAri(ari) {
  const rounded = Math.max(1, Math.round(ari));
  if (rounded > GRADE_TABLE.length) {
    return { grade: "Professional", age: "18+" };
  }
  return GRADE_TABLE[rounded - 1];
}

export function computeReadability(text) {
  const trimmed = (text ?? "").trim();

  const words = trimmed.length === 0 ? [] : trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const characterCount = (trimmed.match(/[A-Za-z0-9]/g) || []).length;

  const sentenceMatches = trimmed.match(/[^.!?]*[.!?]+/g);
  const sentenceCount = sentenceMatches
    ? sentenceMatches.filter((s) => s.trim().length > 0).length
    : wordCount > 0
      ? 1
      : 0;

  if (wordCount === 0 || sentenceCount === 0) {
    return { wordCount, characterCount, sentenceCount, ari: 0, grade: "N/A", age: "N/A" };
  }

  const rawAri =
    4.71 * (characterCount / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;
  const ari = Math.round(rawAri * 10) / 10;
  const { grade, age } = gradeForAri(ari);

  return { wordCount, characterCount, sentenceCount, ari, grade, age };
}

function formatMetrics(m) {
  return `Word count: ${m.wordCount}\nARI score: ${m.ari}\nGrade level: ${m.grade} (age ${m.age})`;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const beforeIdx = args.indexOf("--before");
  const afterIdx = args.indexOf("--after");

  if (beforeIdx !== -1 && afterIdx !== -1) {
    const before = args[beforeIdx + 1];
    const after = args[afterIdx + 1];
    const beforeMetrics = computeReadability(before);
    const afterMetrics = computeReadability(after);
    console.log(`Before:\n${formatMetrics(beforeMetrics)}\n`);
    console.log(`After:\n${formatMetrics(afterMetrics)}\n`);
    console.log(
      `Word count: ${beforeMetrics.wordCount} → ${afterMetrics.wordCount}\n` +
        `ARI score: ${beforeMetrics.ari} → ${afterMetrics.ari}\n` +
        `Grade level: ${beforeMetrics.grade} (age ${beforeMetrics.age}) → ${afterMetrics.grade} (age ${afterMetrics.age})\n` +
        `Target: ARI ≤ 6 (Grade 5, age 10–11)`
    );
  } else {
    const text = args.length > 0 ? args.join(" ") : await readStdin();
    const metrics = computeReadability(text);
    console.log(formatMetrics(metrics));
    console.log(`Target: ARI ≤ 6 (Grade 5, age 10–11)`);
  }
}
