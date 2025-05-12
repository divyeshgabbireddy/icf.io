// icf.io/frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import InstructionView from './InstructionView'; // Import the instruction view
import ProblemView from './ProblemView';       // Import the simple problem view
// Make sure ProblemList is also defined or imported if it's separate

const API_BASE_URL = 'http://localhost:8000';

// Define ProblemList component here (or import if it's in its own file)
function ProblemList({ onSelectProblem }) {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/problems`)
      .then(response => {
        setProblems(response.data);
      })
      .catch(err => {
        console.error("Error fetching problems:", err);
        setError('Failed to load problems.');
      });
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h1>Available Problems</h1>
      {problems.length === 0 && !error && <p>Loading problems...</p>}
      <ul>
        {/* Pass the whole problem summary object */}
        {problems.map(problem => (
          <li key={problem.id}>
            <button onClick={() => onSelectProblem(problem)}>
              {problem.title} ({problem.id})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
// End ProblemList component definition


function App() {
  // State for view: 'list', 'instructions', 'challenge'
  const [currentView, setCurrentView] = useState('list');
  // State to hold the currently selected problem's data (summary first)
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleSelectProblem = (problemSummary) => {
    setSelectedProblem(problemSummary); // Store the summary {id, title}
    setCurrentView('instructions');    // Show instructions view
  };

  const handleStartChallenge = () => {
    setCurrentView('challenge');       // Show the actual challenge view
  };

  const handleBackToList = () => {
    setSelectedProblem(null);
    setCurrentView('list');            // Go back to the list view
  };

  // Render based on currentView state
  let viewToRender;
  switch (currentView) {
    case 'instructions':
      viewToRender = (
        <InstructionView
          problemTitle={selectedProblem?.title || 'Loading...'} // Use optional chaining
          onStartChallenge={handleStartChallenge}
          onBackToList={handleBackToList}
        />
      );
      break;
    case 'challenge':
      viewToRender = (
        <ProblemView // Use the simple ProblemView component
          problemId={selectedProblem?.id} // Pass only the ID
          onBackToList={handleBackToList}
        />
      );
      break;
    case 'list':
    default:
      viewToRender = <ProblemList onSelectProblem={handleSelectProblem} />;
  }

  return (
    <div className="App">
      {viewToRender}
    </div>
  );
}

export default App;