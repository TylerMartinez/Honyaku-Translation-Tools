import React from 'react'
import { createContext, useReducer, useEffect, useContext } from 'react';
import PropTypes from 'prop-types'
import updateObjectInArray from '../utils/contextUtils'
import { saveProjectAsync, updateProjectAsync, loadProject } from '../utils/projectUtils'
import { ConfigDispatchContext } from './configContext';

export const CREATE_PROJECT_REQUEST = 'CREATE_PROJECT_REQUEST'
export const CREATE_PROJECT_SUCCESS = 'CREATE_PROJECT_SUCCESS'
export const CREATE_PROJECT_FAIL = 'CREATE_PROJECT_FAIL'

export const LOAD_PROJECT_REQUEST = 'LOAD_PROJECT_REQUEST'
export const LOAD_PROJECT_SUCCESS = 'LOAD_PROJECT_SUCCESS'
export const LOAD_PROJECT_FAIL = 'LOAD_PROJECT_FAIL'

export const UPDATE_WORKSPACE_SETTINGS = 'UPDATE_WORKSPACE_SETTINGS'
export const UPDATE_TRANSLATION = 'UPDATE_TRANSLATION'
export const CREATE_TRANSLATION = 'CREATE_TRANSLATION'
export const UPDATE_PROJECT_REQUEST = 'UPDATE_PROJECT_REQUEST'
export const UPDATE_PROJECT_SUCCESS = 'UPDATE_PROJECT_SUCCESS'
export const UPDATE_PROJECT_FAIL = 'UPDATE_PROJECT_FAIL'

export const UPDATE_RECENT_PROJECTS_REQUEST = 'UPDATE_RECENT_PROJECTS_REQUEST'

export const ProjectContext = createContext(null);
export const ProjectDispatchContext = createContext(null);

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(
    projectReducer,
    null
  );

  const dispatchConfig = useContext(ConfigDispatchContext)

  useEffect(() => {
    console.log(state)
  }, [state])

  const dispatchWithSideEffects = async (action) => {
    switch (action.type) {
      case CREATE_PROJECT_REQUEST: {
        dispatch(action)

        var success = false
        // Try to create the project on disk and then dispatch the outcome
        try {
          // Save to disk
          await saveProjectAsync(action.payload)
      
          // Success! Update State
          dispatch({ type: CREATE_PROJECT_SUCCESS, payload: action.payload.content })
          success = true
        } catch (e) {
          // Failure. Share error.
          dispatch({ type: CREATE_PROJECT_FAIL, payload: e.message })
        }
      
        // If successful do post operations
        if (success) {
          // Add to recent projects
          dispatchConfig({ type: UPDATE_RECENT_PROJECTS_REQUEST, payload: action.payload})
        }

        break
      }

      case UPDATE_WORKSPACE_SETTINGS: {
        dispatch(action)

        // Update project
        dispatch({ type: UPDATE_PROJECT_REQUEST, payload: { property: 'workspace', content: action.payload }})

        break
      }

      case UPDATE_TRANSLATION: {
        dispatch(action)

        // Update project
        dispatch({ type: UPDATE_PROJECT_REQUEST, payload: { property: 'translations', index: action.payload.index, content: action.payload.translation }})

        break
      }

      case CREATE_TRANSLATION: {
        dispatch(action)

        dispatch({ type: UPDATE_PROJECT_REQUEST, payload: { property: 'createTranslation', index: action.payload.index, content: action.payload.translation }})

        break
      }

      case UPDATE_PROJECT_REQUEST: {
        dispatch(action)

        // Try to update the project on disk and then dispatch the outcome
        try {
          // Get project
          var project = state

          //UPDATE IT!!!

          // Save to disk
          await updateProjectAsync(project)

          // Success! Update State
          dispatch({ type: UPDATE_PROJECT_SUCCESS, payload: action.payload })
        } catch (e) {
          // Failure. Share error.
          dispatch({ type: UPDATE_PROJECT_FAIL, payload: e.message })
        }

        break
      }

      case LOAD_PROJECT_REQUEST: {
        dispatch(action)

        // Try to load the project from disk and then dispatch the outcome
        try {
          
          // Load from disk
          var loadedProject = loadProject(action.payload)

          // Success! Update State
          dispatch({ type: LOAD_PROJECT_SUCCESS, payload: loadedProject })

        } catch (e) {
          // Failure check if project is passed to remove from config
          if (e.project) {
            action.payload.remove = true

            dispatchConfig({ type: UPDATE_RECENT_PROJECTS_REQUEST, payload: action.payload})

            dispatch({ type: LOAD_PROJECT_FAIL, payload: e.message })
          } else {
            // Just share message
            dispatch({ type: LOAD_PROJECT_FAIL, payload: e.message })
          }
        }

        break
      }
  
      default: {
        dispatch(action)
      }
    }
  }

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatchWithSideEffects}>
        {children}
      </ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
}

// Proptypes
ProjectProvider.propTypes = {
  children: PropTypes.any,
}

function projectReducer(state, action) {
  switch (action.type) {
    case CREATE_PROJECT_REQUEST:
    case LOAD_PROJECT_REQUEST:
    case CREATE_TRANSLATION:
    case UPDATE_PROJECT_REQUEST: {
      return {
        isLoading: true,
        error: null,
        data: state.data
      }
    }

    case LOAD_PROJECT_SUCCESS:
    case CREATE_PROJECT_SUCCESS: {
      return {
        isLoading: false,
        error: null,
        data: action.payload
      }
    }

    case CREATE_PROJECT_FAIL:
    case UPDATE_PROJECT_FAIL:
    case LOAD_PROJECT_FAIL: {
      return {
        isLoading: false,
        error: action.payload,
        data: state.data
      }
    }

    case UPDATE_PROJECT_SUCCESS: {
      if(action.payload.property === "translations") {
        return{
          isLoading: false,
          error: null,
          data: {
            ...state.data,
            translations: updateObjectInArray(state.data.translations, action.payload)
          }
        }
      } else if(action.payload.property === "createTranslation") {
        var temp = {
          isLoading: false,
          error: null,
          data: {
            ...state.data,
            translations: [...state.data.translations, action.payload.content]
          }
        }

        temp.data.workspace.currentIndex = action.payload.index;

        return temp;
      } else {
        return {
          isLoading: false,
          error: null,
          data: {
            ...state.data,
            [action.payload.property]: action.payload.content
          }
        }
      }
    }

    default: {
      return state
    }
  }
}