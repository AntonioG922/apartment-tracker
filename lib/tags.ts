export const BLOCK_TAGS = [
  "quiet",
  "loud",
  "tree-lined",
  "pretty",
  "ugly",
  "sketchy at night",
  "smells",
  "construction",
  "too commercial",
  "good light",
  "dead at night",
] as const;

export type BlockTag = (typeof BLOCK_TAGS)[number];
