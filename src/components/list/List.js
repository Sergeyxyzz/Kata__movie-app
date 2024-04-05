import React, { useContext, useEffect, useState } from 'react'
import './styles.css'
import { FilmContext } from '../context/Context'
import { v4 as uuidv4 } from 'uuid'
import { Pagination } from 'antd'
import FilmCard from '../filmCard/FilmCard'

const List = () => {
  const data = useContext(FilmContext)
  const [infoMsg, setInfoMsg] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.allMovies.slice(indexOfFirstItem, indexOfLastItem)
  const handleChangePage = (page) => {
    setCurrentPage(page)
  }

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
            {currentItems.map((value) => (
              <FilmCard key={uuidv4()} filmData={value} />
            ))}
          </div>
          <div className="footer">
            <div className="pagination">
              <Pagination
                current={currentPage}
                total={data.allMovies.length}
                defaultPageSize={itemsPerPage}
                onChange={handleChangePage}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default List
