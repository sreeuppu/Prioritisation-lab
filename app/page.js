"use client";
import { useState } from 'react';

export default function PrioritizationLab() {
  const [profile, setProfile] = useState({ role: 'Product Manager', level: 'Senior', industry: 'SaaS' });
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Tracks the debate
  const [result, setResult] = useState(null); // Final scores
  const [currentPushback, setCurrentPushback] = useState(null); // Current AI rebuttal
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('profile');

  const scenario = {
    headline: "Revenue is 15% below forecast for two consecutive months.",
    context: "Sales leadership says: 'The market is soft. Let’s wait another quarter.'"
  };

  async function handleAssess() {
    if (input.length < 5) return alert("Write a real response.");
    setLoading(true);
    
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, profile, scenario, chatHistory })
      });
      const data = await res.json();

      if (data.decision === "PUSHBACK") {
        // AI is arguing back!
        setCurrentPushback(data.pushbackText);
        setChatHistory([...chatHistory, { role: 'user', text: input }, { role: 'model', text: data.pushbackText }]);
        setInput(''); // Clear input for next round
      } else {
        // AI conceded, show final results
        setResult(data);
        setCurrentPushback(null);
      }
    } catch (e) {
      alert("Error contacting AI.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Leadership Sparring Partner</h1>
        
        {step === 'profile' ? (
          <div style={styles.section}>
             <h2>Set Your Profile</h2>
             <select style={styles.input} value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
               <option>Product Manager</option>
               <option>Engineering Leader</option>
               <option>Founder/CEO</option>
             </select>
             <select style={styles.input} value={profile.level} onChange={e => setProfile({...profile, level: e.target.value})}>
               <option>Junior/Associate</option>
               <option>Senior/Lead</option>
               <option>Executive</option>
             </select>
             <button style={styles.button} onClick={() => setStep('lab')}>Start Sparring</button>
          </div>
        ) : (
          <div style={styles.section}>
            <div style={styles.scenarioBox}>
              <h3 style={{margin:0, color: '#38bdf8'}}>Scenario: The Revenue Miss</h3>
              <p>{scenario.headline}</p>
            </div>

            {/* If the AI has pushed back, show its message */}
            {currentPushback && (
              <div style={styles.pushbackBox}>
                <span style={styles.tag}>Stakeholder Pushback:</span>
                <p style={{marginTop: '10px', fontWeight: 'bold'}}>"{currentPushback}"</p>
              </div>
            )}

            {!result ? (
              <>
                <textarea 
                  style={styles.textarea} 
                  placeholder={currentPushback ? "Respond to the stakeholder..." : "What is your initial decision?"}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button style={styles.button} onClick={handleAssess} disabled={loading}>
                  {loading ? "Stakeholder is typing..." : "Send Response"}
                </button>
              </>
            ) : (
              <div style={styles.resultArea}>
                <h2 style={{color: '#22c55e'}}>✓ Stakeholder Conceded</h2>
                <div style={styles.scoreGrid}>
                  {Object.entries(result.scores).map(([k, v]) => (
                    <div key={k} style={styles.scoreBox}>
                      <div style={{fontSize: '10px'}}>{k}</div>
                      <div style={{fontSize: '24px', fontWeight: 'bold', color: '#38bdf8'}}>{v}/10</div>
                    </div>
                  ))}
                </div>
                <div style={styles.feedbackBox}>
                  <strong>Mentor Feedback:</strong> {result.feedback}
                  <div style={styles.rewrite}><strong>Sharpened Version:</strong> "{result.rewrite}"</div>
                </div>
                <button style={{...styles.button, marginTop: '20px'}} onClick={() => window.location.reload()}>Next Scenario</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Just add this new style to your existing styles object
const styles = {
  // ... (keep previous styles)
  container: { minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
  card: { width: '100%', maxWidth: '600px', backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', color: '#e2e8f0' },
  h1: { fontSize: '22px', marginBottom: '20px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' },
  textarea: { width: '100%', minHeight: '100px', padding: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '15px', fontSize: '15px' },
  button: { width: '100%', padding: '14px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  scenarioBox: { padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #38bdf8' },
  pushbackBox: { padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #ef4444' },
  tag: { fontSize: '10px', padding: '2px 6px', backgroundColor: '#ef4444', borderRadius: '4px', textTransform: 'uppercase', color: '#fff' },
  resultArea: { marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '20px' },
  scoreGrid: { display: 'flex', gap: '10px', marginTop: '15px' },
  scoreBox: { flex: 1, backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #334155' },
  feedbackBox: { marginTop: '20px', padding: '15px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', fontSize: '14px' },
  rewrite: { marginTop: '10px', fontStyle: 'italic', color: '#94a3b8' }
};
