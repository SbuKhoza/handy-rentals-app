const startPayment = async (email: string, amount: number) => {
  const response = await fetch('/api/initialize-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount }),
  });

  const { data } = await response.json();
  // Redirect user to data.authorization_url provided by Paystack
  window.location.href = data.authorization_url;
};
