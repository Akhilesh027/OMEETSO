import { useEffect, useState } from "react";
import { getSaved, isSaved, subscribe, toggleSaved } from "@/lib/saved";

export function useSavedIds() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(getSaved());
    return subscribe(() => setIds(getSaved()));
  }, []);
  return ids;
}

export function useSaved(id: string) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(isSaved(id));
    return subscribe(() => setSaved(isSaved(id)));
  }, [id]);
  return { saved, toggle: () => setSaved(toggleSaved(id)) };
}
