import React, { Component } from "react";
import { connect } from "react-redux";
import { inputStateUpdate, liftedStateUpdate } from "../shared/stateUtils.js";
import { createProject } from "../../redux/actions";
import "./splash.css";
import "../../css/buttons.css";
import TranslatingTitle from "./translatingTitle.js";
import FileInput from "../shared/fileInput";

class Splash extends Component {
  //Constructor
  constructor(props) {
    super(props);

    // State
    this.state = {
      projectName: null,
      projectMedium: null,
      projectTitle: null,
      projectSaveLocation: null
    };
  }

  // Functions
  createNewProject(){
    this.props.createProject(this.state);
  }

  // Render
  render() {
    return (
      <div className="container full-height">
        <div className="row section-title">
          <TranslatingTitle value="New Project" translation="新しいプロジェクト" />
        </div>
        <div className="section">
          <div className="row">
            <div className="col-12">
              <input
                name="projectName"
                type="text"
                placeholder="Project Name"
                onChange={(e) => inputStateUpdate(e, this)} />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <input 
                name="projectMedium"
                type="text" 
                placeholder="Medium" 
                onChange={(e) => inputStateUpdate(e, this)} />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <input 
                name="projectTitle"
                type="text" 
                placeholder="Title" 
                onChange={(e) => inputStateUpdate(e, this)} />
            </div>
          </div>
          <FileInput 
            name="projectSaveLocation"
            saveToState={(n, v) => liftedStateUpdate(n, v, this)}/>
          <div className="row">
            <div className="col-12">
              <button 
                onClick={() => this.createNewProject()}
                className="action-button">
                  Create Project
                </button>
            </div>
          </div>
        </div>
        <div className="row section-title">
          <TranslatingTitle value="Recent Projects" translation="最近のプロジェクト" />
        </div>
        <div className="section remaining-section">
          <div className="row section-content">
            No recent projects . . .
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { createProject }
)(Splash);