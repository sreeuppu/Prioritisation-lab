"use client";
import { useState } from 'react';

export default function LeadershipEngine() {
  const [profile, setProfile] = useState({ role: 'Product Manager', level: 'Senior', industry: 'SaaS' });
  const [focusArea, setFocusArea] = useState('Prioritization under pressure');
  const [scenario, setScenario] = useState(null);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [currentPushback, setCurrentPushback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('profile'); 

  async function handleStart() {
    if (!focusArea) return alert("Please enter what you want to be tested on.");
    setStep('generating');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, focusArea })
      });
      const data = await res.json();
      setScenario(data);
      setStep('lab');
    } catch (e) {
      alert("Error generating scenario. Make sure /api/generate/route.js exists!");
      setStep('profile');
    }
    setLoading(false);
  }

  async function handleAssess() {
    setLoading(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, profile, scenario, chatHistory })
      });
      const data = await res.json();
      if (data.decision === "PUSHBACK") {
        setCurrentPushback(data.pushbackText);
        setChatHistory([...chatHistory, { role: 'user', text: input }, { role: 'model', text: data.pushbackText }]);
        setInput('');
      } else {
        setResult(data);
        setCurrentPushback(null);
      }
    } catch (e) { alert("Assessment error."); }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={styles.card}>
        <h1 style={styles.h1}>Leadership Sparring Partner</h1>

        {step === 'profile' && (
          <div style={styles.section}>
             <h2 style={styles.h2}>Set Your Profile</h2>
             
             <label style={styles.label}>Your Role</label>
             <select style={styles.input} value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
                <option>Product Manager</option>
                <option>Engineering Leader</option>
                <option>Founder/CEO</option>
                <option>Sales Leader</option>
             </select>

             <label style={styles.label}>Seniority Level</label>
             <select style={styles.input} value={profile.level} onChange={e => setProfile({...profile, level: e.target.value})}>
                <option>Junior/Associate</option>
                <option>Senior/Lead</option>
                <option>Executive/VP</option>
             </select>

             {/* FOCUS AREA INPUT - I ADDED A BORDER TO MAKE IT OBVIOUS */}
             <label style={styles.label}>What do you want to be tested on?</label>
             <textarea 
                style={{...styles.textarea, minHeight:'80px', border: '2px solid #38bdf8'}} 
                placeholder="e.g. Prioritization under pressure, handling budget cuts..."
                value={focusArea}
                onChange={e => setFocusArea(e.target.value)}
             />

             <button style={styles.button} onClick={handleStart}>Generate Custom Scenario</button>
          </div>
        )}

        {step === 'generating' && (
            <div style={{textAlign:'center', padding:'40px'}}>
                <div style={{...styles.loader, animation: 'spin 1s linear infinite'}}></div>
                <p style={{marginTop: '20px', color: '#38bdf8'}}>AI is building your custom challenge...</p>
            </div>
        )}

        {step === 'lab' && scenario && (
          <div style={styles.section}>
            <div style={styles.scenarioBox}>
              <span style={styles.tag}>Testing: {focusArea}</span>
              <h3 style={{marginTop:'10px', color: '#fff'}}>{scenario.headline}</h3>
              <p style={{fontStyle:'italic', color:'#94a3b8'}}>{scenario.stakeholderTitle}: "{scenario.context}"</p>
            </div>

            {currentPushback && (
              <div style={styles.pushbackBox}>
                <p><strong>{scenario.stakeholderTitle}:</strong> "{currentPushback}"</p>
              </div>
            )}

            {!result ? (
              <>
                <textarea 
                  style={styles.textarea} 
                  placeholder="Type your response..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button style={styles.button} onClick={handleAssess} disabled={loading}>
                  {loading ? "Thinking..." : "Send Response"}
                </button>
              </>
            ) : (
              <div style={styles.resultArea}>
                <h2 style={{color: '#22c55e'}}>✓ Assessment Complete</h2>
                <div style={styles.scoreGrid}>
                    {Object.entries(result.scores).map(([k,v]) => (
                        <div key={k} style={styles.scoreBox}>
                          <div style={{fontSize: '10px', color: '#94a3b8'}}>{k}</div>
                          <div style={{fontSize: '22px', fontWeight: 'bold', color: '#38bdf8'}}>{v}/10</div>
                        </div>
                    ))}
                </div>
                <div style={styles.feedbackBox}>
                  <strong>Mentor Note:</strong> {result.feedback}
                </div>
                <button style={{...styles.button, marginTop: '20px'}} onClick={() => window.location.reload()}>New Session</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
    card: { width: '100%', maxWidth: '600px', backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', color: '#e2e8f0' },
    h1: { fontSize: '22px', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold' },
    h2: { fontSize: '18px', marginBottom: '15px', color: '#38bdf8' },
    label: { fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' },
    textarea: { width: '100%', minHeight: '100px', padding: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px', marginBottom: '15px', fontSize: '15px' },
    button: { width: '100%', padding: '14px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#000' },
    scenarioBox: { padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #38bdf8' },
    pushbackBox: { padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #ef4444', fontSize: '14px' },
    tag: { fontSize: '10px', padding: '3px 8px', backgroundColor: '#334155', borderRadius: '4px', textTransform: 'uppercase', color: '#38bdf8' },
    scoreGrid: { display: 'flex', gap: '10px', marginBottom: '20px' },
    scoreBox: { flex: 1, backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #334155' },
    feedbackBox: { padding: '15px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6' },
    loader: { border: '4px solid #334155', borderTop: '4px solid #38bdf8', borderRadius: '50%', width: '30px', height: '30px', margin: 'auto' }
};
