// Fixes the parts of seed-demo.mjs that failed: budget child-category limits,
// goal progress entries (as adjustments), savings deposits without category.
import { readFileSync } from 'node:fs';

const API = 'http://127.0.0.1:18080/api/v1';
const TOKEN = readFileSync('/tmp/sb-token.txt', 'utf8').trim();
const HEADERS = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function get(path) {
  const r = await fetch(`${API}${path}`, { headers: HEADERS });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}
async function post(path, body) {
  const r = await fetch(`${API}${path}`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  const text = await r.text();
  console.log(r.ok ? 'OK  ' : 'FAIL', path, r.ok ? '' : text.slice(0, 180));
  try { return JSON.parse(text); } catch { return null; }
}

const expenseCats = (await get('/categories?type=expense')).data;
const incomeCats = (await get('/categories?type=income')).data;
const child = (name, list = expenseCats) => {
  const c = list.find((c) => c.parent_id && (c.display_name || c.name).toLowerCase().includes(name.toLowerCase()));
  return c?.id;
};

// savings deposits (child income category)
const accounts = (await get('/accounts?limit=50')).data;
const savingsId = accounts.find((a) => a.name === 'Poupança')?.id;
const depositCat = child('Transferência Bancária', incomeCats) ?? child('Pix Recebido', incomeCats);
if (savingsId) {
  for (const d of ['2026-03-06', '2026-04-06', '2026-05-06']) {
    await post('/transactions', {
      account_id: savingsId, description: 'Aporte poupança', amount: '1500.00',
      type: 'credit', impact_type: 'income', occurred_at: `${d}T09:00:00-03:00`, category_id: depositCat,
    });
  }
}

// budget with child categories
const budgets = (await get('/budgets')).data;
if (!budgets.some((b) => b.name === 'Orçamento Mensal')) {
  await post('/budgets', {
    name: 'Orçamento Mensal', limit_type: 'absolute', recurrence: 'monthly',
    start_date: '2026-01-01', limit_application_mode: 'repeating',
    income_source_type: 'fixed', income_fixed_monthly_amount: '9500.00',
    categories: [
      { name: 'Supermercado', v: '1400.00' },
      { name: 'Restaurantes', v: '600.00' },
      { name: 'Delivery', v: '450.00' },
      { name: 'Combustível', v: '550.00' },
      { name: 'Uber', v: '250.00' },
      { name: 'Streaming', v: '120.00' },
      { name: 'Roupas', v: '400.00' },
      { name: 'Aluguel', v: '2200.00' },
      { name: 'Condomínio', v: '580.00' },
      { name: 'Energia', v: '300.00' },
      { name: 'Plano de Saúde', v: '500.00' },
      { name: 'Cinema', v: '150.00' },
    ].map((c) => ({
      category_id: child(c.name), limit_value: c.v, limit_value_type: 'amount',
      limit_source_type: 'manual', is_included: true,
    })).filter((c) => c.category_id),
  });
}

// goal progress as adjustments (no cash reservation needed)
const goalsResp = await get('/goals');
const goals = Array.isArray(goalsResp.data) ? goalsResp.data : goalsResp.data.items ?? [];
const PROGRESS = {
  'Reserva de Emergência': '18500.00',
  'Viagem para a Patagônia': '7200.00',
  'Notebook Novo': '4800.00',
};
for (const g of goals) {
  const target = PROGRESS[g.name];
  if (!target) continue;
  const current = Number(g.current_amount ?? g.progress?.current_amount ?? 0);
  const missing = Number(target) - current;
  console.log('goal', g.name, 'current', current, 'missing', missing);
  if (missing > 0) {
    await post(`/goals/${g.id}/progress-entries`, {
      entry_type: 'adjustment', currency_code: 'BRL', amount: missing.toFixed(2),
      entry_date: '2026-06-01', note: 'Saldo acumulado',
    });
  }
}
console.log('fixup done');
