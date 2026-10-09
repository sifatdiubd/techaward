const PAYMENTLY_API_BASE = "https://ows.paymently.io/api";
const PAYMENTLY_API_KEY = "ovUTkWymtUYfR19efRDF6plqA5F4LBvOpZImgGzA";
const paymentlyHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "RT-UDDOKTAPAY-API-KEY": PAYMENTLY_API_KEY,
});

export const createCheckout = async (params) => {
  try {
    return await (
      await fetch(`${PAYMENTLY_API_BASE}/checkout-v2`, {
        method: "POST",
        headers: paymentlyHeaders(),
        body: JSON.stringify({
          full_name: params.fullName || params.email,
          email: params.email,
          amount: params.amount,
          metadata: params.metadata || {},
          redirect_url: params.redirectUrl,
          return_type: "GET",
          cancel_url: params.cancelUrl,
          webhook_url: params.webhookUrl || "",
        }),
      })
    ).json();
  } catch (err) {
    console.error("Paymently checkout failed:", err);
    return {
      status: false,
      message: "Network error",
    };
  }
};

export const verifyPayment = async (invoiceId) => {
  try {
    return await (
      await fetch(`${PAYMENTLY_API_BASE}/verify-payment`, {
        method: "POST",
        headers: paymentlyHeaders(),
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      })
    ).json();
  } catch (err) {
    console.error("Paymently verification failed:", err);
    return {
      status: false,
      message: "Network error",
    };
  }
};

export const getInvoiceIdFromQuery = (search) => {
  const params = new URLSearchParams(search);
  for (const key of [
    "invoice_id",
    "invoiceId",
    "invoice",
    "transaction_id",
    "trx_id",
    "id",
  ]) {
    const value = params.get(key);
    if (value) {
      return value;
    }
  }
  return null;
};

export const getTransactionId = (response, fallback) => {
  const data = response?.data ?? response;
  return (
    data?.transaction_id ||
    data?.trx_id ||
    data?.trxId ||
    data?.transactionId ||
    data?.invoice_id ||
    fallback
  );
};
