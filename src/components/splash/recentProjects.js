import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button } from '../atoms'
import { Row, Column } from '../layouts'

// Style
const RecentProjectsStyle = styled.div`
  height: 100%;

  .project-title {
    font-size: 17px;
  }

  .project-info {
      color: ${props => props.theme.muted1};
  }

  .project-save-location {
      font-style: italic;
      color: ${props => props.theme.muted1};
  }

  .project-item {
      border-radius: 4px;
      padding:5px;
  }

  .project-item:hover {
      background-color: ${props => props.theme.highlight1};
      cursor: pointer;
  }
`

// Component
const RecentProjects = () => {

  // Selectors
  const recentProjects = null

  // Actions
  const loadProject = project => {}

  // Functions
  const getListRender = () => {
    if (recentProjects && recentProjects.length) {
      return recentProjects.map((project, i) =>
        <div key={i} className=' project-item' onClick={() => loadProject(project)}>
          <div className='project-title'>{project.projectName}</div>
          <div className='project-info'>
            Medium: {project.projectMedium}
          </div>
          <div className='project-info'>
            Title: {project.projectTitle}
          </div>
          <div className='project-save-location'>{project.projectSaveLocation}</div>
        </div>
      ).reverse()
    } else {
      return 'No recent projects!'
    }
  }

  // Render
  return (
    <RecentProjectsStyle className="d-flex flex-column">
      <Row fill={true}>
        <Column col={12}>
          {getListRender()}
        </Column>
      </Row>
      <Row>
        <Column col={12} justify="end">
          <Button onClick={() => { }}>
            Load Project
          </Button>
        </Column>
      </Row>
    </RecentProjectsStyle>
  )
}

// Prop Types
RecentProjects.propTypes = {
  loadProject: PropTypes.func
}

export default RecentProjects
