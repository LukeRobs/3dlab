const { generateMessage, generateUrl } = require('../../src/lib/whatsapp');

describe('generateMessage', () => {
  it('formats order items and total', () => {
    const items = [
      { quantity: 2, product_name: 'Funko Pop', unit_price: 29.90 },
      { quantity: 1, product_name: 'Miniatura', unit_price: 15.00 },
    ];
    const msg = generateMessage(items, 74.80, 'abcd1234-5678-0000-0000-000000000000');
    expect(msg).toContain('2x Funko Pop - R$ 29.90');
    expect(msg).toContain('1x Miniatura - R$ 15.00');
    expect(msg).toContain('Total: R$ 74.80');
    expect(msg).toContain('Pedido #abcd1234');
  });

  it('handles string prices from DB rows', () => {
    const items = [{ quantity: 1, product_name: 'Item', unit_price: '19.90' }];
    const msg = generateMessage(items, '19.90', 'ffffffff-0000-0000-0000-000000000000');
    expect(msg).toContain('1x Item - R$ 19.90');
    expect(msg).toContain('Total: R$ 19.90');
  });

  it('produces valid message with empty items array', () => {
    const msg = generateMessage([], 0, 'abcd1234-0000-0000-0000-000000000000');
    expect(msg).toContain('Total: R$ 0.00');
    expect(msg).toContain('Pedido #abcd1234');
  });

  it('truncates orderId to 8 characters', () => {
    const msg = generateMessage([], 0, 'xyz');
    expect(msg).toContain('Pedido #xyz');
  });
});

describe('generateUrl', () => {
  it('creates a wa.me URL with encoded message', () => {
    const url = generateUrl('5511999999999', 'Hello World');
    expect(url).toBe('https://wa.me/5511999999999?text=Hello%20World');
  });
});
