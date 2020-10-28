// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import React, {useContext} from 'react'

// 🐨 create your CountContext here with React.createContext
const CountContext = React.createContext()

function CountProvider({children}) {
  const [count, setCount] = React.useState(0)
  return (
    <CountContext.Provider value={[count, setCount]}>
      {children}
    </CountContext.Provider>
  )
}

function useCount() {
  try {
    const [count, setCount] = useContext(CountContext)
    return [count, setCount]
  } catch (error) {
    throw new Error('useCount hook must be used inside a CountProvider')
  }
}

function CountDisplay() {
  const [count] = useCount()
  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [_, setCount] = useCount()
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountDisplay />
      <Counter />
    </div>
  )
}

export default App
