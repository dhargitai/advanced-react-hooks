// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import React, {useCallback} from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useSafeDispatch(unsafeDispatch) {
  const isMounted = React.useRef()

  // to ensure it is called as soon as the component is mounted, before the browser painted anything onto the screen
  React.useLayoutEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return React.useCallback(
    (...args) => {
      if (isMounted.current) {
        unsafeDispatch(...args)
      }
    },
    [unsafeDispatch],
  )
}

function useAsync(initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    ...(typeof initialState === 'function' ? initialState() : initialState),
    data: null,
    error: null,
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  return {
    ...state,
    run: useCallback(
      asyncCallback => {
        dispatch({type: 'pending'})

        asyncCallback.then(
          data => {
            dispatch({type: 'resolved', data})
          },
          error => {
            dispatch({type: 'rejected', error})
          },
        )
      },
      [dispatch],
    ),
  }
}

function PokemonInfo({pokemonName}) {
  const {data: pokemon, status, error, run} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  })

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }

    return run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [removed, setRemoved] = React.useState(false)

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <button onClick={() => setRemoved(!removed)}>
        "navigate" to {removed ? 'fetchpage' : 'elsewhere'}
      </button>
      <hr />
      {!removed && (
        <div className="pokemon-info">
          <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
            <PokemonInfo pokemonName={pokemonName} />
          </PokemonErrorBoundary>
        </div>
      )}
    </div>
  )
}

export default App
