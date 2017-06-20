'use strict'

const { Application } = require('spectron')
const assert = require('assert')
const path = require('path')

const electronPath = './node_modules/.bin/electron'
const appPath = path.join(__dirname, '..', 'main.js')

describe('application launch', function () {
  this.timeout(10000)

  beforeEach(() => {
    this.app = new Application({
      path: electronPath,
      args: [appPath]
    })
    return this.app.start()
  })

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', () => {
    return this.app.client.getWindowCount().then(count => {
      assert.equal(count, 1)
    })
  })
})
