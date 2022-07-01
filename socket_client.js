const net = require("net");

class SocketClient {
  constructor(task_id, unix_socket) {
    this.task_id = task_id;
    this.unix_socket = unix_socket;
  }

  async connect() {
    await this._connect(this.unix_socket);
  }

  _connect() {
    return new Promise((resolve, reject) => {
      const failed = setTimeout(() => {
        reject();
      }, 1000);
      this.client = net.createConnection(this.unix_socket, () => {
        clearTimeout(failed);
        resolve(this.client);
      });
      this.client.on('error', (e) => {
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

  destory() {
    this.client.destroy();
  }
}

module.exports = {
  SocketClient
}

