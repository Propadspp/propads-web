import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Teya webhook:', JSON.stringify(payload, null, 2));

    // TODO: staðfesta undirskrift frá Teya þegar webhook skjölun er tiltæk
    // TODO: uppfæra pöntun í gagnagrunni eftir payment_link_id

    const { event, payment_link_id, status } = payload;

    if (event === 'payment.completed' || status === 'PAID') {
      console.log(`Greiðsla tókst: ${payment_link_id}`);
      // Hér getur þú merkt pöntun sem greidda
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook villa:', err);
    return NextResponse.json({ error: 'Villa' }, { status: 400 });
  }
}
