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

export const FilmContext = createContext()

const Context = (props) => {
  const [title, setTitle] = useState('')
  const [allMovies, setAllMovies] = useState([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState()
  const [guestSessionId, setGuestSessionId] = useState(null)
  const [genres, setGenres] = useState([])
  const [ratedFilms, setRatedFilms] = useState([])
  const [saveRating, setSaveRating] = useState({})
  const [flagSwithcer, setFlagSwitcher] = useState(true)
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

    // создал сессию
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

    // получил жанры
    fetch('https://api.themoviedb.org/3/genre/movie/list', options)
      .then((response) => response.json())
      .then((response) => setGenres(response.genres))
      .catch((err) => console.error(err))
  }, [options])

  // смена табов
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

  // покраска кружочка
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

  // поиск фильмов (может показаться, что useCallBack здесь не нужен и + про это говорит линтер, но если убрать useCallback и присвоить только debounce - то начинается бесконечный ререндер)
  const searchMovie = useCallback(
    debounce((title) => {
      setIsLoadingMovies(true)

      fetch(`https://api.themoviedb.org/3/search/movie?query=${title}`, options)
        .then((resp) => {
          if (!resp.ok) {
            throw new Error('No connection')
          }
          return resp.json()
        })
        .then((resp) => {
          setAllMovies(resp.results)
        })
        .catch((err) => {
          setError(err)
        })
        .finally(() => {
          setIsLoadingMovies(false)
        })
    }, 500),
    [options, setAllMovies, setIsLoadingMovies, setError],
  )

  useEffect(() => {
    searchMovie(title.trim())
  }, [searchMovie, title])

  // функция POST фильма на сервер
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

  // функция GET оцененного фильма
  const getRatedMovie = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: authenticationToken,
      },
    }

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

  // функция: оценка фильма, потом POST, потом GET
  const handleGrade = (rate, id) => {
    return new Promise(async (resolve, reject) => {
      try {
        setSaveRating({
          ...saveRating,
          [id]: rate,
        })
        await addMovieRating(id, rate) // отправил фильм на сервер
        await getRatedMovie() // получил фильм с сервера
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

export default Context
