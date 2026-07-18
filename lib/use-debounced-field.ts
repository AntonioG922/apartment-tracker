import { useEffect, useRef, useState } from "react";

// Local edit buffer for a text/number input that autosaves after a pause,
// instead of writing to the DB on every keystroke. The caller remounts the
// owning component (via a `key`) when switching records, so this only ever
// needs to track one record's value per mount.
//
// `initial` can legitimately change shortly after mount even for the same
// record: e.g. a just-created draft apartment's live-query record may not
// have loaded yet on the first render. Adopt a later `initial` once, but
// only until the user actually edits the field - after that, local state is
// authoritative and must not be clobbered by a stale/late upstream value.
export function useDebouncedField(
  initial: string,
  onSave: (value: string) => void,
  delayMs = 400,
): [string, (value: string) => void] {
  const [value, setValue] = useState(initial);
  const [lastSeenInitial, setLastSeenInitial] = useState(initial);
  const [edited, setEdited] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!edited && initial !== lastSeenInitial) {
    setValue(initial);
    setLastSeenInitial(initial);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleChange(next: string) {
    if (!edited) setEdited(true);
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(next), delayMs);
  }

  return [value, handleChange];
}
