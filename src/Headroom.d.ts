import React, { ReactNode } from 'react'

declare type PropsType = {
    children: ReactNode,
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
