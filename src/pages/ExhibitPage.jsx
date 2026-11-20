import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useExhibitsData } from '../lib/ExhibitsContext';
import { PageShell } from '../components/PageShell';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Timeline } from '../components/Timeline';
import { DateRow, PlaceRow } from '../components/Rows';
import { Icon } from '../icons/Icon';
import { statusLabel, formatLong } from '../lib/exhibits';
import styles from './ExhibitPage.module.css';

// Long runs read better as an end date than as "Chiude tra 214 giorni".
function cardTitle(e) {
  if (!e.isInArrivo && e.daysToEnd > 60) return `Aperta fino al ${formatLong(e.end)}`;
  return statusLabel(e);
}

export default function ExhibitPage() {
  const { id } = useParams();
  const { status, exhibits } = useExhibitsData();
  const navigate = useNavigate();
  const location = useLocation();

  // Opened from inside the app: go back to that view (keeps its filters and
  // scroll). Opened from a shared link: there's nothing to go back to.
  const back = location.state?.fromApp
    ? { onClick: () => navigate(-1), label: 'Indietro' }
    : { to: '/mostre', label: 'Vai al calendario' };

  if (status === 'loading') return null;

  const exhibit = exhibits.find((e) => e.id === id);
  if (!exhibit) {
    return (
      <PageShell>
        <Header back={back} />
        <div className={styles.article}>
          <h1 className={styles.title}>Mostra non trovata</h1>
          <p className={styles.body}>Forse è già chiusa. <Link to="/mostre">Guarda il calendario</Link>.</p>
        </div>
      </PageShell>
    );
  }

  const sameSede = exhibits
    .filter((e) => e.sede === exhibit.sede && e.id !== exhibit.id)
    .sort((a, b) => a.isPermanent - b.isPermanent || a.start - b.start)
    .slice(0, 3);

  return (
    <PageShell>
      <Header back={back} />

      <article className={styles.article}>
        <p className={styles.kicker}>{exhibit.luogoLabel} · {exhibit.temaLabel}</p>
        <h1 className={styles.title}>{exhibit.name}</h1>

        {!exhibit.isPermanent && (
          <div className={styles.card}>
            <p className={styles.cardTitle}>{cardTitle(exhibit)}</p>
            <div className={styles.cardTimeline}>
              <Timeline item={exhibit} size="lg" />
            </div>
          </div>
        )}

        <dl className={styles.facts}>
          <dt>Dove</dt>
          <dd>
            <strong>{exhibit.sede}</strong>
            {exhibit.indirizzo && <><br />{exhibit.indirizzo}</>}
          </dd>
          {exhibit.isPermanent && (
            <>
              <dt>Quando</dt>
              <dd>Sempre aperto</dd>
            </>
          )}
          <dt>Ingresso</dt>
          <dd>
            {exhibit.abbonamentoLombardia ? 'Incluso nell’Abbonamento Musei' : 'Non incluso nell’Abbonamento Musei'}
            {exhibit.beneFai && <><br />Bene FAI</>}
          </dd>
        </dl>

        <p className={styles.lead}>{exhibit.descrizioneBreve}</p>
        <p className={styles.body}>{exhibit.descrizioneLunga}</p>

        {sameSede.length > 0 && (
          <section className={styles.related} aria-labelledby="h-sede">
            <h2 className={styles.relatedTitle} id="h-sede">Nella stessa sede</h2>
            {sameSede.map((e) => (e.isPermanent
              ? <PlaceRow key={e.id} item={e} />
              : <DateRow key={e.id} item={e} sub={`${statusLabel(e)} · fino a ${e.endShort}`} showAbb={false} />))}
          </section>
        )}
      </article>

      <div className={styles.actions}>
        <Button as="a" variant="primary" href={exhibit.mapsUrl} target="_blank" rel="noreferrer">
          <Icon name="mapPin" size={18} />
          Portami qui
        </Button>
        {exhibit.sitoWeb && (
          <Button as="a" href={exhibit.sitoWeb} target="_blank" rel="noreferrer">Sito della sede</Button>
        )}
      </div>
    </PageShell>
  );
}
