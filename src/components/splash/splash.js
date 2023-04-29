import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { noEmptyValuesArr } from '../../utils/validationUtils'
import { Button, Input } from '../atoms'
import TranslatingTitle from './translatingTitle.js'
import { FileInput } from '../molecules'
import { Section, Viewport, Row, Column } from '../layouts'
import RecentProjects from './recentProjects.js'
import { CREATE_PROJECT_REQUEST } from '../../redux/actionTypes'

// Component
const Splash = () => {

  // State Hooks
  const [projectName, setProjectName] = useState(null)
  const [projectMedium, setProjectMedium] = useState(null)
  const [projectTitle, setProjectTitle] = useState(null)
  const [projectSaveLocation, setProjectSaveLocation] = useState(null)

  // Functions
  const getFullState = () => {
    return {
      projectName: projectName,
      projectMedium: projectMedium,
      projectTitle: projectTitle,
      projectSaveLocation: projectSaveLocation
    }
  }

  // Actions
  const createProject = () => {}

  // Variables
  var validForm = noEmptyValuesArr([projectName, projectMedium, projectTitle, projectSaveLocation])

  return (
    <Viewport>
      <Row>
        <Column>
          <TranslatingTitle value='New Project' translation='新しいプロジェクト' />
        </Column>
      </Row>
      
      <Section>
        <Row>
          <Column col={12}>
            <Input
              name='projectName'
              type='text'
              placeholder='Project Name'
              onChange={(e) => setProjectName(e.target.value)}
            />
          </Column>
        </Row>
        <Row>
          <Column col={12}>
            <Input
              name='projectMedium'
              type='text'
              placeholder='Medium'
              onChange={(e) => setProjectMedium(e.target.value)}
            />
          </Column>
        </Row>
        <Row>
          <Column col={12}>
            <Input
              name='projectTitle'
              type='text'
              placeholder='Title'
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </Column>
        </Row>
        <FileInput
          name='projectSaveLocation'
          saveToState={(v) => setProjectSaveLocation(v)}
        />
        <Row>
          <Column col={12}>
            <Button
              disabled={!validForm}
              onClick={() => createProject()}
            >
              Create Project
              </Button>
          </Column>
        </Row>
      </Section>
      <Row>
        <Column>
          <TranslatingTitle value='Recent Projects' translation='最近のプロジェクト' />
        </Column>
      </Row>
      <Section fill={true}>
        <RecentProjects />
      </Section>
    </Viewport>
  )
}

// Prop Types
Splash.propTypes = {
  createProject: PropTypes.func
}

export default Splash
