import React, { useContext, useEffect, useState } from 'react'
import './styles.css'
import { FilmContext } from '../context/Context'
import { v4 as uuidv4 } from 'uuid'
import { Pagination } from 'antd'
import FilmCard from '../filmCard/FilmCard'

const List = () => {
  const data = useContext(FilmContext)
  const [infoMsg, setInfoMsg] = useState('')

  useEffect(() => {
    if (
      !data.isLoadingMovies &&
      data.allMovies.length === 0 &&
      data.title.length > 0
    ) {
      setTimeout(() => {
        setInfoMsg(<h1 className="filmNotFounded">Фильм не найден</h1>)
      }, 1000)
    } else {
      setInfoMsg(<h1 className="findFilm">Введите название фильма</h1>)
    }
  }, [data.title, data.allMovies.length, data.isLoadingMovies])

  return (
    <>
      {data.allMovies.length === 0 ? (
        infoMsg
      ) : (
        <>
          <div className="listWrap">
            {data.allMovies.map((value) => (
              <FilmCard key={uuidv4()} filmData={value} />
            ))}
          </div>
          <div className="footer">
            <div className="pagination">
              <Pagination
                defaultCurrent={1}
                current={data.currentPage}
                total={data.totalResults}
                pageSize={20}
                onChange={data.handleChangePage}
                showSizeChanger={false}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default List
