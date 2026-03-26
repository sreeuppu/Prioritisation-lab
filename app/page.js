"use client";
import { useState } from 'react';

export default function PrioritizationLab() {
  const [profile, setProfile] = useState({ role: 'Product Manager', level: 'Senior', industry: 'SaaS' });
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('profile'); // profile, lab

  const scenario = {
    headline: "Revenue is 15% below forecast for two consecutive months.",
    context: "Sales leadership says: 'The market is soft. Let’s monitor for another quarter before making changes.'"
  };

  async function handleAssess() {
    if (input.length < 10) return alert("Please provide a more detailed response.");
    setLoading(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, profile, scenario })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Error contacting AI.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Product Leadership AI Lab</h1>
        <p style={styles.subtitle}>Module 2: Prioritization & Resource Allocation</p>

        {step === 'profile' ? (
          <div style={styles.section}>
            <h2 style={styles.h2}>Identify Your Profile</h2>
            <label style={styles.label}>Your Role</label>
            <select style={styles.input} value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
              <option>Product Manager</option>
              <option>Engineering Leader</option>
              <option>Founder/CEO</option>
            </select>
            <label style={styles.label}>Experience Level</label>
            <select style={styles.input} value={profile.level} onChange={e => setProfile({...profile, level: e.target.value})}>
              <option>Junior/Associate</option>
              <option>Senior/Lead</option>
              <option>Executive</option>
            </select>
            <button style={styles.button} onClick={() => setStep('lab')}>Enter Lab Session</button>
          </div>
        ) : (
          <div style={styles.section}>
            <div style={styles.tagRow}>
              <span style={styles.tag}>{profile.level}</span>
              <span style={styles.tag}>{profile.role}</span>
            </div>
            
            <div style={styles.scenarioBox}>
              <h3 style={{margin:0, color: '#38bdf8'}}>Scenario: The Revenue Miss</h3>
              <p style={{marginBottom:0}}>{scenario.headline}</p>
              <p style={{fontSize: '13px', color: '#94a3b8', marginTop: '5px'}}>{scenario.context}</p>
            </div>

            <textarea 
              style={styles.textarea} 
              placeholder="As the accountable leader, how do you respond to Sales?"
              value={input}
              onChange={e => setInput(e.target.value)}
            />

            <button style={styles.button} onClick={handleAssess} disabled={loading}>
              {loading ? "Coach is reviewing..." : "Submit for Assessment"}
            </button>

            {result && (
              <div style={styles.resultArea}>
                <div style={styles.scoreGrid}>
                  {Object.entries(result.scores).map(([k, v]) => (
                    <div key={k} style={styles.scoreBox}>
                      <div style={{fontSize: '10px', color: '#94a3b8'}}>{k}</div>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#38bdf8'}}>{v}/10</div>
                    </div>
                  ))}
                </div>
                <div style={styles.feedbackBox}>
                  <strong>Mentor Note:</strong> {result.feedback}
                  <div style={styles.rewrite}><strong>Sharp Rewrite:</strong> "{result.rewrite}"</div>
                </div>
                <button style={{...styles.button, background: '#334155', color: '#fff', marginTop: '20px'}} onClick={() => window.location.reload()}>Try Another Persona</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { width: '100%', maxWidth: '650px', backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid #334155', color: '#e2e8f0' },
  h1: { fontSize: '24px', margin: '0 0 5px 0' },
  h2: { fontSize: '18px', color: '#38bdf8', marginBottom: '20px' },
  subtitle: { color: '#94a3b8', fontSize: '14px', marginBottom: '30px' },
  label: { fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' },
  textarea: { width: '100%', minHeight: '120px', padding: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '15px', fontSize: '15px' },
  button: { width: '100%', padding: '14px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  tagRow: { marginBottom: '15px' },
  tag: { fontSize: '10px', padding: '3px 8px', backgroundColor: '#334155', borderRadius: '4px', marginRight: '5px', textTransform: 'uppercase', color: '#38bdf8' },
  scenarioBox: { padding: '15px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #38bdf8', borderRadius: '4px', marginBottom: '20px' },
  resultArea: { marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '20px' },
  scoreGrid: { display: 'flex', gap: '10px' },
  scoreBox: { flex: 1, backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #334155' },
  feedbackBox: { marginTop: '20px', padding: '15px', background: 'rgba(56,189,248,0.1)', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' },
  rewrite: { marginTop: '10px', fontStyle: 'italic', color: '#94a3b8' }
};
