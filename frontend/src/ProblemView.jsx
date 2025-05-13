// icf.io/frontend/src/ProblemView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import './ProblemView.css';

const API_BASE_URL = 'http://localhost:8000';

export default function ProblemView({ problemId, onBackToList }) {
  const [problemData, setProblemData] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [level, setLevel] = useState(1);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);

  // Load problem once on mount
  useEffect(() => {
    if (!problemId) return;
    axios.get(`${API_BASE_URL}/api/problems/${problemId}`)
      .then(res => {
        setProblemData(res.data);
        setUserCode(res.data.initial_code_stub);
        setLevel(1);
        setResults([]);
        setFinished(false);
        setError('');
      })
      .catch(() => setError('Failed to load problem'));
  }, [problemId]);

  // Clear results when code changes
  const onChangeCode = (newCode) => {
    setUserCode(newCode);
    setResults([]);
    setError('');
  };

  const runTests = async () => {
    setRunning(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/run`, {
        problem_id:   problemId,
        level_number: level,
        user_code:    userCode,
        language:     'python'
      });
      setResults(res.data);
    } catch (e) {
      setError(e.response?.data || e.message);
    } finally {
      setRunning(false);
    }
  };

  const allPassed = results.length > 0 && results.every(r => r.passed);

  const submitLevel = () => {
    if (!allPassed) {
      setError('You must pass all tests before submitting.');
      return;
    }
    // advance or finish
    if (level < problemData.levels.length) {
      setLevel(l => l + 1);
      setResults([]);
      setError('');
    } else {
      setFinished(true);
    }
  };

  if (!problemData) {
    return <div style={{ padding: 20 }}>{error || 'Loading…'}</div>;
  }

  const lvlData = problemData.levels.find(l => l.level_number === level);
  const fmt = txt => txt.replace(/(\w+)\(/g, '<strong>$1</strong>(');

  return (
    <div className="problem-view-container theme-dark">
      <PanelGroup direction="horizontal" className="panel-group">
        {/* Left Panel */}
        <Panel defaultSize={40} minSize={25} maxSize={75} className="panel panel-left">
          <div className="panel-content problem-description">
            <section className="problem-section problem-title-section">
              <h3>{problemData.title}</h3>
            </section>

            <section className="problem-section problem-roadmap-section">
              <h4>Roadmap</h4>
              <pre className="roadmap-text">{problemData.description_roadmap}</pre>
            </section>

            <section className="problem-section problem-level-section">
              <h4>Level {lvlData.level_number}: {lvlData.title}</h4>
              <div
                className="level-description"
                dangerouslySetInnerHTML={{ __html: fmt(lvlData.description_specific) }}
              />

              <h5>Sample Cases (Preview)</h5>
              <p className="sample-cases-info">
                Illustrative—your code will be tested against hidden, comprehensive cases.
              </p>
              <ul className="sample-cases-list">
                {lvlData.test_cases_preview.map((tc, i) => (
                  <li key={i}><code>{tc}</code></li>
                ))}
              </ul>

              <div className="level-navigation">
                <button disabled>← Prev</button>
                <span>Level {level} of {problemData.levels.length}</span>
                <button disabled>Next →</button>
              </div>
            </section>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Right Panel */}
        <Panel minSize={25} className="panel panel-right">
          <PanelGroup direction="vertical">
            {/* Editor */}
            <Panel defaultSize={70} minSize={20} className="panel-editor">
              <Editor
                height="100%"
                theme="vs-dark"
                language="python"
                value={userCode}
                onChange={onChangeCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  automaticLayout: true
                }}
                key={`${problemId}-${level}`}
              />
            </Panel>

            <PanelResizeHandle className="resize-handle-horizontal" />

            {/* Console / Results */}
            <Panel defaultSize={30} minSize={10} className="panel-console">
              <div className="panel-content console-output">
                {error && <div className="error-text">{error}</div>}
                {running && <div>Running tests…</div>}
                {!running && results.length > 0 && (
                  <div style={{ margin: '1rem 0', fontSize: '1.1em' }}>
                    Passed <strong>{results.filter(r => r.passed).length}</strong> of <strong>{results.length}</strong> tests
                  </div>
                )}
                {finished && (
                  <div style={{ margin: '1rem 0', fontSize: '1.1em', color: '#63b3ed' }}>
                    🎉 Congratulations! You’ve completed all levels!
                  </div>
                )}

                <div className="action-buttons">
                  <button onClick={runTests} disabled={running || finished}>
                    {running ? 'Running…' : 'Run Code'}
                  </button>
                  <button onClick={submitLevel} disabled={finished}>
                    {level < problemData.levels.length
                      ? `Submit Level ${level}`
                      : 'Finish Challenge'}
                  </button>
                  <button onClick={onBackToList} className="exit-button">
                    Exit Challenge
                  </button>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
