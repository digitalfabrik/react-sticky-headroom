import React from 'react'
import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'

const DIRECTION_UP = 'up'
const DIRECTION_DOWN = 'down'

const MODE_UNPINNED = 'unpinned'
const MODE_PINNED = 'pinned'
const MODE_STATIC = 'static'

const TRANSITION_NONE = 'none'
const TRANSITION_NORMAL = 'normal'
const TRANSITION_PINNED_TO_STATIC = 'pinned-to-static'

type ModeType = typeof MODE_PINNED | typeof MODE_UNPINNED | typeof MODE_STATIC
type DirectionType = typeof DIRECTION_UP | typeof DIRECTION_DOWN
type TransitionType = typeof TRANSITION_NONE | typeof TRANSITION_NORMAL | typeof TRANSITION_PINNED_TO_STATIC

type PropsType = {
  /** The child node to be displayed as a header */
  children: React.ReactNode
  /** The maximum amount of px the header should move up when scrolling */
  scrollHeight: number
  /** The minimum scrollTop position where the transform should start */
  pinStart: number
  /** Used for calculating the stickyTop position of an ancestor */
  height?: number
  /** Fired, when Headroom changes its state. Passes stickyTop of the ancestor. */
  onStickyTopChanged?: (stickyTop: number) => void
  /** True, if sticky position should be disabled (e.g. for edge 16 support) */
  positionStickyDisabled?: boolean
  /** The parent element firing the scroll event. Defaults to document.documentElement */
  parent?: HTMLElement | null
  /** The z-index used by the wrapper. Defaults to 1. */
  zIndex?: number
  /** A classname for applying custom styles to the wrapper. Use at your own risk. */
  className?: string
}

type StateType = {
  mode: ModeType
  transition: TransitionType
  animateUpFrom: number | null
}

const HeaderWrapper = styled.div<{
  $positionStickyDisabled: boolean
  $translateY: number
  $transition: TransitionType
  $animateUpFrom: number | null
  $zIndex?: number
  $top: number
  $static: boolean
}>`
  position: ${props => (props.$positionStickyDisabled ? 'static' : 'sticky')};
  top: ${props => props.$top}px;
  z-index: ${props => props.$zIndex};
  transform: translateY(${props => props.$translateY}px);
  animation-duration: 0.2s;
  animation-timing-function: ease-out;
  ${props => (props.$transition === TRANSITION_NORMAL && !props.$static ? 'transition: transform 0.2s ease-out;' : '')}
  ${props =>
    props.$transition === TRANSITION_PINNED_TO_STATIC && props.$animateUpFrom !== null
      ? css`
          animation-name: ${keyframesMoveUpFrom(props.$animateUpFrom)};
        `
      : ''}
  ${props => (props.$static ? 'transition: none;' : '')}
`

const keyframesMoveUpFrom = (from: number) => keyframes`
    from {
      transform: translateY(${Math.max(from, 0)}px)
    }

    to {
      transform: translateY(0)
    }
`

class Headroom extends React.PureComponent<PropsType, StateType> {
  static defaultProps: { pinStart: number; zIndex: number; parent: HTMLElement | null } = {
    pinStart: 0,
    zIndex: 1,
    parent: window.document.documentElement,
  }

  state: StateType = {
    mode: MODE_STATIC,
    transition: TRANSITION_NONE,
    animateUpFrom: null,
  }

  /** the very last scrollTop which we know about (to determine direction changes) */
  lastKnownScrollTop: number = 0

  /**
   * @returns {number} the current scrollTop position of the window
   */
  getScrollTop(): number {
    const parent = this.props.parent
    if (parent && parent.scrollTop !== undefined && parent !== document.documentElement) {
      return parent.scrollTop
    }
    if (parent !== document.documentElement) {
      console.warn('Could not determine scrollTop from parent for StickyHeadroom. Defaulting to window.pageYOffset.')
    }
    if (window.pageYOffset === undefined) {
      console.error('window.pageYOffset is undefined. Defaulting to 0.')
      return 0
    }
    return window.pageYOffset
  }

  componentDidMount() {
    this.addScrollListener(this.props.parent)
  }

  addScrollListener(parent?: HTMLElement | null) {
    if (parent === window.document.documentElement) {
      window.addEventListener('scroll', this.handleEvent)
    } else if (parent) {
      parent.addEventListener('scroll', this.handleEvent)
    } else {
      console.debug("'parent' prop of Headroom is null. Assuming, it will be set soon...")
    }
  }

  removeScrollListener(parent?: HTMLElement | null) {
    if (parent === window.document.documentElement) {
      window.removeEventListener('scroll', this.handleEvent)
    } else if (parent) {
      parent.removeEventListener('scroll', this.handleEvent)
    }
  }

