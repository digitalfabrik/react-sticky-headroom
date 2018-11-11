// @flow

import * as React from 'react'
import { mount, shallow } from 'enzyme'
import Headroom from '../Headroom'
import 'jest-styled-components'

const pinStart = 10
const height = 100
const scrollHeight = 50

describe('Headroom', () => {
  const MockNode = () => <div />

  const createComponent = props => mount(
    <Headroom scrollHeight={50}
              height={100}
              {...props}>
      <MockNode />
    </Headroom>)

  it('should have correct default state', () => {
    const component = createComponent()
    expect(component.state()).toEqual({ mode: 'static', transition: 'none', keyframes: null })
    expect(component.prop('pinStart')).toEqual(0)
  })

  it('should render with values from its state', () => {
    const component = createComponent()
    component.setState({ transform: 42, stickyTop: 24 })
    expect(component).toMatchSnapshot()
  })

  it('should render with no stickyAncestor supplied', () => {
    const component = shallow(
      <Headroom scrollHeight={50}><MockNode /></Headroom>)
    expect(component).toMatchSnapshot()
  })

  it('should attach and detach listener for onscroll event', () => {
    const originalAdd = window.addEventListener
    const originalRemove = window.removeEventListener
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()

    const component = mount(<Headroom scrollHeight={50}><MockNode /></Headroom>)
    const handleEventCallback = component.instance().handleEvent
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', handleEventCallback)
    component.unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', handleEventCallback)

    window.addEventListener = originalAdd
    window.removeEventListener = originalRemove
  })

  it('should request animation frame and update, on handleEvent', () => {
    const originalRaf = window.requestAnimationFrame
    window.requestAnimationFrame = jest.fn()
    const component = mount(<Headroom scrollHeight={50}><MockNode /></Headroom>)
    component.instance().update = jest.fn()

    // Call first time
    component.instance().handleEvent()
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(component.instance().update).toHaveBeenCalledTimes(0)
    // Now perform the raf
    window.requestAnimationFrame.mock.calls[0][0]()
    expect(component.instance().update).toHaveBeenCalledTimes(1)

    window.requestAnimationFrame = originalRaf
  })

  describe('update', () => {
    it('should set correct state, if user hasn\'t scrolled beyond pinStart', () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      const scrollTo = scrollTo => {
        window.pageYOffset = scrollTo
        component.instance().update()
      }
      scrollTo(0)
      scrollTo(pinStart / 2)
      expect(component.state()).toEqual({ mode: 'static', transition: 'none', keyframes: null })
    })

    it('should set correct state, if user has scrolled down to pinStart + scrollHeight/2', () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      const scrollTo = scrollTo => {
        window.pageYOffset = scrollTo
        component.instance().update()
      }

      scrollTo(0)
      scrollTo(pinStart + scrollHeight / 2)
      expect(component.state()).toEqual({ mode: 'static', transition: 'none', keyframes: null })
    })

    it('should set correct state, if user has scrolled down and back up again', () => {
      const component = createComponent({ pinStart, height, scrollHeight, keyframes: null })
      const scrollTo = scrollTo => {
        window.pageYOffset = scrollTo
        component.instance().update()
      }

      scrollTo(pinStart)
      expect(component.state()).toEqual({ mode: 'static', transition: 'none', keyframes: null })

      const offset = 5
      scrollTo(pinStart + scrollHeight)
      // Header is completely transformed to the top
      expect(component.state()).toEqual({ mode: 'static', transition: 'none', keyframes: null })

      scrollTo(pinStart + scrollHeight + offset)
      // Header should be unpinned now, transitions should be off though
      expect(component.state()).toEqual({ mode: 'unpinned', transition: 'none', keyframes: null })

      scrollTo(pinStart + scrollHeight)
      // Header should be pinned with transition, because we're scrolling upwards
      expect(component.state()).toEqual({ mode: 'pinned', transition: 'normal', keyframes: null })

      scrollTo(pinStart)
      expect(component.state()).toEqual({ mode: 'static', transition: 'pinned-to-static', keyframes: expect.any(Object) })
    })

    it('shouldn\'t update state update is called with same scrollTop', () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      const scrollTo = scrollTo => {
        window.pageYOffset = scrollTo
        component.instance().update()
      }
      const offset = 5
      scrollTo(pinStart + scrollHeight + offset)
      expect(component.state()).toEqual({ mode: 'unpinned', transition: 'none', keyframes: null })
      scrollTo(pinStart + scrollHeight + offset)
      expect(component.state()).toEqual({ mode: 'unpinned', transition: 'none', keyframes: null })
    })

    it('should call onStickyTopChanged if mode has changed', () => {
      const onStickyTopChanged = jest.fn()
      const component = createComponent({ pinStart, height, scrollHeight, onStickyTopChanged })
      const scrollTo = scrollTo => {
        window.pageYOffset = scrollTo
        component.instance().update()
      }

      scrollTo(pinStart + scrollHeight + 10)
      expect(onStickyTopChanged).toHaveBeenCalledWith(scrollHeight)
      scrollTo(0)
      expect(onStickyTopChanged).toHaveBeenCalledWith(height - scrollHeight)
    })
  })

  it('should render correct if state is static, no transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'static', transition: 'none' })
    expect(component).toMatchSnapshot()
  })

  it('should render correct if state is unpinned, no transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'unpinned', transition: 'none' })
    expect(component).toMatchSnapshot()
  })

  it('should render correct if state is unpinned, transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'unpinned', transition: 'normal' })
    expect(component).toMatchSnapshot()
  })

  it('should render correct if state is pinned, transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'pinned', transition: 'normal' })
    expect(component).toMatchSnapshot()
  })
})
