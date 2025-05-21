import React from 'react'
import { createRoot } from 'react-dom/client'
import StickyHeadroom from '../src/Headroom'
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

const Country = styled.div<{ stickyTop: number }>`
  position: sticky;
  top: ${props => props.stickyTop}px;
  padding: 20px 10px;
  background-color: #bbbbbb;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  transition: top 0.2s ease-out;
`

const City = styled.div`
  padding: 5px 20px;
`

class Demo extends React.PureComponent<Record<string, never>, { stickyTop: number; secondStickyTop: number }> {
  state = {
    stickyTop: 0,
    secondStickyTop: 0,
  }

  secondScroller = React.createRef<HTMLDivElement>()
  resolveSecondScroller = () => this.secondScroller.current

  onStickyTopChanged = (stickyTop: number) => {
    this.setState({ stickyTop })
  }

  onSecondStickyTopChanged = (secondStickyTop: number) => {
    this.setState({ secondStickyTop })
  }

  render() {
    const { stickyTop, secondStickyTop } = this.state
    return (
      <>
        <PreHeader>
          <h3>Small Preheader</h3>
          <p>
            This is a demo for ReactStickyHeadroom{' '}
            <a href='https://github.com/integreat/react-sticky-headroom'>(Github)</a>!
          </p>
        </PreHeader>
        <StickyHeadroom pinStart={150} height={100} scrollHeight={50} onStickyTopChanged={this.onStickyTopChanged}>
          <Header>
            <h2>ReactStickyHeadroom</h2>
            <h5>Submenu is always there for you, so keep on scrolling!</h5>
          </Header>
        </StickyHeadroom>
        <div style={{ padding: '20px' }}>
          <h2>
            You can look at the underlying code{' '}
            <a href='https://github.com/Integreat/react-sticky-headroom/tree/master/demo/demo.js'>here</a>.
          </h2>
          <h3>Look at all these cities grouped by their countries:</h3>
        </div>
        {(Object.keys(CITIES) as Array<keyof typeof CITIES>).map(key => (
          <div key={key}>
            <Country stickyTop={stickyTop}>{key}</Country>
            {CITIES[key].map(city => (
              <City key={city}>{city}</City>
            ))}
          </div>
        ))}

        <div style={{ height: '600px', overflowY: 'scroll', border: '2px solid red' }} ref={this.secondScroller}>
          <PreHeader>
            <h3>Small Preheader</h3>
            <p>This is a demo for StickyHeadroom in a second scrolling box!</p>
          </PreHeader>
          <StickyHeadroom
            onStickyTopChanged={this.onSecondStickyTopChanged}
            scrollHeight={50}
            pinStart={150}
            parent={this.secondScroller.current}
            height={100}>
            <Header>
              <h2>ReactStickyHeadroom</h2>
              <h5>Second submenu is always visible in the box, so keep on scrolling!</h5>
            </Header>
          </StickyHeadroom>
          {(Object.keys(CITIES) as Array<keyof typeof CITIES>).map(key => (
            <div key={key}>
              <Country stickyTop={secondStickyTop}>{key}</Country>
              {CITIES[key].map(city => (
                <City key={city}>{city}</City>
              ))}
            </div>
          ))}
        </div>
      </>
    )
  }
}

const container = document.getElementById('react-container')

if (container == null) {
  throw new Error("Couldn't find element with id container.")
}

const root = createRoot(container)
root.render(<Demo />)
