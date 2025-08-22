import Pact from "@rene25/pact"
import "./style.css"

const CounterContext = Pact.createContext(0)

function Counter() {
  const [state, setState] = Pact.useState(1)
  const [name, setName] = Pact.useState("I")
  const increment = () => setState((c) => c + 1)
  const decrement = () => setState((c) => c - 1)
  const computed = Pact.useMemo(() => state * 2, [state])
  const callback = Pact.useCallback(() => console.log(state), [state])
  let ref = Pact.useRef(0)
  const inputRef = Pact.useRef(null)

  Pact.useEffect(() => console.log("effect without depends"))
  Pact.useEffect(() => console.log("effect depends on name"), [name])
  Pact.useEffect(() => {
    console.log("effect depends on state")
    return () => console.log("cleanup effect depends on state");
  }, [state]);
  function incrementRef() {
    ref.current = ref.current + 1
    alert("You clicked " + ref.current + " times!")
  }
  function focueInput() {
    inputRef.current.focus()
  }
  const changeName = () => setName((c) => c + "m")

  return (
    <>
      <CounterContext.Provider value="1 useState & useMemo & useCallback">
        <Section>
          <button onClick={decrement}>-</button>
          <p>
            Count: {state} {computed}
          </p>
          <button onClick={increment}>+</button>
        </Section>
      </CounterContext.Provider>
      <CounterContext.Provider value="2 useEffect without deps">
        <Section>
          <button onClick={callback}>log state</button>
        </Section>
      </CounterContext.Provider>
      <CounterContext.Provider value="3 useRef">
        <Section>
          <button onClick={incrementRef}>test ref</button>
          <input ref={inputRef} />
          <button onClick={focueInput}>Focus the input</button>
        </Section>
      </CounterContext.Provider>
      <CounterContext.Provider value="4 memo & uesEffect with deps">
        <Section>
          <button onClick={changeName}>name</button>
          <p style={{color: "green"}}>{name}</p>
          <Memoized name="hi"/>
        </Section>
      </CounterContext.Provider>
      <CounterContext.Provider value="5 useReducer">
        <Section>
          <ReducerDemo />
        </Section>
      </CounterContext.Provider>
    </>
  )
}

function Section(props) {
  const contextValue = Pact.useContext(CounterContext)
  return (
    <div className="section">
      <h3>Section {contextValue}</h3>
      <div>{props.children}</div>
    </div>
  )
}

function Wrapee(props) {
  console.log("wrapee rendered")
  return <p>Never rerender {props.name}</p>
}
const compare = (a, b) => {
  if (typeof a != typeof b) return false
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length == b.length && a.every((v, i) => compare(v, b[i]))
  }
  if (typeof a == 'function') return false
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  if (Object.keys(a).length != Object.keys(b).length) return false
  for (let key in a) {
    if (!(key in b)) return false
    if (!compare(a[key], b[key])) return false
  }
  return true
}
const Memoized = Pact.memo(Wrapee, compare)

const reducer = (state, action) => {
  switch (action.type) {
    case "mul": return state * action.value
    case "div": return state / action.value
    default: return state
  }
}
function ReducerDemo(props) {
  const [state, dispatch] = Pact.useReducer(reducer, 3)
  const mul = () => dispatch({type: "mul", value: 2})
  const div = () => dispatch({type: "div", value: 2})
  return (
    <>
      <button onClick={mul}>*</button>
      <p>{state}</p>
      <button onClick={div}>/</button>
    </>
  )
}

Pact.render(<Counter />, document.body)
