import React, { useContext } from 'react'
import { Alert } from 'antd'
import './styles.css'
import { FilmContext } from '../context/Context'
import { v4 as uuidv4 } from 'uuid'
import FilmCard from '../filmCard/FilmCard'

const RatedFilms = () => {
  const data = useContext(FilmContext)
  const films = data.ratedFilms
  return (
    <div className="listWrap">
      {films.length === 0 ? (
        <Alert message="Нет оцененных фильмов" type="info" />
      ) : (
        films.map((value) => <FilmCard key={uuidv4()} filmData={value} />)
      )}
    </div>
  )
}

export default RatedFilms
