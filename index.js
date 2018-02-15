// Identify asynchronous methods that have been started, but not completed.

class Call {
  constructor (signature, stack, onFinish) {
    this.signature = signature
    this.stack = stack
    this.finish = onFinish
  }
}

class Registry {
  constructor () {
    this.pending = new Set()
  }

  begin (signature, stack) {
    const call = new Call(signature, stack, () => this.pending.delete(call))
    this.pending.add(call)
    return call
  }

  size () {
    return this.pending.size
  }
}

module.exports = {
  Registry
}
