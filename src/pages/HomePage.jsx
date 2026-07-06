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

export default function HomePage() {
  const { status, exhibits, error } = useExhibitsData();
  const [surpriseId, setSurpriseId] = useState(null);
  const [lastSurpriseId, setLastSurpriseId] = useState(null);

  const sections = useMemo(() => {
    if (!exhibits.length) return [];
    return [
      { title: 'Da visitare ora', link: 'Vedi tutte', linkTo: '/mostre?periodo=in-corso', items: exhibits.filter((e) => e.periodo === 'in-corso').slice(0, 3) },
      { title: 'Abbonamento Musei Lombardia', link: 'Vedi tutte', linkTo: '/mostre?abbonamento=1', items: exhibits.filter((e) => e.abbonamentoLombardia).slice(0, 3) },
      { title: 'Musei', link: 'Vedi tutti', linkTo: '/mostre?luogo=museo', items: exhibits.filter((e) => e.luogo === 'museo').slice(0, 3) },
      { title: 'In arrivo', link: 'Vedi tutte', linkTo: '/mostre?periodo=in-arrivo', items: exhibits.filter((e) => e.periodo === 'in-arrivo').slice(0, 3) },
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
