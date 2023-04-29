import React from 'react'
import styled from 'styled-components'
import './css/bootstrap-grid.min.css'
import './css/animations.css'
import './css/fonts.css'
import './css/global.css'
import { ThemeProvider } from 'styled-components'
import { ConfigProvider } from './contexts/configContext';
import { ProjectProvider } from './contexts/projectContext';
import View from './components/view'
import Base from './components/themes/base.js'
import Minimize from './images/window-minimize-regular'
import Maximize from './images/window-maximize-regular'
import Close from './images/window-close-regular'

// Style
const AppStyle = styled.div`
  height: 100%;
  background-color: ${props => props.theme.bg1};
  
  .title-bar {
    background-color: ${props => props.theme.titlebar};
    height: 22px;
    user-select: none;
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }

  .title-actions {
    position: absolute;
    right: 0;
    top: 0;
    -webkit-app-region: no-drag;
  }

  .title-button {
    height: 22px;
    width: 22px;
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
  }

  .title-button svg path{
    fill: ${props => props.theme.titlebutton} !important;
  }

  .title-button:hover svg path {
    fill: ${props => props.theme.titlebutton_hover} !important;
  }

  .honyaku {
    color: ${props => props.theme.logo};
    font-size: 13px;
    font-family: "Montserrat Black";
    padding-top: 3px;
    padding-left: 4px;
  }
`

const App = () => {
  // Functions
  const onMaximize = async () => {
    if (!await appWindow.isMaximized()) { appWindow.maximize() } else { appWindow.unmaximize() }
  }

  // Render
  return (
    <ThemeProvider theme={Base}>
      <ConfigProvider>
        <ProjectProvider>
          <AppStyle>
            <div className='title-bar'>
              <div className='honyaku'>
                Honyaku
                </div>
              <div className='title-actions'>
                <button className='title-button' onClick={() => { appWindow.minimize() }}>
                  <div dangerouslySetInnerHTML={{__html: Minimize}}></div>
                </button>
                <button className='title-button' onClick={() => { onMaximize() }}>
                  <div dangerouslySetInnerHTML={{__html: Maximize}}></div>
                </button>
                <button className='title-button' onClick={() => { appWindow.close() }}>
                  <div dangerouslySetInnerHTML={{__html: Close}}></div>
                </button>
              </div>
            </div>
            <View/>
          </AppStyle>
        </ProjectProvider>
      </ConfigProvider>
    </ThemeProvider>
  )
}

export default App
