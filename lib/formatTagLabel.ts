/**
 * Display label for a tag slug in UI (listing cards, article chips).
 * Frontmatter / URLs keep the canonical slug; this is presentation only.
 */
const SEGMENT_ACRONYMS: Record<string, string> = {
  ai: "AI",
  ml: "ML",
  api: "API",
  nlp: "NLP",
  llm: "LLM",
  bert: "BERT",
  csv: "CSV",
  gpu: "GPU",
  cpu: "CPU",
  sql: "SQL",
  http: "HTTP",
  https: "HTTPS",
  ui: "UI",
  ux: "UX",
  saas: "SaaS",
  rnn: "RNN",
  rnns: "RNNs",
  cnn: "CNN",
  lstm: "LSTM",
  gpt: "GPT",
  oss: "OSS",
  ci: "CI",
  cd: "CD",
  mlops: "MLOps",
  devops: "DevOps",
  fastapi: "FastAPI",
  postgresql: "PostgreSQL",
  colab: "Colab",
  wandb: "W&B",
  arxiv: "arXiv",
  kaggle: "Kaggle",
  pytorch: "PyTorch",
  tensorflow: "TensorFlow",
  javascript: "JavaScript",
  typescript: "TypeScript",
  node: "Node",
  js: "JS",
  ts: "TS",
  eu: "EU",
};

function formatSegment(segment: string): string {
  const raw = segment.trim();
  if (!raw) return "";
  const key = raw.toLowerCase();
  if (SEGMENT_ACRONYMS[key]) return SEGMENT_ACRONYMS[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function formatTagLabel(canonicalTag: string): string {
  const t = canonicalTag.trim();
  if (!t) return "";
  return t
    .split(/[\s-]+/)
    .map(formatSegment)
    .filter(Boolean)
    .join(" ");
}
