# pact
Peact is a minimium implementation of react, supporting concurrent rendering and common hooks.

## Usage

```
import Pact from 'pact';

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
