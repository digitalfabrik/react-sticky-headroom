// @flow

import ReactDOM from 'react-dom'
import React from 'react'
import ReactStickyHeadroom from '../src/Headroom'
import styled from 'styled-components'
import CITIES from './cities'

const Header = styled.header`
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: dodgerblue;
  
  h2 {
    margin: 10px;
  }
`

const PreHeader = styled.div`
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: aquamarine;
`

const Country = styled.div`
  position: sticky;
  top: ${props => props.stickyTop}px;
  padding: 5px;
  background-color: #bbbbbb;
  border-bottom: black solid 1px;
  transition: top 0.2s ease-out;
`

const City = styled.div`
  padding: 5px;
`

class Demo extends React.Component<{}, { stickyTop: number }> {
  state = { stickyTop: 0 }

  onStickyTopChanged = (stickyTop: number) => {
    this.setState({ stickyTop })
  }

  render () {
    const stickyTop = this.state.stickyTop
    return <>
      <PreHeader>
        <h3>Small Preheader</h3>
        <p>This is a demo for ReactStickyHeadroom <a href='https://github.com/integreat/react-sticky-headroom'>(Github)</a>!</p>
      </PreHeader>
      <ReactStickyHeadroom pinStart={150} height={100} scrollHeight={50}
                           onStickyTopChanged={this.onStickyTopChanged}>
        <Header>
          <h2>ReactStickyHeadroom</h2>
          <h5>Submenu is always there for you, so keep on scrolling!</h5>
        </Header>
      </ReactStickyHeadroom>
      <h2>You can look at the underlying code <a href='https://github.com/Integreat/react-sticky-headroom/tree/master/demo/Demo.js'>here</a>.</h2>
      <h3>Look at all these cities grouped by their countries:</h3>
      {Object.keys(CITIES).map(key =>
          <div key={key}>
            <Country stickyTop={stickyTop}>
              {key}
            </Country>
            {
              CITIES[key].map(city => <City key={city}>{city}</City>)
            }
          </div>
      )}
    </>
  }
}

const container = document.getElementById('react-container')
if (container) {
  ReactDOM.render(<Demo />, container)
}
