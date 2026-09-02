import React from 'react';
import resultsData from '../data/results.json';
import './AdminScreen.css';

const getBrutalistCardStyle = (idx, isWaitlisted) => {
  const selectedColors = ['#fb923c', '#4ade80', '#9fd0ff', '#fbcfe8', '#c084fc', '#fef08a'];
  const waitlistedColors = ['#fde047', '#fed7aa', '#d9f99d'];
  const colors = isWaitlisted ? waitlistedColors : selectedColors;
  return {
    position: 'relative',
    padding: '28px 24px',
    border: '3px solid var(--ink)',
    background: colors[idx % colors.length],
    color: 'var(--ink)',
    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };
};

export default function ResultsScreen({ onBack }) {
  return (
    <div className="admin-container" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 80, paddingBottom: 80 }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: 20 }}>
        &larr; Back to Home
      </button>

      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h1 style={{ color: 'var(--accent)', fontSize: 'clamp(32px, 5vw, 48px)', fontFamily: 'var(--poster)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
          SIH 2026 Finalists
        </h1>
        <p style={{ color: 'var(--dim)', fontSize: 18 }}>Official list of selected and waitlisted teams.</p>
      </div>

      <div style={{ marginBottom: 80 }}>
        <h2 style={{ color: '#4ade80', marginBottom: 32, fontFamily: 'var(--poster)', fontSize: 32, letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '2px solid #4ade80', paddingBottom: 16, display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
          <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f3c6.svg" alt="Trophy" style={{ width: 40, height: 40 }} />
          Selected Teams
        </h2>
        
        {resultsData.selected.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dim)', marginTop: 40 }}>No teams available.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px 24px', padding: '16px' }}>
            {resultsData.selected.map((team, idx) => (
              <div key={idx} style={getBrutalistCardStyle(idx, false)}>
                <div style={{ fontFamily: 'var(--poster)', fontSize: 28, textTransform: 'uppercase', lineHeight: 1.1 }}>
                  {team.teamName}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>
                  ID: {team.psId}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                  LEADER: {team.leaderName}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                  <span style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--ink)', color: '#fff', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {team.theme}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ color: '#facc15', marginBottom: 32, fontFamily: 'var(--poster)', fontSize: 32, letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '2px solid #facc15', paddingBottom: 16, display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
          <img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/23f3.svg" alt="Hourglass" style={{ width: 40, height: 40 }} />
          Waitlisted Teams
        </h2>
        
        {resultsData.waitlisted.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--dim)', marginTop: 40 }}>No teams available.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px 24px', padding: '16px' }}>
            {resultsData.waitlisted.map((team, idx) => (
              <div key={idx} style={getBrutalistCardStyle(idx, true)}>
                <div style={{ fontFamily: 'var(--poster)', fontSize: 28, textTransform: 'uppercase', lineHeight: 1.1 }}>
                  {team.teamName}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>
                  ID: {team.psId}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                  LEADER: {team.leaderName}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                  <span style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--ink)', color: '#fff', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {team.theme}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
