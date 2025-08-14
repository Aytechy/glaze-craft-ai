import React, { useState } from 'react';

type Oxide = { name: string; group: 'Flux' | 'Intermediate' | 'Former'; amount: number; };

const DEFAULTS: Oxide[] = [
  { name: 'Na2O', group: 'Flux', amount: 0 },
  { name: 'K2O', group: 'Flux', amount: 0 },
  { name: 'CaO', group: 'Flux', amount: 0 },
  { name: 'MgO', group: 'Flux', amount: 0 },
  { name: 'Al2O3', group: 'Intermediate', amount: 0 },
  { name: 'B2O3', group: 'Intermediate', amount: 0 },
  { name: 'SiO2', group: 'Former', amount: 0 },
];

export default function UMFCalculator() {
  const [oxides, setOxides] = useState<Oxide[]>(DEFAULTS);

  function update(i: number, amount: number) {
    setOxides(prev => prev.map((o, idx) => idx === i ? { ...o, amount } : o));
  }

  const totalFlux = oxides
    .filter(o => o.group === 'Flux')
    .reduce((s, o) => s + (o.amount || 0), 0) || 1;

  const normalized = oxides.map(o => ({
    ...o,
    umf: o.group === 'Flux' ? (o.amount || 0) / totalFlux : (o.amount || 0),
  }));

  const sio2 = normalized.find(o => o.name === 'SiO2')?.umf ?? 0;
  const al2o3 = normalized.find(o => o.name === 'Al2O3')?.umf ?? 0;
  const ratio = al2o3 ? (sio2 / al2o3) : 0;
  const warn = ratio && (ratio < 5 || ratio > 12);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">UMF Calculator</h1>
        <p className="text-muted-foreground text-sm">Enter oxide molar amounts. Fluxes normalize to unity.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {(['Flux','Intermediate','Former'] as const).map(group => (
          <section key={group} className="rounded-xl border p-4">
            <h2 className="font-medium mb-3">{group}s</h2>
            {oxides.map((o, i) => (
              o.group === group && (
                <label key={o.name} className="grid grid-cols-[100px_1fr] items-center gap-3 mb-2" title={
                  o.name === 'Na2O' ? 'Common flux from soda feldspar' :
                  o.name === 'B2O3' ? 'Lowers melting temp; boron source' :
                  o.name === 'SiO2' ? 'Glass former (silica)' :
                  undefined
                }>
                  <span className="text-sm">{o.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    className="rounded-lg border bg-background p-2"
                    value={o.amount}
                    onChange={(e) => update(i, parseFloat(e.target.value || '0'))}
                  />
                </label>
              )
            ))}
          </section>
        ))}
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h2 className="font-medium mb-2">Normalized (preview)</h2>
        <ul className="text-sm grid gap-1">
          {normalized.map(o => (
            <li key={o.name}>
              {o.name}: {o.umf.toFixed(3)}
            </li>
          ))}
        </ul>

        <div className="mt-3 text-sm">
          <span className="font-medium">SiO₂:Al₂O₃ ratio:</span> {ratio ? ratio.toFixed(2) : '—'}
          {warn && <span className="ml-2 text-amber-600">Check typical ranges (5–12) for many stoneware glazes.</span>}
        </div>
      </div>
    </div>
  );
}