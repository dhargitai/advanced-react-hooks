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

function useAsync(initialState) {
  const [state, dispatch] = React.useReducer(asyncReducer, {
    ...(typeof initialState === 'function' ? initialState() : initialState),
    data: null,
    error: null,
  })
  const isUnmounted = React.useRef()

  React.useEffect(() => {
    isUnmounted.current = false

    return () => {
      isUnmounted.current = true
    }
  }, [])

  return {
    ...state,
    run: useCallback(asyncCallback => {
      dispatch({type: 'pending'})

      asyncCallback.then(
        data => {
          if (!isUnmounted.current) {
            dispatch({type: 'resolved', data})
          }
        },
        error => {
          if (!isUnmounted.current) {
            dispatch({type: 'rejected', error})
          }
        },
      )
    }, []),
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
