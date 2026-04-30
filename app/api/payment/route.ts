import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const TOKEN_URL = 'https://id.teya.xyz/oauth/v2/oauth-token';
const API_URL = 'https://api.teya.xyz';

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.TEYA_CLIENT_ID}:${process.env.TEYA_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'payment-links/create payment-links/id/get payment-links/id/update',
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Teya token failed:', res.status, errBody);
    throw new Error('Teya token request failed');
  }
  const { access_token } = await res.json();
  return access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { productName, price, productId } = await req.json();

    const accessToken = await getAccessToken();

    const linkRes = await fetch(`${API_URL}/v2/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': randomUUID(),
      },
      body: JSON.stringify({
        store_id: process.env.TEYA_STORE_ID,
        amount: {
          currency: 'ISK',
          value: price,
        },
        line_items: [
          {
            description: productName,
            quantity: 1,
            unit_price: price,
          },
        ],
        merchant_reference: productId,
        success_url: `https://propads-web.vercel.app/payment/success`,
        cancel_url: `https://propads-web.vercel.app/`,
        post_success_payment: 'REDIRECT',
        transaction_type: 'SALE',
        type: 'SINGLE_USE',
      }),
    });

    const linkData = await linkRes.json();

    if (!linkRes.ok) {
      console.error('Teya error:', linkData);
      return NextResponse.json({ error: 'Tókst ekki að búa til greiðslutengil' }, { status: 500 });
    }

    return NextResponse.json({ payment_link: linkData.payment_link });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Villa kom upp' }, { status: 500 });
  }
}
