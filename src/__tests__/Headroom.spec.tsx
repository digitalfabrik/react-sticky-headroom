import { ReactWrapper, mount } from 'enzyme'
import Headroom from '../Headroom'
import 'jest-styled-components'
import React, { ComponentProps } from 'react'

const pinStart = 10
const height = 100
const scrollHeight = 50

type MountedHeadroom = ReactWrapper<ComponentProps<typeof Headroom>, object, InstanceType<typeof Headroom>>

describe('Headroom', () => {
  const MockNode = () => <div />

  const createComponent = (
    props: Partial<ComponentProps<typeof Headroom>> = {}
  ) =>
    mount(
      <Headroom scrollHeight={50} height={100} {...props}>
        <MockNode />
      </Headroom>
    ) as MountedHeadroom

  it('should have correct default state', () => {
    const component = createComponent()
    expect(component.state()).toEqual({
      mode: 'static',
      transition: 'none',
      animateUpFrom: null
    })
    expect(component.prop('pinStart')).toEqual(0)
  })

  it('should render with values from its state', () => {
    const component = createComponent()
    component.setState({ transform: 42, stickyTop: 24 })
    expect(component.childAt(0).props()).toEqual({
      animateUpFrom: null,
      children: <MockNode />,
      className: undefined,
      positionStickyDisabled: false,
      $static: true,
      $top: -50,
      transition: 'none',
      translateY: 0,
      $zIndex: 1
    })
  })

  it('should attach and detach listener for onscroll event', () => {
    const originalAdd = window.addEventListener
    const originalRemove = window.removeEventListener
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()

    const component = mount(<Headroom scrollHeight={50}><MockNode /></Headroom>) as MountedHeadroom
    const handleEventCallback = component.instance().handleEvent
    expect(window.addEventListener).toHaveBeenCalledWith(
      'scroll',
      handleEventCallback
    )
    component.unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      handleEventCallback
    )

    window.addEventListener = originalAdd
    window.removeEventListener = originalRemove
  })

  it('should request animation frame and update, on handleEvent', () => {
    const originalRaf = window.requestAnimationFrame
    const requestAnimationFrameMock = jest.fn()
    window.requestAnimationFrame = requestAnimationFrameMock
    const component = mount(<Headroom scrollHeight={50}><MockNode /></Headroom>) as MountedHeadroom
    component.instance().update = jest.fn()

    // Call first time
    component.instance().handleEvent()
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(component.instance().update).toHaveBeenCalledTimes(0)
    // Now perform the raf
    requestAnimationFrameMock.mock.calls[0][0]()
    expect(component.instance().update).toHaveBeenCalledTimes(1)

    window.requestAnimationFrame = originalRaf
  })

  describe('update', () => {
    const scrollTo = (scrollTo: number, component: ReturnType<typeof createComponent>) => {
      window.pageYOffset = scrollTo
      component.instance().update()
    }
    it("should set correct state, if user hasn't scrolled beyond pinStart", () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      scrollTo(0, component)
      scrollTo(pinStart / 2, component)
      expect(component.state()).toEqual({
        mode: 'static',
        transition: 'none',
        animateUpFrom: null
      })
    })

    it('should set correct state, if user has scrolled down to pinStart + scrollHeight/2', () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      scrollTo(0, component)
      scrollTo(pinStart + scrollHeight / 2, component)
      expect(component.state()).toEqual({
        mode: 'static',
        transition: 'none',
        animateUpFrom: null
      })
    })

    it('should set correct state, if user has scrolled down and back up again', () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      scrollTo(pinStart, component)
      expect(component.state()).toEqual({
        mode: 'static',
        transition: 'none',
        animateUpFrom: null
      })

      const offset = 5
      scrollTo(pinStart + scrollHeight, component)
      // Header is completely transformed to the top
      expect(component.state()).toEqual({
        mode: 'static',
        transition: 'none',
        animateUpFrom: null
      })

      scrollTo(pinStart + scrollHeight + offset, component)
      // Header should be unpinned now, transitions should be off though
      expect(component.state()).toEqual({
        mode: 'unpinned',
        transition: 'none',
        animateUpFrom: null
      })

      scrollTo(pinStart + offset / 2, component)
      // Header should be pinned with transition, because we're scrolling upwards
      expect(component.state()).toEqual({
        mode: 'pinned',
        transition: 'normal',
        animateUpFrom: null
      })

      scrollTo(pinStart + offset, component)
      expect(component.state()).toEqual({
        mode: 'static',
        transition: 'pinned-to-static',
        animateUpFrom: offset
      })
    })

    it("shouldn't update state if update is called with same scrollTop", () => {
      const component = createComponent({ pinStart, height, scrollHeight })
      const offset = 5
      scrollTo(pinStart + scrollHeight + offset, component)
      expect(component.state()).toEqual({
        mode: 'unpinned',
        transition: 'none',
        animateUpFrom: null
      })
      scrollTo(pinStart + scrollHeight + offset, component)
      expect(component.state()).toEqual({
        mode: 'unpinned',
        transition: 'none',
        animateUpFrom: null
      })
    })

    it('should call onStickyTopChanged if mode has changed', () => {
      const onStickyTopChanged = jest.fn()
      const component = createComponent({
        pinStart,
        height,
        scrollHeight,
        onStickyTopChanged
      })

      scrollTo(pinStart + scrollHeight + 10, component)
      expect(onStickyTopChanged).toHaveBeenCalledWith(scrollHeight)
      scrollTo(0, component)
      expect(onStickyTopChanged).toHaveBeenCalledWith(height - scrollHeight)
    })
  })

  it('should render correct if state is static, no transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'static', transition: 'none' })
    expect(component.childAt(0).props()).toEqual({
      animateUpFrom: null,
      children: <MockNode />,
      className: undefined,
      positionStickyDisabled: false,
      $static: true,
      $top: -50,
      transition: 'none',
      translateY: 0,
      $zIndex: 1
    })
  })

  it('should render correct if state is unpinned, no transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'unpinned', transition: 'none' })
    expect(component.childAt(0).props()).toEqual({
      animateUpFrom: null,
      children: <MockNode />,
      className: undefined,
      positionStickyDisabled: false,
      $static: false,
      $top: 0,
      transition: 'none',
      translateY: -50,
      $zIndex: 1
    })
  })

  it('should render correct if state is unpinned, transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'unpinned', transition: 'normal' })
    expect(component.childAt(0).props()).toEqual({
      animateUpFrom: null,
      children: <MockNode />,
      className: undefined,
      positionStickyDisabled: false,
      $static: false,
      $top: 0,
      transition: 'normal',
      translateY: -50,
      $zIndex: 1
    })
  })

  it('should render correct if state is pinned, transition', () => {
    const component = createComponent({ pinStart, height, scrollHeight })
    component.setState({ mode: 'pinned', transition: 'normal' })
    expect(component.childAt(0).props()).toEqual({
      animateUpFrom: null,
      children: <MockNode />,
      className: undefined,
      positionStickyDisabled: false,
      $static: false,
      $top: 0,
      transition: 'normal',
      translateY: 0,
      $zIndex: 1
    })
  })
})
