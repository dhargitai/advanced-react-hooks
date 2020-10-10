// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import React from 'react'

/* function countReducer(previousState, newStatePartial) {
  return {
    ...previousState,
    ...(typeof newStatePartial === 'function'
      ? newStatePartial(previousState)
      : newStatePartial),
  }
} */
function countReducer(previousState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {...previousState, count: previousState.count + action.step}
    default:
      throw new Error(`Unsupported action type: "${action.type}"`)
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, {
    // const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  })
  const {count} = state
  const increment = () => dispatch({type: 'INCREMENT', step})
  // const increment = () => setState({count: count + step})
  // const incrementWithFunction = () =>
  //   setState(currentState => ({count: currentState.count + step}))

  return (
    <>
      <button onClick={increment}>{count}</button>
      {/* <button onClick={incrementWithFunction}>{count} w/ function</button> */}
    </>
  )
}

function App() {
  return <Counter />
}

export default App
