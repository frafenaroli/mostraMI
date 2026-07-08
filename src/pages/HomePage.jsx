import { useMemo, useState } from 'react';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { PageShell } from '../components/PageShell';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { SearchBar } from '../components/SearchBar';
import { SurpriseBanner } from '../components/SurpriseBanner';
import { ArchiveBanner } from '../components/ArchiveBanner';
import { CarouselSection } from '../components/CarouselSection';
import { Footer } from '../components/Footer';
import styles from './HomePage.module.css';

// Shuffle a copy (Fisher-Yates) so each category shows a fresh random 6 in a
// new order on every visit, rather than always the same first six.
function pick6(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, 6);
}

export default function HomePage() {
  const { status, exhibits, error } = useExhibitsData();
  const [surpriseId, setSurpriseId] = useState(null);
  const [lastSurpriseId, setLastSurpriseId] = useState(null);

  const sections = useMemo(() => {
    if (!exhibits.length) return [];
    return [
      { title: 'Da visitare ora', link: 'Vedi tutte', linkTo: '/mostre?periodo=in-corso', items: pick6(exhibits.filter((e) => e.periodo === 'in-corso')) },
      { title: 'Abb. Musei Lombardia', link: 'Vedi tutte', linkTo: '/mostre?abbonamento=1', items: pick6(exhibits.filter((e) => e.abbonamentoLombardia)) },
      { title: 'Musei', link: 'Vedi tutti', linkTo: '/mostre?luogo=museo', items: pick6(exhibits.filter((e) => e.luogo === 'museo')) },
      { title: 'In arrivo', link: 'Vedi tutte', linkTo: '/mostre?periodo=in-arrivo', items: pick6(exhibits.filter((e) => e.periodo === 'in-arrivo')) },
    ].filter((s) => s.items.length > 0);
  }, [exhibits]);

  const surprise = surpriseId ? exhibits.find((e) => e.id === surpriseId) : null;

  function handleSurprise() {
    if (!exhibits.length) return;
    let candidates = exhibits;
    if (lastSurpriseId && exhibits.length > 1) {
      candidates = exhibits.filter((e) => e.id !== lastSurpriseId);
    }
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setSurpriseId(pick.id);
    setLastSurpriseId(pick.id);
  }

  if (status === 'loading') {
    return (
      <PageShell aura>
        <Header />
        <div className={styles.status}>Caricamento mostre…</div>
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell aura>
        <Header />
        <div className={styles.status}>Non riesco a caricare le mostre in questo momento.{error ? ` (${error.message})` : ''}</div>
      </PageShell>
    );
  }

  return (
    <PageShell aura>
      <Header />
      <Hero />
      <SearchBar onSurprise={handleSurprise} />
      {surprise && <SurpriseBanner exhibit={surprise} onDismiss={() => setSurpriseId(null)} />}
      <ArchiveBanner />
      {sections.map((section) => (
        <CarouselSection
          key={section.title}
          title={section.title}
          items={section.items}
          linkTo={section.linkTo}
          linkLabel={section.link}
        />
      ))}
      <Footer />
    </PageShell>
  );
}
