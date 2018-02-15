const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const {assert} = chai

const {Registry} = require('..')

describe('Registry', function () {
  const STACK = 'the-stack'
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

  it('reports the calls that have been started, but not completed', function () {
    const call0 = r.begin('A#method0', STACK)
    const call1 = r.begin('A#method0', STACK)
    const call2 = r.begin('A#method0', STACK)
    const call3 = r.begin('A#method1', STACK)
    const call4 = r.begin('B#method2', STACK)
    const call5 = r.begin('B#method2', STACK)
    const call6 = r.begin('C#method3', STACK)

    call2.finish()
    call6.finish()

    const lines = [
      'x2 A#method0\n',
      'x2 B#method2\n',
      'x1 A#method1\n'
    ]
    assert.equal(r.report(), lines.join(''))
  })

  it('wraps a Promise with an explicit signature', async function () {
    let f = () => {}
    const p = new Promise(resolve => { f = resolve })

    r.wrap(p, 'A#method0')

    assert.equal(r.size(), 1)
    assert.equal(r.report(), 'x1 A#method0\n')

    f()
    await p

    assert.equal(r.size(), 0)
  })

  it('wraps a Promise and infer a signature from the calling function', async function () {
    class A {
      constructor () {
        this.f = () => {}
      }

      method0 () {
        return this.method1()
      }

      method1 () {
        return r.wrap(new Promise(resolve => { this.f = resolve }))
      }

      resolveIt () {
        this.f()
      }
    }

    const a = new A()
    const p = a.method0()

    assert.equal(r.size(), 1)
    assert.match(r.report(), /^x1 A.method1 \(.*?test\/registry\.test\.js:\d+:\d+\)\n$/)

    a.resolveIt()
    await p

    assert.equal(r.size(), 0)
  })
})
