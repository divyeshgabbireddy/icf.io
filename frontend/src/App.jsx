// icf.io/frontend/src/App.jsx
import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg'; // Vite logo path might differ slightly depending on Vite version
import './App.css';
import axios from 'axios'; // Import axios

function App() {
  const [count, setCount] = useState(0);
  const [backendMessage, setBackendMessage] = useState('');
  const [apiGreeting, setApiGreeting] = useState('');

  useEffect(() => {
    // Fetch data from the root endpoint
    axios.get('http://localhost:8000/') // Your backend's root URL (FastAPI server)
      .then(response => {
        setBackendMessage(response.data.message);
      })
      .catch(error => {
        console.error("Error fetching root data:", error);
        setBackendMessage("Failed to load message from backend.");
      });

    // Fetch data from the /api/greeting endpoint
    axios.get('http://localhost:8000/api/greeting') // Your backend's API URL
      .then(response => {
        setApiGreeting(response.data.greeting);
      })
      .catch(error => {
        console.error("Error fetching API greeting:", error);
        setApiGreeting("Failed to load greeting from API.");
      });
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {/* Display messages from backend */}
      <h2>Message from Backend:</h2>
      <p>{backendMessage || "Loading backend message..."}</p>
      <h2>Greeting from API:</h2>
      <p>{apiGreeting || "Loading API greeting..."}</p>
    </>
  );
}

export default App;