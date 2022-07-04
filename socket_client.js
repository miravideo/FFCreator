const net = require("net");

class SocketClient {
  constructor(task_id, port, host) {
    this.task_id = task_id;
    this.port = port;
    this.host = host;
  }

  async connect() {
    await this._connect();
  }

  _connect() {
    return new Promise((resolve, reject) => {
      const failed = setTimeout(() => {
        this.client = null;
        reject();
      }, 1000);
      this.client = net.createConnection(this.port, this.host, () => {
        clearTimeout(failed);
        resolve(this.client);
      });
      this.client.on('error', (e) => {
        this.client = null;
        reject(e);
      });
    });
  }

  sendMessage(obj) {
    obj = {
      task_id: this.task_id,
      ...obj,
    };
    const message = JSON.stringify(obj);
    if (this.client && !this.client.connecting && this.client.writable) {
      this.client.write(SocketClient.messageBuffer(message));
    } else {
      // console.log(`sendObject("${message}") ignore. socket not connected`);
    }
  }

  static messageBuffer(message) {
    const messageBuffer = Buffer.from(message, 'utf-8')
    let lengthBuffer = new Buffer(8);
    lengthBuffer.writeBigUInt64BE(BigInt(messageBuffer.length));
    return Buffer.concat([lengthBuffer, messageBuffer]);
  }

  destroy() {
    if (this.client && !this.client.connecting) {
      this.client.destroy();
      this.client = null;
    }
  }
}

module.exports = {
  SocketClient
}

