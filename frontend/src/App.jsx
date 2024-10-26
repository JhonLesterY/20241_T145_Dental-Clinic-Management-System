import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <a href="/" className="nav-link">Unicare</a>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="/" className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="/about" className="nav-link">About</a>
          </li>
          <li className="nav-item">
            <a href="/contact" className="nav-link">Contact</a>
          </li>
          <li className="nav-item">
            <a href="/login" className="nav-link">Login</a>
          </li>
        </ul>
      </nav>

      {/* Landing Page */}
      <div className="container">
        <h1>Welcome to BukSU Dental Clinic</h1>
        <p>This is the landing page. More content will be added soon!</p>
      </div>
    </>
  )
}

export default App
