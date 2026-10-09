"use client";
import { useCallback, useEffect, useState } from "react";

export default function usePolling(url, ms = 4000) {
  const [data, setData] = useState(null);

  const reload = useCallback(async () => {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) setData(await r.json());
    } catch {}
  }, [url]);

  useEffect(() => {
    reload();
    const t = setInterval(reload, ms);
    return () => clearInterval(t);
  }, [reload, ms]);

  return { data, reload };
}