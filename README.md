# ReactStickyHeadroom

[![npm badge](https://img.shields.io/npm/v/@integreat-app/react-sticky-headroom.svg)](https://www.npmjs.com/package/@integreat-app/react-sticky-headroom)

ReactStickyHeadroom is a React component, that hides your header when you scroll down and shows it
once you're scrolling up again.
It's designed for best performance and can only be used if you know the height of your header
component (or more precisely the amount of pixels you want ReactStickyHeadroom to hide).
This helps us avoid calculating the height ourselves and therefore browsers don't need to perform
heavy Recalculate-Style-Phases.
For more information read [here](https://developers.google.com/web/fundamentals/performance/rendering/).

Since it's using [emotion](https://emotion.sh) internally, it's best to
use it in apps where you already have emotion in place.

The component is inspired by [react-headroom](https://kyleamathews.github.io/react-headroom/).

## Usage

A basic usage example:

```jsx
render () {
  return <StickyHeadroom scrollHeight={100}>
    <div style={{height: '100px', backgroundColor: 'red'}}>MyHeader</div>
  </StickyHeadroom>
}
```

## Demo

Go to [https://digitalfabrik.github.io/react-sticky-headroom/](https://digitalfabrik.github.io/react-sticky-headroom/) to view a demo:

[![Demo](https://raw.githubusercontent.com/digitalfabrik/react-sticky-headroom/main/demo.gif)](https://digitalfabrik.github.io/react-sticky-headroom/)

## API

You can pass the following props to ReactStickyHeadroom:

- `children: React.Node` The header component, that should be hidden and revealed
- `scrollHeight: number` The maximum amount of px the header should move up when scrolling
- `pinStart: number` (Default: `0`) The minimum scrollTop position where the transform should start
- `height?: number` (Optional) The height of the `children` node. Used for calculating the stickyTop position for a sticky ancestor in `onStickyTopChanged`
- `onStickyTopChanged?: (number) => void` Fired, when Headroom changes its state and `height` is provided. Passes the calculated stickyTop position of an ancestor node.
- `positionStickyDisabled?: boolean` (Optional, Default: `false`) If true, the header will stay static (e.g. for edge 16 support)
- `parent: ?HTMLElement` (Optional, Default: `document.documentElement`) The parent element firing the scroll event.
- `zIndex: number` (Optional, Default: 1) The z-index used by the wrapper.
- `className?: string` (Optional) A classname for applying custom styles to the wrapper. Use at your own risk.

## Support

The component generally supports:

- Internet Explorer 11
- Edge >= 16
- Chrome >= 41
- Firefox >= 40
- Safari >= 6.2

However, if you want to support non-modern browsers, you are responsible for transpiling the code for your preferred target.
The distributed files on npm are transpiled for ES2020.

For hiding and revealing the header, the browser needs to support the css-property `position: sticky`.
You can read about the browser support for that on [caniuse.com](https://caniuse.com/#feat=css-sticky).
'Partial-Support' is enough for ReactStickyHeadroom to work in most cases.

Since version 2.x.x, ReactStickyHeadroom is written in TypeScript.
Support for FlowJS types were dropped in version 2.0.0.

ReactStickyHeadroom is a client-side library and hence does not support Server Side Rendering (SSR) a priori.
For NextJS you can find more information on how to embed this library [here](https://nextjs.org/docs/advanced-features/dynamic-import#with-no-ssr).

If there are any problems, please don't hesitate to open an issue on GitHub.
