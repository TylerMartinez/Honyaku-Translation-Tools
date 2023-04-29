import React from 'react'
import { createContext, useReducer, useEffect } from 'react';
import { updateConfig, loadConfig } from '../utils/configUtils'
import PropTypes from 'prop-types'

export const ConfigContext = createContext(null);
export const ConfigDispatchContext = createContext(null);

export const UPDATE_RECENT_PROJECTS_REQUEST = 'UPDATE_RECENT_PROJECTS_REQUEST'
export const UPDATE_CONFIG_REQUEST = 'UPDATE_CONFIG_REQUEST'
const UPDATE_CONFIG_SUCCESS = 'UPDATE_CONFIG_SUCCESS'
const UPDATE_CONFIG_FAIL = 'UPDATE_CONFIG_FAIL'

const initialState = {
  isLoading: null,
  error: null,
  data: loadConfig()
}


export function ConfigProvider({ children }) {
  const [state, dispatch] = useReducer(
    configReducer,
    initialState
  );

  useEffect(() => {
    console.log(state)
  }, [state])

  const dispatchWithSideEffects = async (action) => {
    switch (action.type) {
      case UPDATE_RECENT_PROJECTS_REQUEST: {
        dispatch(action)

        // Get recentProject copy from state
        var recentProjects = []
  
        state.config.data.recentProjects.forEach(x => {
          recentProjects.push({ ...x })
        })

        // Update recent Projects removing the new content to be added to front or removed
        recentProjects = recentProjects.filter(x => x.projectSaveLocation !== action.payload.projectSaveLocation ||
                                                    x.projectName !== action.payload.projectName)

        // If remove is defined lets not push
        if (!action.payload.remove) { recentProjects.push(action.payload) }

        // Update config
        dispatchWithSideEffects({ type: UPDATE_CONFIG_REQUEST, payload: { property: 'recentProjects', content: recentProjects }})

        break
      }
  
      case UPDATE_CONFIG_REQUEST: {
        dispatch(action)

        // Try to write the project to disk and then dispatch the outcome
        try {
          // Get config
          var config = state.config.data;

          // Save to disk
          await updateConfig(config, action.payload.content, action.payload.property)

          // Success! Update State
          dispatch({ type: UPDATE_CONFIG_SUCCESS, payload: action.payload })
        } catch (e) {
          // Failure. Share error.
          dispatch({ type: UPDATE_CONFIG_FAIL, payload: e })
        }

        break
      }
  
      default: {
        dispatch(action)
      }
    }
  }

  return (
    <ConfigContext.Provider value={state}>
      <ConfigDispatchContext.Provider value={dispatchWithSideEffects}>
        {children}
      </ConfigDispatchContext.Provider>
    </ConfigContext.Provider>
  );
}

// Proptypes
ConfigProvider.propTypes = {
  children: PropTypes.any,
}

function configReducer(state, action) {
  switch (action.type) {
    case UPDATE_CONFIG_REQUEST: {
      return {
        isLoading: true,
        error: null,
        data: state.data
      }
    }

    case UPDATE_CONFIG_SUCCESS: {
      return {
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          [action.payload.property]: action.payload.content
        }
      }
    }

    case UPDATE_CONFIG_FAIL: {
      return {
        isLoading: false,
        error: action.payload.error,
        data: state.data
      }
    }

    default: {
      return state
    }
  }
}