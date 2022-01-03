import apisauce from 'apisauce'

class DCCClient {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.api = apisauce.create({ baseURL: this.baseURL })
    this.DCCName = ''
    this.DCCVersion = ''
    this.currentProject = ''
    this.cameras = []
    this.cameraSelected = ''
    this.renderers = []
    this.rendererSelected = ''
    this.videoExtensions = []
    this.videoExtensionSelected = ''
    this.imageExtensions = []
    this.imageExtensionSelected = ''
  }

  get(url, params = {}) {
    return this.api.get(url, params).then((response) => {
      if (response.status === null) {
        return Promise.reject(
          `Response status code is null, the connection have probably been refused.`
        )
      } else if (response.status !== 200) {
        return Promise.reject(
          `Response status code is not 200, it's ${response.status}.`
        )
      } else return Promise.resolve(response.data)
    })
  }

  getInformation() {
    return this.get('/').then((data) => {
      this.DCCName = data['dcc_name']
      this.DCCVersion = data['dcc_version']
      this.currentProject = data['current_project']
      return Promise.resolve(data)
    })
  }

  getCameras() {
    return this.get('get-cameras').then((data) => {
      this.cameras = data

      if (this.cameras.length > 0) {
        this.cameraSelected = this.cameras[0]
      }
      return Promise.resolve(data)
    })
  }

  setCamera(camera) {
    return this.get('set-camera', { camera: camera }).then(() => {
      this.cameraSelected = camera
    })
  }

  setRenderer(renderer) {
    this.rendererSelected = renderer
  }

  getCurrentScene() {
    return this.get('get-current-scene')
  }

  getCurrentColorSpace() {
    return this.get('get-current-color-space')
  }

  setCurrentColorSpace(color_space) {
    return this.get('set-current-color-space', { color_space: color_space })
  }

  getRenderers() {
    return this.get('get-renderers').then((data) => {
      this.renderers = data
      if (this.renderers.length > 0) {
        this.rendererSelected =
          this.DCCName == 'Blender' ? 'BLENDER_WORKBENCH' : this.renderers[0][1]
      }
      return Promise.resolve(data)
    })
  }

  getExtensions(is_video) {
    return this.get('get-extensions', { is_video: is_video }).then((data) => {
      if (is_video) {
        this.videoExtensions = data
        if (this.videoExtensions.length > 0) {
          this.videoExtensionSelected = this.videoExtensions[0][1]
        }
      } else {
        this.imageExtensions = data
        if (this.imageExtensions.length > 0) {
          this.imageExtensionSelected = this.imageExtensions[0][1]
        }
      }
    })
  }

  takeRenderScreenshot(
    renderer,
    extension,
    outputPath = '',
    useColorspace = false
  ) {
    return this.get('take-render-screenshot', {
      renderer: renderer,
      output_path: outputPath,
      extension: extension,
      use_colorspace: useColorspace
    })
  }

  takeViewportScreenshot(extension, outputPath = '', useColorspace = false) {
    return this.get('take-viewport-screenshot', {
      output_path: outputPath,
      extension: extension,
      use_colorspace: useColorspace
    })
  }

  takeRenderAnimation(
    renderer,
    extension,
    outputPath = '',
    useColorspace = false
  ) {
    return this.get('take-render-animation', {
      renderer: renderer,
      output_path: outputPath,
      extension: extension,
      use_colorspace: useColorspace
    })
  }

  takeViewportAnimation(extension, outputPath, useColorspace = false) {
    return this.get('take-viewport-animation', {
      output_path: outputPath,
      extension: extension,
      use_colorspace: useColorspace
    })
  }
}

class DCCClientManager {
  // TODO : create iterator
  constructor() {
    this.connectedClients = []
  }

  refreshConnectedClients() {
    this.connectedClients = []
    for (let port = 10000; port < 10100; port++) {
      let newClient = new DCCClient(`http://localhost:${port}`)
      newClient
        .getInformation()
        .then(() => {
          newClient.getCameras().then()
          newClient.getRenderers().then()
          newClient.getExtensions(true).then()
          newClient.getExtensions(false).then()
          this.connectedClients.push(newClient)
        })
        .catch(() => {
          // do nothing
        })
    }
  }
}

export { DCCClient, DCCClientManager }
