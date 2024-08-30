// src/App.js
import Home from './components/Home';
import './App.css'; // Ensure Tailwind CSS is imported
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Home />
      <Footer />
    </div>
  );
}

export default App;