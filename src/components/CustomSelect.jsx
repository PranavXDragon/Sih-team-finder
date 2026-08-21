import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const displayLabel = selectedOption
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder;

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className="cs-trigger"
        onClick={() => setOpen(!open)}
        data-open={open ? "true" : "false"}
      >
        <span>{displayLabel}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--dim)' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div className="cs-pop">
          {placeholder && (
            <button
              type="button"
              className={`cs-opt cs-placeholder ${!value ? 'selected' : ''}`}
              onClick={() => { onChange(""); setOpen(false); }}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <button
                key={val}
                type="button"
                className={`cs-opt ${val === value ? 'selected' : ''}`}
                onClick={() => { onChange(val); setOpen(false); }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
