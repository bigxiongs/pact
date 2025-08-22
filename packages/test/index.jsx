import Pact from "@rene25/pact";

function Counter() {
    const [count, setCount] = Pact.useState(0);
    
    return <div>
        <h1>Counter: {count}</h1>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <p>Click the buttons to change the count.</p>
    </div>
}

Pact.render(<Counter />, document.body);