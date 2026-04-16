function generateMessage(orderItems, totalPrice, orderId) {
  const lines = orderItems
    .map(item => `- ${item.quantity}x ${item.product_name} - R$ ${parseFloat(item.unit_price).toFixed(2)}`)
    .join('\n');
  const shortId = orderId.substring(0, 8);
  return `Ola! Gostaria de fazer um pedido:\n\n${lines}\n\nTotal: R$ ${parseFloat(totalPrice).toFixed(2)}\nPedido #${shortId}`;
}

function generateUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { generateMessage, generateUrl };
