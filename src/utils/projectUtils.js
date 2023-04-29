const initialState = () => {return {
    info: {
      projectName: "projectName",
      projectMedium: "projectMedium",
      projectTitle: "projectTitle",
      projectSaveLocation: "projectSaveLocation"
    },
    workspace: {
      romaji: true,
      crop: null,
      currentIndex: 0
    },
    translations:[
      getNewTranslation()
    ]
  }
}

export function getNewTranslation() {
  return {
    image: null,
    original: "",
    romaji: "",
    translation: "",
    tags:[]
  }
}

export function* saveProject(content) {
  let project = initialState()

  project.info = content

  yield updateProject(project)
}

export async function saveProjectAsync(content) {
  let project = initialState()

  project.info = content

  await updateProjectAsync(project)
}

export function* updateProject(project) {
  yield fs.writeFile(
    project.info.projectSaveLocation + '\\' + project.info.projectName + '.hon',
    JSON.stringify(project),
    (err) => {
      if (err) console.log('error', err)
    }
  )
}

export async function updateProjectAsync(project) {
  await fs.writeFile(
    project.info.projectSaveLocation + '\\' + project.info.projectName + '.hon',
    JSON.stringify(project),
    (err) => {
      if (err) console.log('error', err)
    }
  )
}

export const loadProject = (project) => {
  var filePath = project.projectSaveLocation + '\\' + project.projectName + '.hon'
  var exists = fs.existsSync(filePath)

  // Throw error if file does not exist
  if (!exists) {
    var error = {
      project: project,
      message: 'Project does not exist!'
    }
    throw error
  }

  var result = fs.readFileSync(filePath)

  return JSON.parse(result)
}
