function generateMessage(orderItems, totalPrice, orderId, paymentMethod = 'full') {
  const lines = orderItems
    .map(item => {
      const variantStr = item.selected_variants && Object.keys(item.selected_variants).length > 0
        ? ' [' + Object.entries(item.selected_variants).map(([k, v]) => `${k}: ${v}`).join(', ') + ']'
        : '';
      return `- ${item.quantity}x ${item.product_name}${variantStr} - R$ ${parseFloat(item.unit_price).toFixed(2)}`;
    })
    .join('\n');
  const shortId = String(orderId).substring(0, 8);

  const isPix = paymentMethod === 'pix';
  const discount = isPix ? totalPrice * 0.1 : 0;
  const finalTotal = totalPrice - discount;

  const paymentLine = isPix
    ? `Pagamento: PIX (10% de desconto aplicado)\nDesconto: -R$ ${discount.toFixed(2)}\nTotal com desconto: R$ ${finalTotal.toFixed(2)}`
    : `Pagamento: Cartão / Dinheiro\nTotal: R$ ${finalTotal.toFixed(2)}`;

  return `Ola! Gostaria de fazer um pedido:\n\n${lines}\n\nSubtotal: R$ ${parseFloat(totalPrice).toFixed(2)}\n${paymentLine}\nPedido #${shortId}`;
}

function generateUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { generateMessage, generateUrl };
