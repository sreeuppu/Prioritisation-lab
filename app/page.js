"use client";
import { useState } from 'react';

export default function LeadershipEngine() {
  const [profile, setProfile] = useState({ role: 'Product Manager', level: 'Senior' });
  const [focusArea, setFocusArea] = useState('Prioritization under pressure');
  const [scenario, setScenario] = useState(null);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [currentPushback, setCurrentPushback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('profile'); 

  async function handleStart() {
    setStep('generating');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, focusArea })
      });
      const data = await res.json();
      
      // Ensure we have data before moving to lab
      if (data && data.headline) {
        setScenario(data);
        setStep('lab');
      } else {
        throw new Error("Invalid data received");
      }
    } catch (e) {
      alert("AI was too busy. Please try clicking 'Generate' again.");
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
    <div style={{ minHeight: '100vh', backgroundColor: '#050a15', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#111c33', padding: '40px', borderRadius: '20px', border: '1px solid #1e293b' }}>
        <h1 style={{ textAlign: 'center', fontSize: '22px', marginBottom: '30px' }}>AI Leadership Trainer</h1>

        {step === 'profile' && (
          <div>
             <h2 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '20px' }}>Step 1: Define the Challenge</h2>
             
             <label style={s.label}>Your Role</label>
             <select style={s.input} value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})}>
                <option>Product Manager</option>
                <option>Engineering Leader</option>
                <option>Founder/CEO</option>
             </select>

             <label style={s.label}>What should the AI test you on?</label>
             <textarea 
                style={{...s.input, minHeight: '80px', border: '1px solid #38bdf8'}} 
                value={focusArea}
                onChange={e => setFocusArea(e.target.value)}
                placeholder="e.g. Handling a 20% budget cut"
             />

             <button style={s.btn} onClick={handleStart} disabled={loading}>Generate Custom Scenario</button>
          </div>
        )}

        {step === 'generating' && (
            <div style={{ textAlign: 'center' }}>
                <div style={{ border: '3px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: 'auto' }}></div>
                <p style={{ marginTop: '20px' }}>AI is writing a unique scenario...</p>
            </div>
        )}

        {step === 'lab' && (
          <div>
            <div style={{ background: '#050a15', padding: '20px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #38bdf8' }}>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>Current Scenario</div>
                <h3 style={{ margin: '10px 0', lineHeight: '1.4' }}>{scenario?.headline || "Loading..."}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                    {scenario?.stakeholderTitle || "Stakeholder"}: "{scenario?.context || "Waiting for input..."}"
                </p>
            </div>

            {currentPushback && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '10px', marginBottom: '20px', borderLeft: '4px solid #ef4444' }}>
                <p style={{ margin: 0, fontSize: '14px' }}><strong>Pushback:</strong> {currentPushback}</p>
              </div>
            )}

            {!result ? (
              <>
                <textarea 
                  style={s.input} 
                  placeholder="Your leadership response..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button style={s.btn} onClick={handleAssess} disabled={loading}>
                  {loading ? "Thinking..." : "Send Response"}
                </button>
              </>
            ) : (
              <div>
                <h2 style={{ color: '#22c55e' }}>Complete</h2>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{result.feedback}</p>
                <button style={{ ...s.btn, background: '#1e293b', color: '#fff', marginTop: '10px' }} onClick={() => window.location.reload()}>Restart</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
    label: { display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', background: '#050a15', border: '1px solid #1e293b', color: '#fff', borderRadius: '10px', fontSize: '15px', outline: 'none' },
    btn: { width: '100%', padding: '15px', background: '#38bdf8', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }
};
