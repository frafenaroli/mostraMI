import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { PageShell } from '../components/PageShell';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Chip, ChipRow } from '../components/Chip';
import { SectionHead } from '../components/SectionHead';
import { TimelineRow, DateRow } from '../components/Rows';
import { ExhibitLink } from '../components/ExhibitLink';
import { SisterAppBanner } from '../components/SisterAppBanner';
import { Footer } from '../components/Footer';
import { Icon } from '../icons/Icon';
import { byEnd, byStart, pluralize } from '../lib/exhibits';
import styles from './HomePage.module.css';

// Shortcuts into the calendar with a filter already applied.
const SHORTCUTS = [
  { label: 'Aperte ora', to: '/mostre' },
  { label: 'In arrivo', to: '/mostre?ordine=apertura' },
  { label: 'Abbonamento Musei', to: '/mostre?abbonamento=1' },
  { label: 'Bene FAI', to: '/mostre?fai=1' },
  { label: 'Fotografia', to: '/mostre?tema=fotografia' },
];

// Shuffle a copy (Fisher-Yates) so "Sempre aperti" shows a fresh sample on
// every visit rather than always the same first few.
function sample(list, n) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// The staged hero entrance is for the first view of the session; coming back
// to the home later should not replay it.
let heroPlayed = false;

function todayLabel() {
  const s = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function HomePage() {
  const { status, exhibits, error, generatedAt } = useExhibitsData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stage] = useState(() => !heroPlayed);
  useEffect(() => {
    if (status === 'ready') heroPlayed = true;
  }, [status]);

  const data = useMemo(() => {
    const timed = exhibits.filter((e) => !e.isPermanent);
    const open = timed.filter((e) => !e.isInArrivo).sort(byEnd);
    const upcoming = timed.filter((e) => e.isInArrivo).sort(byStart);
    const permanent = exhibits.filter((e) => e.isPermanent);
    return { open, upcoming, permanent, museums: sample(permanent, 6) };
  }, [exhibits]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/mostre?q=${encodeURIComponent(q)}` : '/mostre');
  }

  function handleSurprise() {
    const pool = exhibits.filter((e) => e.isAperta);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/mostra/${pick.id}`, { state: { fromApp: true } });
  }

  if (status !== 'ready') {
    return (
      <PageShell>
        <Header />
        <p className={styles.status}>
          {status === 'loading'
            ? 'Caricamento mostre…'
            : `Non riesco a caricare le mostre in questo momento.${error ? ` (${error.message})` : ''}`}
        </p>
      </PageShell>
    );
  }

  const { open, upcoming, permanent, museums } = data;
  const st = stage ? styles.stage : undefined;

  return (
    <PageShell>
      <Header />

      <section className={styles.hero}>
        <p className={`${styles.date} ${st ?? ''}`}>{todayLabel()}</p>
        <h1 className={`${styles.headline} ${st ?? ''}`}>
          {pluralize(open.length, 'mostra aperta', 'mostre aperte')} a Milano oggi
        </h1>
        <p className={`${styles.lede} ${st ?? ''}`}>
          Più {pluralize(permanent.length, 'luogo sempre aperto', 'luoghi sempre aperti')}.
          {upcoming.length > 0 && ` ${pluralize(upcoming.length, 'mostra apre', 'mostre aprono')} a breve.`}
        </p>
      </section>

      <form className={`${styles.search} ${st ?? ''}`} onSubmit={handleSubmit} role="search">
        <label htmlFor="home-q" className="visually-hidden">Cerca mostre, musei o gallerie</label>
        <div className={styles.inputBox}>
          <Icon name="search" size={18} />
          <input
            id="home-q"
            type="search"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artista, mostra o luogo"
            enterKeyHint="search"
          />
        </div>
        <Button onClick={handleSurprise}>
          <Icon name="shuffle" size={18} />
          Non sai cosa scegliere? Stupiscimi
        </Button>
        <ChipRow label="Scorciatoie per il calendario">
          {SHORTCUTS.map((s) => (
            <Chip key={s.label} as={Link} to={s.to}>{s.label}</Chip>
          ))}
        </ChipRow>
      </form>

      {open.length > 0 && (
        <section className={styles.section} aria-labelledby="h-chiudono">
          <SectionHead id="h-chiudono" title="Chiudono tra poco" linkTo="/mostre" linkLabel="Tutte" />
          {open.slice(0, 3).map((item) => (
            <TimelineRow key={item.id} item={item} kicker large />
          ))}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className={styles.section} aria-labelledby="h-aprono">
          <SectionHead
            id="h-aprono"
            title="Aprono a breve"
            linkTo="/mostre?ordine=apertura"
            linkLabel={upcoming.length > 4 ? `Tutte e ${upcoming.length}` : 'Calendario'}
          />
          {upcoming.slice(0, 4).map((item) => (
            <DateRow key={item.id} item={item} />
          ))}
        </section>
      )}

      {museums.length > 0 && (
        <section className={styles.section} aria-labelledby="h-sempre">
          <SectionHead id="h-sempre" title="Sempre aperti" linkTo="/mostre?tipo=sempre-aperti" linkLabel={`Tutti e ${permanent.length}`} />
          <p className={styles.legend}><span className={styles.dot} aria-hidden="true">●</span> Incluso nell'Abbonamento Musei</p>
          <ul className={styles.museums}>
            {museums.map((m) => (
              <li key={m.id}>
                <ExhibitLink id={m.id} className={styles.museum}>
                  <span>{m.name}</span>
                  {m.abbonamentoLombardia && (
                    <span className={styles.dot} role="img" aria-label="Incluso nell'Abbonamento Musei">●</span>
                  )}
                </ExhibitLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SisterAppBanner />
      <Footer generatedAt={generatedAt} />
    </PageShell>
  );
}
