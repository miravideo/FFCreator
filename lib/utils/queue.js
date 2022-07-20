'use strict';

class Queue {
  constructor() {
    this.queue = [];
    this.pendingPromise = false;
  }

  enqueue(promise) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  dequeue() {
    if (this.pendingPromise) return false;
    const item = this.queue.shift();
    if (!item) return false;
    try {
      this.pendingPromise = true;
      item.promise()
        .then((value) => {
          this.pendingPromise = false;
          item.resolve(value);
          this.dequeue();
        })
        .catch((err) => {
          this.pendingPromise = false;
          item.reject(err);
          this.dequeue();
        });
    } catch (err) {
      this.pendingPromise = false;
      item.reject(err);
      this.dequeue();
    }
    return true;
  }

  destroy() {
    this.pendingPromise = true;
    this.queue = null;
  }
}

module.exports = Queue;
