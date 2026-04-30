'use client';

import { useState } from 'react';

type Props = {
  productId: string;
  productName: string;
  price: number;
};

export default function BuyButton({ productId, productName, price }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBuy() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productName, price }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_link) {
        setError('Tókst ekki að opna greiðslu. Reyndu aftur.');
        return;
      }

      window.location.href = data.payment_link;
    } catch {
      setError('Tenging mistókst. Reyndu aftur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-2 px-4 bg-white text-black text-sm font-semibold rounded-md
          hover:bg-zinc-200 active:bg-zinc-300
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150"
      >
        {loading ? 'Hleður...' : 'Kaupa'}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
