import React, { useContext } from 'react'
import './styles.css'
import { Card, Flex, Rate } from 'antd'
import { FilmContext } from '../context/Context'
import PropTypes from 'prop-types'

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
                <h3 className="marquee">{filmData.original_title}</h3>
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

FilmCard.propTypes = {
  filmData: PropTypes.shape({
    poster_path: PropTypes.string,
    original_title: PropTypes.string.isRequired,
    vote_average: PropTypes.number.isRequired,
    release_date: PropTypes.string,
    genre_ids: PropTypes.arrayOf(PropTypes.number).isRequired,
    overview: PropTypes.string,
    id: PropTypes.number.isRequired,
  }).isRequired,
}

export default FilmCard
