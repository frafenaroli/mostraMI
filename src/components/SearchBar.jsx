import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';
import { Icon } from '../icons/Icon';
import { Pill } from './Pill';

export function SearchBar({ onSurprise }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/cerca?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.desktopRow}>
        <div className={styles.inputRow}>
          <Icon name="search" size={16} color="oklch(46% 0.015 40)" />
          <input
            className={styles.input}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per luogo, artista o parola chiave…"
            aria-label="Cerca mostre, musei o gallerie"
          />
        </div>
        <div className={styles.buttonRow}>
          <Pill type="button" variant="secondary" onClick={onSurprise}>
            <Icon name="sparkles" size={15} strokeWidth={1.6} />
            Stupiscimi!
          </Pill>
          <Pill type="submit" variant="primary" className={styles.cercaButton}>
            <Icon name="search" size={15} />
            Cerca
          </Pill>
        </div>
      </div>
    </form>
  );
}
