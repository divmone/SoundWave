import { useState, useRef, useEffect } from 'react';
import { startGeneration, getTaskStatus, addGeneratedSound } from '../../api/services/generateService';

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS  = 10 * 60 * 1000;

const inp = {
  width: '100%', padding: '0.8rem 1.1rem',
  background: 'rgba(255,255,255,0.04)', border: '1.5px solid var(--line2)',
  borderRadius: 'var(--radius-pill)', color: 'var(--text)',
  fontSize: '0.9rem', fontFamily: 'var(--font-body)', fontWeight: 600,
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function GenerateModal({ onClose, onSuccess }) {
  const [prompt, setPrompt] = useState('');
  const [phase,  setPhase]  = useState('idle');
  const [status, setStatus] = useState('');
  const [error,  setError]  = useState('');
  const cancelled = useRef(false);

  useEffect(() => () => { cancelled.current = true; }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError('');
    setPhase('starting');
    let taskId;
    try {
      taskId = await startGeneration(prompt.trim());
    } catch (e) {
      setError(e.message || 'Failed to start generation');
      setPhase('idle');
      return;
    }

    setPhase('polling');
    const startedAt = Date.now();
    while (!cancelled.current) {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setError('Generation timed out');
        setPhase('idle');
        return;
      }
      try {
        const value = await getTaskStatus(taskId);
        setStatus(value);
        if (/(complete|success)/i.test(value)) break;
        if (/fail|error/i.test(value)) {
          setError(`Suno: ${value}`);
          setPhase('idle');
          return;
        }
      } catch (e) {
        setError(e.message || 'Status check failed');
        setPhase('idle');
        return;
      }
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    }
    if (cancelled.current) return;

    setPhase('saving');
    try {
      await addGeneratedSound(taskId);
    } catch (e) {
      setError(e.message || 'Failed to save sound');
      setPhase('idle');
      return;
    }

    setPhase('done');
    onSuccess?.();
  };

  const busy = phase !== 'idle' && phase !== 'done';

  return (
    <div
      onClick={busy ? undefined : onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)', maxWidth: 480, width: '92%',
          padding: '1.8rem', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.4rem' }}>✨</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem' }}>
            Generate AI sound
          </h2>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 18 }}>
          Describe the sound you want — model, mood, instruments, tempo.
        </p>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. lofi chill beat, rainy night, soft piano"
          rows={4}
          disabled={busy}
          style={{ ...inp, borderRadius: 12, resize: 'vertical', minHeight: 90, marginBottom: 16 }}
        />

        {phase !== 'idle' && (
          <div style={{
            padding: '10px 14px', marginBottom: 14,
            background: 'rgba(99,215,255,0.06)', border: '1px solid var(--line2)',
            borderRadius: 10, fontSize: '0.82rem', color: 'var(--text2)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {phase !== 'done' && (
              <span style={{
                width: 16, height: 16, border: '2px solid var(--line2)',
                borderTopColor: 'var(--cyan)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            )}
            <span>
              {phase === 'starting' && 'Sending prompt to Suno...'}
              {phase === 'polling'  && `Generating... ${status ? `(${status})` : ''}`}
              {phase === 'saving'   && 'Saving sound to library...'}
              {phase === 'done'     && '✓ Done — your AI sound is in the library'}
            </span>
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 14,
            background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 10, fontSize: '0.82rem', color: '#ff8080',
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-ghost"
            onClick={onClose}
            disabled={busy}
            style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
          >
            {phase === 'done' ? 'Close' : 'Cancel'}
          </button>
          {phase !== 'done' && (
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={busy || !prompt.trim()}
              style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
            >
              {busy ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
