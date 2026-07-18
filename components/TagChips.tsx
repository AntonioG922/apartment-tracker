"use client";

import { BLOCK_TAGS, type BlockTag } from "@/lib/tags";
import ChipSelect from "./ChipSelect";

interface TagChipsProps {
  value: BlockTag[];
  onChange: (value: BlockTag[]) => void;
}

export default function TagChips({ value, onChange }: TagChipsProps) {
  return <ChipSelect options={BLOCK_TAGS} value={value} onChange={onChange} />;
}
