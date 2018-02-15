// Identify asynchronous methods that have been started, but not completed.

class Registry {
  constructor () {
    this.pending = new Set()
  }

  begin (signature, stack) {
    const call = {
      signature,
      stack,
      finish: () => this.pending.delete(call)
    }
    this.pending.add(call)
    return call
  }

  size () {
    return this.pending.size
  }

  report () {
    const unpairedCalls = new Map()
    for (const {signature} of this.pending) {
      const currentCount = unpairedCalls.get(signature) || 0
      unpairedCalls.set(signature, currentCount + 1)
    }

    const descFreq = Array.from(unpairedCalls)
    descFreq.sort((a, b) => b[1] - a[1])
    return descFreq.map(([signature, count]) => `x${count} ${signature}\n`).join('')
  }
}

module.exports = {
  Registry
}
