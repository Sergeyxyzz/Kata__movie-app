// ниже исключения на marquee behavior="alternate"
/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/no-distracting-elements */
import React, { useContext } from 'react'
import './styles.css'
import { Card, Flex, Rate } from 'antd'
import { FilmContext } from '../context/Context'

const shortenText = (description, maxLength = 140) => {
  if (description.length <= maxLength) {
    return description
  }

  return description.slice(0, maxLength).trim() + '...'
}

const FilmCard = ({ filmData }) => {
  const data = useContext(FilmContext)

  return (
    <Card
      hoverable
      className="cardStyle"
      styles={{
        body: {
          padding: 0,
          overflow: 'hidden',
          flexDirection: 'row',
          width: '100%',
        },
      }}
    >
      <Flex justify="space-between" grow="5">
        <img
          alt="avatar"
          src={
            filmData.poster_path
              ? `https://image.tmdb.org/t/p/w500/${filmData.poster_path}`
              : require('./no-image.jpg')
          }
          className="imgStyle"
        />

        <Flex justify="space-around" className="styledFlex">
          <div className="wrapInformation">
            <div className="headerTextStyle">
              <div className="wrapTitleStyle">
                <marquee behavior="alternate">
                  <h3>{filmData.original_title}</h3>
                </marquee>
              </div>
              <div className="wrapVoteStyle">
                <h3
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: data.getColorByRating(filmData.vote_average),
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {filmData.vote_average.toFixed(1)}
                </h3>
              </div>
            </div>
            <div className="wrapInfo">
              <div className="dateTextStyle">{filmData.release_date}</div>
              <div className="genreStyle">
                {data.genres.map((data) => {
                  return filmData.genre_ids.map((genreId) => {
                    if (data.id === genreId) {
                      return (
                        <div key={data.id} className="genreText">
                          {data.name}
                        </div>
                      )
                    }
                    return null
                  })
                })}
              </div>
              <div className="descriptionTextStyle">
                {shortenText(filmData.overview)}
              </div>
            </div>
            <div>
              <Rate
                count={10}
                className="rate"
                value={data.saveRating[filmData.id] || 0}
                onChange={(rate) => data.handleGrade(rate, filmData.id)}
              />
            </div>
          </div>
        </Flex>
      </Flex>
    </Card>
  )
}

export default FilmCard
