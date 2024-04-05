import React, { useContext } from 'react'
import './styles.css'
import { Flex, Input, Tabs } from 'antd'
import { FilmContext } from '../context/Context'

const Header = () => {
  const data = useContext(FilmContext)

  return (
    <div className="headerWrapper">
      <div className="buttons">
        <Flex wrap="wrap" className="site-button-ghost-wrapper">
          <Tabs
            defaultActiveKey="1"
            items={data.items}
            onChange={data.onChangeCategory}
          />
        </Flex>
      </div>
      {data.flagSwithcer ? (
        <Input
          placeholder="Type to search"
          className="inputSearch"
          value={data.title}
          onChange={(e) => data.setTitle(e.target.value)}
        />
      ) : null}
    </div>
  )
}

export default Header
