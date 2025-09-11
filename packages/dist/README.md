# Pact

Pact is a minimal React-like library that supports concurrent rendering and common hooks.  
It is designed for learning, experimentation, and lightweight front-end projects.

## Features

- Function components
- Common hooks: `useState`, `useEffect`, etc.
- Concurrent rendering
- Virtual DOM diffing
- Tiny and easy to understand

## Installation

```bash
npm install @rene25/pact
```

## Usage

```js
import Pact from '@rene25/pact';

function Counter() {
  const [count, setCount] = Pact.useState(0);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </>
  );
}

Pact.render(<Counter />, document.body);
```

## Using JSX

To use JSX syntax with Pact, you need to configure Babel with the following preset options:

```json
{
  "presets": [
    [
      "@babel/preset-react",
      {
        "pragma": "Pact.createElement",
        "pragmaFrag": "Pact.Fragment"
      }
    ]
  ]
}
```

## API

### `Pact.render(element, container)`

Render a virtual node into the specified container. If the container already has content, it will be cleared before rendering. When the virtual node is updated, the DOM will be efficiently updated through a diffing algorithm.

### `Pact.useState(initialValue)`

Declare state inside a function component. Returns an array [state, setState] containing the current state value and a function to update the state. Calling setState will trigger a re-render of the component. initialValue can be a value or a function that returns a value (for lazy initialization).

### `Pact.useEffect(effect, deps)`

Run side effects in function components. effect is a function containing side effect logic, which can return a cleanup function (used to clear side effects before component unmounting or dependency changes). deps is a dependency array - the effect will only re-run when values in the array change. If deps is an empty array, the effect runs only once when the component mounts and once when it unmounts.

### `Pact.useCallback(callback, deps)`

Memoize a callback function. Returns the previously cached function instance when dependencies in deps haven't changed, preventing unnecessary re-renders of child components caused by function reference changes. Useful for optimizing performance when passing callback functions to child components.

### `Pact.useMemo(computed, deps)`

Memoize a computed value. computed is a function that returns a computed value. When dependencies in deps haven't changed, it directly returns the previously cached result, avoiding repeated execution of expensive calculations and improving component performance.

### `Pact.useReducer(reducer, initialState)`

Manage complex state logic with a reducer function. Returns an array [state, dispatch] containing the current state and a dispatch function. reducer is a function that receives state and action and returns a new state. dispatch is used to send action to update the state. Suitable for managing multiple related states or complex state update logic.

### `Pact.useRef(ref)`

Create a mutable ref object that persists for the lifetime of the component. The returned ref object has a current property that can store any value. Commonly used for accessing DOM elements, storing variables that don't need to trigger re-renders, and other scenarios.

### `Pact.createContext(defaultValue)`

Create a context object for sharing data across the component tree. defaultValue is the default value used when a component doesn't have a matching Provider. Typically used with Provider and useContext to enable data passing across component levels.

### `Pact.useContext(ctx)`

Consume a context value from the nearest matching Provider. Accepts a context object created by createContext as a parameter and returns the current value of that context. This hook provides convenient access to context data in function components without prop drilling.

### `Pact.memo(component, compare)`

Memoize a component to prevent unnecessary re-renders. By default, returns a cached component instance when the component's props are shallowly equal. compare is an optional comparison function that takes previous and current props and returns a boolean indicating whether props are equal - if true, re-render is prevented.

### `<Pact.Fragment></Pact.Fragment>`

A lightweight component for grouping elements without adding extra nodes to the DOM. Useful when needing to return multiple elements (such as in list rendering) without wrapping them in an additional parent element, simplifying the DOM structure. Can be shorthanded as <></>.

## Contributing

Issues and pull requests are welcome!

## License

MIT
