import { objectsHaveSameKeys } from './validationUtils'

const initialState = {
  recentProjects: []
}

export const loadConfig = async () => {
  console.log("getting config")
  const configPath = await remote.appDataPath() + '\\honyaku\\config.json'

  const fileExists = await fs.existsSync(configPath)

  // Check if config exists and if not create it
  if (!fileExists) {
    await fs.writeFileSync(configPath, JSON.stringify(initialState))
  }

  try {
    // Read in config file
    var config = JSON.parse(fs.readFileSync(configPath))

    console.log(config)

    // Check to see if config is in proper state otherwise default to intial
    if (!objectsHaveSameKeys(config, initialState)) {
      config = initialState
    }

    return config
  } catch (e) {
    return initialState
  }
}

export async function* updateConfig(config, value, property) {
  const configPath = await remote.appDataPath() + '\\honyaku\\config.json'

  yield await fs.writeFile(
    configPath,
    JSON.stringify({ ...config, [property]: value }),
    (err) => {
      if (err) {
        console.log('error', err)
      }
    }
  )
}
