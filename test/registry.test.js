const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const {assert} = chai

const {Registry} = require('..')

describe('Registry', function () {
  const STACK = Symbol('stack')
  let r

  beforeEach(function () {
    r = new Registry()
  })

  it('stores a call that is beginning', function () {
    assert.equal(r.size(), 0)
    r.begin('GithubPackage#setActiveContext', STACK)
    assert.equal(r.size(), 1)
  })

  it('removes a call that has completed', function () {
    const call = r.begin('GithubPackage#setActiveContext', STACK)
    assert.equal(r.size(), 1)
    call.finish()
    assert.equal(r.size(), 0)
  })

  it('stores duplicate calls individually', function () {
    const call0 = r.begin('GithubPackage#setActiveContext', STACK)
    const call1 = r.begin('GithubPackage#setActiveContext', STACK)
    assert.equal(r.size(), 2)
    call1.finish()
    assert.equal(r.size(), 1)
    call0.finish()
    assert.equal(r.size(), 0)
  })

  it('reports the calls that have been started, but not completed')
})
