import styles from './solve.module.scss';

const KEYS = [
  { label: 'xⁿ', text: '^' },
  { label: '√', text: 'sqrt(' },
  { label: '(', text: '(' },
  { label: ')', text: ')' },
  { label: '÷', text: '/' },
  { label: '×', text: '*' },
  { label: '=', text: '=' },
  { label: 'x', text: 'x' },
];

export function MathKeypad({ onInsert, onBackspace, backspaceLabel }) {
  return (
    <div className={styles.keypad}>
      {KEYS.map((k) => (
        <button
          type="button"
          key={k.label}
          className={styles.key}
          onClick={() => onInsert(k.text)}
        >
          {k.label}
        </button>
      ))}
      <button
        type="button"
        className={`${styles.key} ${styles.keyBack}`}
        onClick={onBackspace}
        aria-label={backspaceLabel}
      >
        ⌫
      </button>
    </div>
  );
}
