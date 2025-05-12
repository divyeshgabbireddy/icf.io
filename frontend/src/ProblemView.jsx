// icf.io/frontend/src/ProblemView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import './ProblemView.css'; // Ensure this CSS file exists

const API_BASE_URL = 'http://localhost:8000';

function ProblemView({ problemId, onBackToList }) {
  const [problemData, setProblemData] = useState(null);
  const [error, setError] = useState('');
  const [userCode, setUserCode] = useState('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const editorTheme = 'vs-dark'; // Fixed dark theme

  useEffect(() => {
    // Fetch problem data
    if (problemId) {
      setError('');
      setProblemData(null);
      axios.get(`${API_BASE_URL}/api/problems/${problemId}`)
        .then(response => {
          setProblemData(response.data);
          // Use the simplified stub from the JSON now
          setUserCode(response.data.initial_code_stub || '');
          setCurrentLevel(1);
        })
        .catch(err => {
          const errorMsg = err.response?.data?.detail || `Failed to load problem: ${problemId}`;
          setError(errorMsg);
        });
    }
  }, [problemId]);

  function handleEditorChange(value, event) {
    setUserCode(value);
  }

  // --- Render Logic ---
  if (error) {
      return ( // Return Error View
          <div style={{ padding: '20px' }}>
              <button onClick={onBackToList} style={{ marginBottom: '15px' }}>← Back to Problems</button>
              <div className="error" style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
                <strong>Error Loading Problem:</strong><br />
                {error}
              </div>
          </div>
      );
  }
  if (!problemData) {
      return ( // Return Loading View
          <div style={{ padding: '20px' }}>
              <p>Loading problem details...</p>
          </div>
      );
  }

  const levelDetails = problemData.levels.find(l => l.level_number === currentLevel);

  // Helper function to format method names in the description
  const formatMethodName = (text) => {
    return text.replace(/(\w+)\(/g, '<strong>$1</strong>(');
  };

  return (
    <div className="problem-view-container theme-dark">
      <PanelGroup direction="horizontal" className="panel-group">
        {/* Left Panel: Problem Info */}
        <Panel defaultSize={40} minSize={25} maxSize={75} className="panel panel-left">
          <div className="panel-content problem-description">
            <section className="problem-section problem-title-section">
              <h3>{problemData.title}</h3>
            </section>

            <section className="problem-section problem-roadmap-section">
              <h4>Roadmap</h4>
              {problemData.description_roadmap ? (
                <p className="roadmap-text">{problemData.description_roadmap}</p>
              ) : (
                <p>Roadmap not available.</p>
              )}
            </section>

            <section className="problem-section problem-level-section">
              {levelDetails ? (
                <>
                  <h4>Level {levelDetails.level_number}: {levelDetails.title}</h4>
                  <div 
                    className="level-description"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMethodName(levelDetails.description_specific)
                    }}
                  />

                  <h5>Sample Cases (Preview)</h5>
                  <p className="sample-cases-info">
                    These are simplified examples to illustrate expected input/output. Your code will be tested against more comprehensive hidden cases.
                  </p>
                  {levelDetails.test_cases_preview && levelDetails.test_cases_preview.length > 0 ? (
                    <ul className="sample-cases-list">
                      {levelDetails.test_cases_preview.map((tc, index) => (
                        <li key={index}><code>{tc}</code></li>
                      ))}
                    </ul>
                  ) : (
                    <p>No sample cases provided for this level.</p>
                  )}
                </>
              ) : (
                <p className="error-text">Could not find details for level {currentLevel}.</p>
              )}

              <div className="level-navigation">
                <button
                  disabled={currentLevel <= 1}
                  onClick={() => setCurrentLevel(c => Math.max(1, c - 1))}
                  title="Go to Previous Level"
                >
                  ← Prev
                </button>
                <span>Level: {currentLevel} of {problemData.levels.length}</span>
                <button
                  disabled={currentLevel >= problemData.levels.length}
                  onClick={() => setCurrentLevel(c => Math.min(problemData.levels.length, c + 1))}
                  title="Go to Next Level"
                >
                  Next →
                </button>
              </div>
            </section>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Right Panel: Editor & Console */}
        <Panel minSize={25} className="panel panel-right">
          <PanelGroup direction="vertical">
            {/* Editor Panel */}
            <Panel defaultSize={70} minSize={20} className="panel-editor">
              <Editor
                height="100%"
                language="python"
                theme={editorTheme}
                value={userCode}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
                key={`${problemId}-${editorTheme}-${problemData.initial_code_stub}`}
              />
            </Panel>
            <PanelResizeHandle className="resize-handle-horizontal" />
            {/* Console/Results Panel */}
            <Panel defaultSize={30} minSize={10} className="panel-console">
              <div className="panel-content console-output">
                <h4>Console / Test Results</h4>
                <pre id="output-console">Output will appear here...</pre>
                <div className="action-buttons">
                  <button>Run Code</button>
                  <button>Submit Level {currentLevel}</button>
                  <button onClick={onBackToList} className="exit-button">Exit Challenge</button>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default ProblemView;