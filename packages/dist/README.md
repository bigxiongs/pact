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
Or include the built file directly in your HTML:

```html
<script src="dist/pact.js"></script>
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
Render a virtual node into the specified container.

### `Pact.useState(initialValue)`
Declare state inside a function component.

### `Pact.useEffect(effect, deps)`
Run side effects in function components.

(Add more APIs here if your implementation supports them.)

## Contributing

Issues and pull requests are welcome!

## License

MIT
