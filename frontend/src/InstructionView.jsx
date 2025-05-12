// icf.io/frontend/src/InstructionView.jsx
import React from 'react';
import './InstructionView.css'; // We'll create this CSS file next

function InstructionView({ problemTitle, onStartChallenge, onBackToList }) {
  return (
    <div className="instruction-view">
      <button onClick={onBackToList} className="back-button">← Back to Problems</button>
      <h1>Coding Challenge Instructions</h1>
      <h2>Problem: {problemTitle}</h2>
      <hr/>
      <p>
        This is a <strong>progressive, project-based coding challenge</strong> designed to simulate real-world software development tasks.
      </p>
      <ul>
        <li>You will build out functionality incrementally across <strong>multiple levels</strong>.</li>
        <li>Each level introduces new requirements, building upon your previous work.</li>
        <li>Focus on writing <strong>clean, maintainable, and correct code</strong>. Good design choices in earlier levels will make later levels much easier.</li>
        <li>You will need to implement the specified functions or class methods for each level.</li>
        <li>Hidden test cases will evaluate your solution's correctness and edge-case handling at each level. You must pass all tests to proceed.</li>
        <li>A global timer (we'll add this later!) will track your progress for the entire challenge.</li>
      </ul>
      <p>
        When you are ready to begin, click the "Start Challenge" button below. Good luck!
      </p>
      <button onClick={onStartChallenge} className="start-button">
        Start Challenge →
      </button>
    </div>
  );
}

export default InstructionView;