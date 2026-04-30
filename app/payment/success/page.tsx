export default function PaymentSuccess() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 px-8">
      <div className="text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">Greiðsla tókst!</h1>
        <p className="text-zinc-400">Takk fyrir kaupið. Þú færð staðfestingarpóst innan skamms.</p>
      </div>
      <a
        href="/"
        className="py-2 px-6 border border-zinc-700 rounded-md text-sm hover:border-zinc-400 transition-colors duration-150"
      >
        Til baka á forsíðu
      </a>
    </main>
  );
}
