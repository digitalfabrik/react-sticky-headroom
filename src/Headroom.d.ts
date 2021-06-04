import * as React from 'react'

declare type PropsType = {
    children: Node,
    scrollHeight: number,
    pinStart?: number,
    height?: number,
    onStickyTopChanged?: (number) => void,
    positionStickyDisabled?: boolean,
    parent?: HTMLElement,
    zIndex?: number,
    className?: string
}

declare class Headroom extends React.Component<PropsType> {
}

export default Headroom
