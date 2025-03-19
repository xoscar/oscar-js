import { EventEmitter } from 'events';
import net, { SocketConnectOpts } from 'net';

export interface CallParams<T = any> {
  method: string;
  params: T;
}

export interface QSCObject {
  call<T = any>(params: CallParams<T>): number;
  emitter: EventEmitter;
}

export interface QSC {
  (options: SocketConnectOpts): Promise<QSCObject>;
}

const JSON_RPC_VERSION = '2.0';
const BOUNDARY = '\0';

const QSC: QSC = async options => {
  const connect = async (options: SocketConnectOpts): Promise<net.Socket> =>
    new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.connect(options);

      client.on('connect', () => resolve(client));
      client.on('error', reject);
    });

  let messageIndex = 0;
  let buffer = '';
  const emitter = new EventEmitter();

  try {
    const client = await connect(options);

    client.on('data', function listener(data: Buffer) {
      buffer += data.toString();

      let boundary = buffer.indexOf(BOUNDARY);
      while (boundary !== -1) {
        const jsonStr = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 1);

        try {
          emitter.emit('message', JSON.parse(jsonStr));
        } catch (err) {
          console.error('Received invalid JSON from QSC:', jsonStr);
        }

        boundary = buffer.indexOf(BOUNDARY);
      }
    });

    client.on('error', err => emitter.emit('error', err));

    const qsc: QSCObject = {
      emitter,
      call({ method, params }) {
        const messageId = messageIndex++;

        const json = JSON.stringify({
          jsonrpc: JSON_RPC_VERSION,
          method,
          params,
          id: messageId,
        });

        client.write(json + BOUNDARY);

        return messageId;
      },
    };

    return qsc;
  } catch (error) {
    throw error;
  }
};

export default QSC;
