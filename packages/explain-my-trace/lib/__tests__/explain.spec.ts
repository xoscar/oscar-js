import explain from '../explain';
import jaeger from './jaeger.json';
import tempo from './tempo.json';

const SECONDS = 1000;
jest.setTimeout(20 * SECONDS);

describe('explain', () => {
  it('should return a response using a trace exported from jaeger', async () => {
    const result = await explain({
      raw: JSON.stringify(jaeger),
      type: 'jaeger',
    });

    expect(result).toContain(
      "Hello there! I'm a professional OpenTelemetry engineer and I'm here to help you with your trace analysis."
    );
    expect(result).toContain('pokeshop');
    expect(result).toContain('pokeshop-worker');
    expect(result).toBeDefined();
  });

  it('should return a response using a trace exported from tempo', async () => {
    const result = await explain({
      raw: JSON.stringify(tempo),
      type: 'tempo',
    });

    expect(result).toBeDefined();
    expect(result).toContain(
      "Hello there! I'm a professional OpenTelemetry engineer and I'm here to help you with your trace analysis."
    );
    expect(result).toContain('pokeshop');
    expect(result).toContain('pokeshop-worker');
    expect(result).toContain('FetchError');
  });

  it('should return a response using a trace exported from jaeger', async () => {
    await expect(
      explain({
        raw: JSON.stringify(tempo),
        type: 'tempo',
        docsLimit: 5,
      })
    ).rejects.toThrow('The number of documents exceeds the defined limit of 5');
  });
});