  componentDidUpdate(prevProps: PropsType) {
    if (prevProps.parent !== this.props.parent) {
      this.removeScrollListener(prevProps.parent)
      this.addScrollListener(this.props.parent)
    }
  }

  componentWillUnmount() {
    this.removeScrollListener(this.props.parent)
  }

  /**
   * If we're already static and pinStart + scrollHeight >= scrollTop, then we should stay static.
   * If we're not already static, then we should set the header static, only when pinStart >= scrollTop (regardless of
   * scrollHeight, so the header doesn't jump up, when scrolling upwards to the trigger).
   * Else we shouldn't set it static.
   * @param scrollTop the currentScrollTop position
   * @param direction the current direction
   * @returns {boolean} if we should set the header static
   */
  shouldSetStatic(scrollTop: number, direction: DirectionType): boolean {
    if (this.state.mode === MODE_STATIC || (this.state.mode === MODE_PINNED && direction === DIRECTION_DOWN)) {
      return this.props.pinStart + this.props.scrollHeight >= scrollTop
    } else {
      return this.props.pinStart >= scrollTop
    }
  }

  /**
   * Determines the mode depending on the scrollTop position and the current direction
   * @param {number} scrollTop
   * @param {string} direction
   * @returns {string} the next mode of Headroom
   */
  determineMode(scrollTop: number, direction: DirectionType): ModeType {
    if (this.shouldSetStatic(scrollTop, direction)) {
      return MODE_STATIC
    } else {
      return direction === DIRECTION_UP ? MODE_PINNED : MODE_UNPINNED
    }
  }

  /**
   * @returns {TransitionType} determines the kind of transition
   */
  determineTransition(mode: ModeType, direction: DirectionType): TransitionType {
    // Handle special case: If we're pinned and going to static, we need a special transition using css animation
    if (this.state.mode === MODE_PINNED && mode === MODE_STATIC) {
      return TRANSITION_PINNED_TO_STATIC
    }
    // If mode is static, then no transition, because we're already in the right spot
    // (and want to change transform and top properties seamlessly)
    if (mode === MODE_STATIC) {
      return this.state.transition === TRANSITION_NONE ? TRANSITION_NONE : TRANSITION_PINNED_TO_STATIC
    }
    // mode is not static, transition when moving upwards or when we've lastly did the transition
    return direction === DIRECTION_UP || this.state.transition === TRANSITION_NORMAL
      ? TRANSITION_NORMAL
      : TRANSITION_NONE
  }

  /**
   * Checks the current scrollTop position and updates the state accordingly
   */
  update: () => void = () => {
    const currentScrollTop = this.getScrollTop()
    const newState: Partial<StateType> = {}
    if (currentScrollTop === this.lastKnownScrollTop) {
      return
    }
    const direction = this.lastKnownScrollTop < currentScrollTop ? DIRECTION_DOWN : DIRECTION_UP
    newState.mode = this.determineMode(currentScrollTop, direction)
    newState.transition = this.determineTransition(newState.mode, direction)

    const { onStickyTopChanged, height, scrollHeight, pinStart } = this.props
    if (this.state.mode === MODE_PINNED && newState.mode === MODE_STATIC) {
      // animation in the special case from pinned to static
      newState.animateUpFrom = currentScrollTop - pinStart
    }
    if (onStickyTopChanged && newState.mode !== this.state.mode && height) {
      onStickyTopChanged(Headroom.calcStickyTop(newState.mode, height, scrollHeight))
    }
    this.setState(newState as StateType)
    this.lastKnownScrollTop = currentScrollTop
  }

  handleEvent: () => void = () => {
    window.requestAnimationFrame(this.update)
  }

  static calcStickyTop(mode: ModeType, height: number, scrollHeight: number): number {
    return mode === MODE_PINNED ? height : height - scrollHeight
  }

  render(): React.ReactElement {
    const { children, scrollHeight, positionStickyDisabled, zIndex, className } = this.props
    const { mode, transition, animateUpFrom } = this.state
    const transform = mode === MODE_UNPINNED ? -scrollHeight : 0
    const ownStickyTop = mode === MODE_STATIC ? -scrollHeight : 0
    return (
      <HeaderWrapper
        className={className}
        $translateY={transform}
        $top={ownStickyTop}
        $transition={transition}
        $positionStickyDisabled={!!positionStickyDisabled}
        $static={mode === MODE_STATIC}
        $animateUpFrom={animateUpFrom}
        $zIndex={zIndex}>
        {children}
      </HeaderWrapper>
    )
  }
}

export default Headroom
