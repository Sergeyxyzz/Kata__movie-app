import React, { useContext } from 'react'
import { FilmContext } from '../context/Context'
import './styles.css'

function App() {
  const data = useContext(FilmContext)

  return (
    <div className="app">
      <div className="cards">{data.categories}</div>
    </div>
  )
}

export default App
