# StickyHeadroom
[![npm badge](https://img.shields.io/npm/v/@integreat-app/react-sticky-headroom.svg)](https://www.npmjs.com/package/@integreat-app/sticky-headroom)

ReactStickyHeadroom is a React component, that hides your header when you scroll down and shows it
once you're scrolling up again.
It's designed for best performance and can only be used if you know the height of your header
component (or more precisely the amount of pixels you want StickyHeadroom to hide).
This helps us avoid calculating the height ourselves and therefore browsers don't need to perform
heavy Recalculate-Style-Phases.
For more information read [here](https://developers.google.com/web/fundamentals/performance/rendering/).

Since it's using [styled-components](https://www.styled-components.com/) internally, it's best to 
use it in apps where you already have styled-components in place.
The component is only compatible with styled-components v4.x.x.

The component is inspired by [react-headroom](https://kyleamathews.github.io/react-headroom/).

## Usage
A basic usage example:
```jsx
render () {
  return <StickyHeadroom scrollHeight={100} />
    <div style={{height: '100px', backgroundColor: 'red'}}>MyHeader</div>
  </StickyHeadroom>
}
```

## API
You can pass the following props to StickyHeadroom:
* `children: React.Node` The header component, that should be hidden and revealed
* `scrollHeight: number` The maximum amount of px the header should move up when scrolling
* `pinStart: number` The minimum scrollTop position where the transform should start
* `height?: number` (Optional) The height of the `children` node. Used for calculating the stickyTop position for a sticky ancestor in `onStickyTopChanged`
* `onStickyTopChanged?: (number) => void` Fired, when Headroom changes its state and `height` is provided. Passes the calculated stickyTop position of an ancestor node.
* `positionStickyDisabled?: boolean` (Optional, Default: `false`) If true, the header will stay static (e.g. for edge 16 support)

Edge 16 has had issues with css property `position: sticky` together with `direction: rtl`.
This has been fixed in Edge 17.
If you need Edge 16 as well as right-to-left support, you should use `positionStickyDisabled: true`, when detecting Edge 16.

## Support
The component generally supports:
* Internet Explorer 11
* Edge >= 16
* Chrome >= 41
* Firefox >= 40
* Safari >= 6.2

For hiding and revealing the header, the browser needs to support `position: sticky` support.
You can read about the browser support for that on [caniuse.com](https://caniuse.com/#feat=css-sticky).
'Partial-Support' is enough for StickyHeadroom to work in most cases.

If there are any problems, please don't hesitate to open an issue on GitHub.
