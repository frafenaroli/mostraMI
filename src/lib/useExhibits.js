import { useEffect, useState } from 'react';
import { decorateExhibit } from './exhibits';

const DATA_URL = `${import.meta.env.BASE_URL}mostre.json`;

// Loads mostre.json (published on GitHub Pages, refreshed weekly by the ingest
// agent) and decorates every exhibit with derived display data.
export function useExhibits() {
  const [state, setState] = useState({ status: 'loading', exhibits: [], generatedAt: null, error: null });

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`mostre.json: HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const today = new Date();
        const exhibits = data.exhibits.map((e) => decorateExhibit(e, today));
        setState({ status: 'ready', exhibits, generatedAt: data.generatedAt, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ status: 'error', exhibits: [], generatedAt: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
