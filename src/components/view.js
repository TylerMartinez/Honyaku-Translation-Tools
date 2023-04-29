import React from 'react'
import { useContext } from 'react';
import { ProjectContext } from '../contexts/projectContext';
import Splash from './splash/splash.js'
import Workbench from './workbench/workbench.js'

const View = () => {
  const project = useContext(ProjectContext)

  // Functions

  // Render
  return (
    <div>
      {project 
        ? <Workbench />
        : <Splash />
      }
    </div>
  )
}

export default View
