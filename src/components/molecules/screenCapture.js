import React, { useRef, useState } from 'react'
import styled from 'styled-components'
//import PropTypes from 'prop-types'
import { Button } from '../atoms'
import { takeScreenshot } from '../../utils/capturingUtils'
import { useSelector, useDispatch } from 'react-redux'
import {UPDATE_WORKSPACE_SETTINGS, UPDATE_TRANSLATION} from '../../redux/actionTypes'

const ScreenCaptureStyle = styled.div`
  height: 45%;
  overflow: hidden;

  .view {
    background: black;
    margin-top: 15px;
    position: relative;
    height: calc(100% - 30px);
  }

  .viewInner {
    height: 100%;
    width: 100%;
    text-align: center;
  }
  
  .setBoundsButton {
    position: absolute;
    top: 5px;
    left: 5px;
  }
  .captureButton {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  .image{
    vertical-align: middle;
    max-height: 100%;
    max-width: 100%;
  }

  .imageHelper{
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
`

const ScreenCapture = () => {
  // Ref Hooks
  var boundsWindow = useRef(null)

  // State Hooks
  var [boundsWindowOpen, setBoundsWindowOpen]  = useState(false)

  // Selectors
  const workbenchSettings = useSelector(state => state.project.data.workspace)
  const translation = useSelector(state => state.project.data.translations[workbenchSettings.currentIndex])

  // Actions
  const dispatch = useDispatch()
  const updateSettings = () => {
    dispatch({ type: UPDATE_WORKSPACE_SETTINGS, payload: workbenchSettings})
  }
  const updateTranslation = () => {
    dispatch({ type: UPDATE_TRANSLATION, payload: translation})
  }


  // Functions
  const setImage = img => {
    translation.image = img
    updateTranslation(translation)
  }

  const toggleBoundsWindow = async () => {
    if(boundsWindow.current){
      // Get window
      let window = await boundsWindow.current.webContents.executeJavaScript('window')
      
      // Get Crop
      workbenchSettings.crop = {
        height: window.innerHeight - 27,
        width: window.innerWidth - 4,
        distanceX: window.screenLeft ,
        distanceY: window.screenTop - 1,
        x_bound: boundsWindow.current.getBounds().x,
        y_bound: boundsWindow.current.getBounds().y,
      }

      updateSettings()

      await takeScreenshot(workbenchSettings.crop, setImage, true)

      boundsWindow.current.close()
      boundsWindow.current = null
      setBoundsWindowOpen(false)
    } else {
      // Create window
      boundsWindow.current = new remote.BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        minWidth: 100,
        minHeight: 100,
        transparent: true
      })

      // and load the index.html of the app.
      boundsWindow.current.loadFile('./captureIndex.html')

      // Emitted when the window is closed.
      boundsWindow.current.on('closed', () => {
        boundsWindow.current = null
      })

      setBoundsWindowOpen(true)
    }
  }

  const capture = async () => {
    await takeScreenshot(workbenchSettings.crop, setImage)
  }

  // Render
  return (
    <ScreenCaptureStyle className="flex-grow-1">
      <div className="view">
        {translation && translation.image &&
          <div className="viewInner"><span className="imageHelper"></span><img className="image" src={translation.image}></img></div>
        }
        <Button className="setBoundsButton" onClick={() => toggleBoundsWindow()}>
          {boundsWindowOpen ? "Capture Bounds" : "Set Bounds"}
        </Button>
        {workbenchSettings.crop &&
          <Button className="captureButton" onClick={() => capture()}>
            Capture
          </Button>
        }
      </div>
    </ScreenCaptureStyle>
  )
}

// Proptypes
ScreenCapture.propTypes = {
}

export default ScreenCapture
