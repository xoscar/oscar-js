import QSC, { QSCObject } from '../qsc';

describe('QSC', () => {
  let qsc: QSCObject | undefined = undefined;

  beforeEach(async () => {
    qsc = await QSC({ host: '', port: 0 });
  });

  it('should send a message to the QSC', done => {
    const messageId = qsc?.call({
      method: 'Component.Get',
      params: {
        Name: 'MS-RX-1',
        Controls: [{ Name: 'url' }],
      },
    });

    qsc?.emitter.on('message', message => {
      expect(message.id).toBe(messageId);
      expect(message.result).toBeDefined();

      done();
    });
  });
});
