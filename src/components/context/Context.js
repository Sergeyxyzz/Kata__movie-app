import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useCallback,
} from 'react'
import { debounce } from 'lodash'
import './styles.css'
import { Alert, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Header from '../header/Header'
import List from '../list/List'
import RatedFilms from '../ratedFilms/RatedFilms'
import PropTypes from 'prop-types'

export const FilmContext = createContext()

const Context = (props) => {
  const [title, setTitle] = useState('')
  const [allMovies, setAllMovies] = useState([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState(null)
  const [guestSessionId, setGuestSessionId] = useState(null)
  const [genres, setGenres] = useState([])
  const [ratedFilms, setRatedFilms] = useState([])
  const [saveRating, setSaveRating] = useState({})
  const [flagSwithcer, setFlagSwitcher] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(null)
  const apiKey = 'ea0641aa27683a6a9db5de1a1e5bdaef'
  const authenticationToken =
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlYTA2NDFhYTI3NjgzYTZhOWRiNWRlMWExZTViZGFlZiIsInN1YiI6IjY1ZjgzZTI4Mjg3MjNjMDE3Y2JhM2QzOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.LhX-bU4esDbg5pRbphVtqsvaqgzXmtqxrVEfrHlNwMQ'

  const options = useMemo(
    () => ({
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: authenticationToken,
      },
    }),
    [],
  )

  useEffect(() => {
    setCategories(<List />)

    fetch(
      'https://api.themoviedb.org/3/authentication/guest_session/new',
      options,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create guest session')
        }
        return response.json()
      })
      .then((response) => {
        if (response && response.guest_session_id) {
          setGuestSessionId(response.guest_session_id)
        } else {
          throw new Error('Guest session ID not found in response')
        }
      })
      .catch((err) => {
        console.error(err)
      })

    fetch('https://api.themoviedb.org/3/genre/movie/list', options)
      .then((response) => response.json())
      .then((response) => setGenres(response.genres))
      .catch((err) => console.error(err))
  }, [options])

  const items = [
    {
      key: '1',
      label: 'All Movies',
      component: <List />,
    },
    {
      key: '2',
      label: 'Rated Movies',
      component: <RatedFilms />,
    },
  ]

  const onChangeCategory = (key) => {
    const selectedComponent = items.find((item) => item.key === key)?.component
    setFlagSwitcher((prevFlag) => !prevFlag)
    setCategories(selectedComponent)
  }

  const getColorByRating = (rating) => {
    if (rating >= 0 && rating < 3) {
      return '#E90000'
    } else if (rating >= 3 && rating < 5) {
      return '#E97E00'
    } else if (rating >= 5 && rating < 7) {
      return '#E9D100'
    } else {
      return '#66E900'
    }
  }

  const handleChangePage = (page) => {
    setCurrentPage(page)
    searchMovie(title.trim(), page)
  }

  const searchMovie = useCallback(
    debounce((title, page) => {
      setIsLoadingMovies(true)

      fetch(
        `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=${page}`,
        options,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('No connection')
          }
          return response.json()
        })
        .then((response) => {
          setAllMovies(response.results)
          setTotalPages(response.total_pages)
          setTotalResults(response.total_results)
          setIsLoadingMovies(false)
        })
        .catch((err) => {
          setError(err)
          setIsLoadingMovies(false)
        })
    }, 500),
    [options, setAllMovies, setIsLoadingMovies, setError, setTotalPages],
  )

  useEffect(() => {
    searchMovie(title.trim(), currentPage)
  }, [searchMovie, title, currentPage])

  useEffect(() => {
    if (title.trim()) {
      setCurrentPage(1)
    }
  }, [title])

  const addMovieRating = async (id, rating) => {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: authenticationToken,
      },
      body: JSON.stringify({ value: rating }),
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/rating?api_key=${apiKey}&guest_session_id=${guestSessionId}`,
        options,
      )
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  const getRatedMovie = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=${apiKey}`,
        options,
      )

      if (res.ok) {
        const body = await res.json()
        if (Array.isArray(body.results) && body.results.length > 0) {
          console.log(body.results)
          setRatedFilms(body.results)
        } else {
          console.log('Данные отсутствуют или некорректны')
        }
        return body
      } else {
        console.error(
          'Ошибка при получении данных:',
          res.status,
          res.statusText,
        )
      }
    } catch (error) {
      console.error('Произошла ошибка при выполнении запроса: ', error.message)
    }
  }

  const handleGrade = (rate, id) => {
    return new Promise(async (resolve, reject) => {
      try {
        setSaveRating({
          ...saveRating,
          [id]: rate,
        })
        await addMovieRating(id, rate)
        await getRatedMovie()
        resolve()
      } catch (error) {
        console.error(error)
        reject(error)
      }
    })
  }

  const value = {
    title,
    setTitle,
    allMovies,
    setAllMovies,
    items,
    onChangeCategory,
    categories,
    apiKey,
    guestSessionId,
    options,
    authenticationToken,
    setRatedFilms,
    ratedFilms,
    saveRating,
    handleGrade,
    flagSwithcer,
    getColorByRating,
    genres,
    handleChangePage,
    currentPage,
    totalPages,
    totalResults,
  }

  return (
    <FilmContext.Provider value={value}>
      <div className="app">
        <Header />
      </div>
      {isLoadingMovies ? (
        <div className="app">
          <div className="cards">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: '150px' }} spin />}
            />
          </div>
        </div>
      ) : error ? (
        <div className="app">
          <div className="cards">
            <Alert
              message="Ошибка загрузки данных с сервера: вероятно, у вас пропал интернет. Проверьте подключение к интернету и перезагрузите страницу."
              type="error"
            />
          </div>
        </div>
      ) : (
        props.children
      )}
    </FilmContext.Provider>
  )
}

Context.propTypes = {
  children: PropTypes.node,
}

export default Context
