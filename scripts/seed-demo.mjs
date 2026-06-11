// Seeds rich fictional demo data for the SmartBunny test account (Marina Silva).
// Requires a fresh token in /tmp/sb-token.txt (run get-token.mjs first).
import { readFileSync } from 'node:fs';

const API = 'http://127.0.0.1:18080/api/v1';
const TOKEN = readFileSync('/tmp/sb-token.txt', 'utf8').trim();
const HEADERS = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

let created = { accounts: 0, series: 0, transactions: 0, budgets: 0, goals: 0, entries: 0 };

async function get(path) {
  const r = await fetch(`${API}${path}`, { headers: HEADERS });
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
async function post(path, body, counter) {
  const r = await fetch(`${API}${path}`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  if (!r.ok) {
    console.error(`POST ${path} FAILED ${r.status}: ${(await r.text()).slice(0, 300)}`);
    console.error('  body:', JSON.stringify(body).slice(0, 300));
    return null;
  }
  if (counter) created[counter]++;
  const text = await r.text();
  try { return JSON.parse(text); } catch { return null; }
}

// Deterministic pseudo-random for natural-looking variation.
let seed = 42;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
function between(min, max) { return min + rnd() * (max - min); }
function money(v) { return v.toFixed(2); }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

// ---------- lookups ----------
const expenseCats = (await get('/categories?type=expense')).data;
const incomeCats = (await get('/categories?type=income')).data;
const banks = (await get('/banks')).data;

function cat(name, list = expenseCats) {
  const c = list.find((c) => (c.display_name || c.name).toLowerCase().includes(name.toLowerCase()));
  return c ? c.id : undefined;
}
function bank(name) {
  const b = banks.find((b) => b.name.toLowerCase().includes(name.toLowerCase()));
  return b ? b.id : banks[0].id;
}
console.log('income categories:', incomeCats.map((c) => c.display_name || c.name).join(', '));

// ---------- accounts (idempotent: reuse by name on rerun) ----------
const existing = (await get('/accounts?limit=50')).data ?? [];
async function ensureAccount(body) {
  const found = existing.find((a) => a.name === body.name);
  if (found) return { data: found };
  return post('/accounts', body, 'accounts');
}
const checking = await ensureAccount({
  name: 'Conta Corrente', account_type: 'checking', bank_id: bank('Itau'),
  balance_anchor_amount: '7234.86',
});
const savings = await ensureAccount({
  name: 'Poupança', account_type: 'savings', bank_id: bank('Banco do Brasil'),
  balance_anchor_amount: '18650.00',
});
const card = await ensureAccount({
  name: 'Cartão Nubank', account_type: 'credit-card', bank_id: bank('Nubank') || bank('Nu'),
  credit_limit: '8000.00', credit_available_limit: '5871.55', credit_brand: 'Mastercard',
  credit_balance_close_date: '2026-06-28', credit_balance_due_date: '2026-07-05',
});

const checkingId = checking?.data?.id;
const savingsId = savings?.data?.id;
const cardId = card?.data?.id;
if (!checkingId || !cardId) throw new Error('account creation failed, aborting');

// ---------- recurring series ----------
const SERIES = [
  { description: 'Salário', kind: 'income', series_type: 'salary_income', amount: 9500, day: 5, category: cat('Salário', incomeCats) ?? cat('Sal', incomeCats), merchant: 'Horizonte Tech Ltda' },
  { description: 'Aluguel', kind: 'expense', series_type: 'other_recurring_expense', amount: 2200, day: 10, category: cat('Aluguel') },
  { description: 'Condomínio', kind: 'expense', series_type: 'other_recurring_expense', amount: 580, day: 8, category: cat('Condomínio') },
  { description: 'Conta de Energia', kind: 'expense', series_type: 'subscription_bill', amount: 245, day: 15, category: cat('Energia'), merchant: 'Enel' },
  { description: 'Internet Fibra', kind: 'expense', series_type: 'subscription_bill', amount: 119.9, day: 12, category: cat('Internet') ?? cat('Moradia'), merchant: 'Vivo' },
  { description: 'Netflix', kind: 'expense', series_type: 'subscription_bill', amount: 55.9, day: 20, category: cat('Streaming'), merchant: 'Netflix' },
  { description: 'Spotify', kind: 'expense', series_type: 'subscription_bill', amount: 21.9, day: 18, category: cat('Streaming'), merchant: 'Spotify' },
  { description: 'Academia', kind: 'expense', series_type: 'subscription_bill', amount: 129.9, day: 6, category: cat('Academia') ?? cat('Cuidados'), merchant: 'SmartFit' },
  { description: 'Plano de Saúde', kind: 'expense', series_type: 'subscription_bill', amount: 489, day: 3, category: cat('Plano de Saúde') },
];

for (const s of SERIES) {
  const nextDay = String(s.day).padStart(2, '0');
  // next due: July if the June occurrence already passed, else June
  const nextMonth = s.day > 11 ? '06' : '07';
  await post('/recurrences/series', {
    description: s.description, kind: s.kind, series_type: s.series_type,
    amount_mode: 'fixed', amount: money(s.amount), frequency: 'monthly',
    next_due_date: `2026-${nextMonth}-${nextDay}`,
    account_id: checkingId, category_id: s.category, merchant_name: s.merchant,
    is_enabled: true,
  }, 'series');
}

// ---------- transactions (2026-03-01 .. 2026-06-11) ----------
const txns = [];
function addTx(accountId, dateStr, description, amount, opts = {}) {
  txns.push({
    account_id: accountId,
    description,
    amount: money(Math.abs(amount)),
    type: opts.income ? 'credit' : 'debit',
    impact_type: opts.income ? 'income' : 'expense',
    occurred_at: `${dateStr}T${opts.time ?? '12:00:00'}-03:00`,
    category_id: opts.category,
    merchant_name: opts.merchant,
  });
}
const months = [
  { y: 2026, m: 3, days: 31 },
  { y: 2026, m: 4, days: 30 },
  { y: 2026, m: 5, days: 31 },
  { y: 2026, m: 6, days: 11 }, // partial month, up to "today"
];
const d2 = (n) => String(n).padStart(2, '0');

for (const { y, m, days } of months) {
  const date = (day) => `${y}-${d2(m)}-${d2(day)}`;
  const has = (day) => day <= days;

  // fixed monthly events (mirror the recurring series)
  if (has(5)) addTx(checkingId, date(5), 'Salário', 9500, { income: true, category: cat('Sal', incomeCats), merchant: 'Horizonte Tech Ltda', time: '08:10:00' });
  if (has(10)) addTx(checkingId, date(10), 'Aluguel', 2200, { category: cat('Aluguel') });
  if (has(8)) addTx(checkingId, date(8), 'Condomínio', 580, { category: cat('Condomínio') });
  if (has(15)) addTx(checkingId, date(15), 'Conta de Energia', between(195, 285), { category: cat('Energia'), merchant: 'Enel' });
  if (has(12)) addTx(checkingId, date(12), 'Internet Fibra', 119.9, { category: cat('Internet') ?? cat('Moradia'), merchant: 'Vivo' });
  if (has(20)) addTx(checkingId, date(20), 'Netflix', 55.9, { category: cat('Streaming'), merchant: 'Netflix' });
  if (has(18)) addTx(checkingId, date(18), 'Spotify', 21.9, { category: cat('Streaming'), merchant: 'Spotify' });
  if (has(6)) addTx(checkingId, date(6), 'Academia', 129.9, { category: cat('Academia') ?? cat('Cuidados'), merchant: 'SmartFit' });
  if (has(3)) addTx(checkingId, date(3), 'Plano de Saúde', 489, { category: cat('Plano de Saúde') });

  // groceries: weekly-ish on checking
  for (const day of [2, 9, 16, 23, 29]) {
    if (!has(day)) continue;
    addTx(checkingId, date(day), 'Supermercado', between(160, 440), {
      category: cat('Supermercado'), merchant: pick(['Carrefour', 'Pão de Açúcar', 'Assaí']), time: '18:40:00',
    });
  }
  // fuel 2x month
  for (const day of [7, 21]) {
    if (!has(day)) continue;
    addTx(checkingId, date(day), 'Combustível', between(180, 270), { category: cat('Combustível'), merchant: pick(['Shell', 'Ipiranga']) });
  }
  // credit card: delivery, rides, restaurants, shopping
  for (const day of [1, 4, 8, 11, 14, 17, 19, 22, 25, 27, 30]) {
    if (!has(day)) continue;
    const kind = rnd();
    if (kind < 0.4) addTx(cardId, date(day), 'Delivery', between(38, 95), { category: cat('Delivery'), merchant: 'iFood', time: '20:30:00' });
    else if (kind < 0.7) addTx(cardId, date(day), 'Corrida de app', between(14, 48), { category: cat('Uber'), merchant: pick(['Uber', '99']), time: '08:45:00' });
    else addTx(cardId, date(day), 'Restaurante', between(65, 185), { category: cat('Restaurantes'), merchant: pick(['Outback', 'Coco Bambu', 'Cantina da Nonna']), time: '13:15:00' });
  }
  if (has(13)) addTx(cardId, date(13), 'Farmácia', between(55, 140), { category: cat('Farmácia') ?? cat('Saúde'), merchant: 'Droga Raia' });
  if (has(24)) addTx(cardId, date(24), 'Compras online', between(120, 430), { category: cat('Eletrônicos') ?? cat('Compras'), merchant: pick(['Amazon', 'Mercado Livre', 'Renner']) });
  if (has(26)) addTx(cardId, date(26), 'Cinema', between(42, 78), { category: cat('Cinema'), merchant: 'Cinemark', time: '21:00:00' });
}
// extra income moments
addTx(checkingId, '2026-04-16', 'Projeto freelance', 1800, { income: true, category: cat('Freel', incomeCats) ?? cat('Outr', incomeCats) ?? cat('Renda', incomeCats), merchant: 'Studio Aurora' });
addTx(checkingId, '2026-05-21', 'Projeto freelance', 2400, { income: true, category: cat('Freel', incomeCats) ?? cat('Outr', incomeCats) ?? cat('Renda', incomeCats), merchant: 'Studio Aurora' });
// savings deposits
addTx(savingsId, '2026-03-06', 'Aporte poupança', 1500, { income: true, category: cat('Transfer', incomeCats) ?? undefined });
addTx(savingsId, '2026-04-06', 'Aporte poupança', 1500, { income: true, category: cat('Transfer', incomeCats) ?? undefined });
addTx(savingsId, '2026-05-06', 'Aporte poupança', 1500, { income: true, category: cat('Transfer', incomeCats) ?? undefined });

for (const t of txns) await post('/transactions', t, 'transactions');

// ---------- budget ----------
await post('/budgets', {
  name: 'Orçamento Mensal', limit_type: 'absolute', recurrence: 'monthly',
  start_date: '2026-01-01', limit_application_mode: 'repeating',
  income_source_type: 'fixed', income_fixed_monthly_amount: '9500.00',
  categories: [
    { category_id: cat('Alimentação'), limit_value: '1800.00', limit_value_type: 'amount', limit_source_type: 'manual', is_included: true },
    { category_id: cat('Transporte'), limit_value: '800.00', limit_value_type: 'amount', limit_source_type: 'manual', is_included: true },
    { category_id: cat('Lazer'), limit_value: '600.00', limit_value_type: 'amount', limit_source_type: 'manual', is_included: true },
    { category_id: cat('Compras'), limit_value: '700.00', limit_value_type: 'amount', limit_source_type: 'manual', is_included: true },
    { category_id: cat('Saúde'), limit_value: '900.00', limit_value_type: 'amount', limit_source_type: 'manual', is_included: true },
    { category_id: cat('Moradia'), limit_value: '3400.00', limit_value_type: 'amount', limit_source_type: 'manual', is_included: true },
  ].filter((c) => c.category_id),
}, 'budgets');

// ---------- goals ----------
async function goal(body, entries) {
  const g = await post('/goals', body, 'goals');
  const id = g?.data?.id;
  if (!id) return;
  for (const e of entries) {
    await post(`/goals/${id}/progress-entries`, { entry_type: 'confirmation', currency_code: 'BRL', ...e }, 'entries');
  }
}
await goal(
  { name: 'Reserva de Emergência', target_amount: '30000.00', funding_source: 'plan_only', contribution_amount: '1500.00', contribution_frequency: 'monthly', planning_mode: 'keep_contribution', planning_start_date: '2025-08-01' },
  ['2025-12-30', '2026-01-30', '2026-02-27', '2026-03-30', '2026-04-29', '2026-05-29'].map((d, i) => ({ amount: i === 0 ? '11000.00' : '1500.00', entry_date: d })),
);
await goal(
  { name: 'Viagem para a Patagônia', target_amount: '12000.00', funding_source: 'plan_only', contribution_amount: '900.00', contribution_frequency: 'monthly', planning_mode: 'keep_deadline', deadline_date: '2026-12-15', planning_start_date: '2025-11-01' },
  ['2025-12-10', '2026-01-10', '2026-02-10', '2026-03-10', '2026-04-10', '2026-05-10'].map((d, i) => ({ amount: i === 0 ? '2700.00' : '900.00', entry_date: d })),
);
await goal(
  { name: 'Notebook Novo', target_amount: '9000.00', funding_source: 'plan_only', contribution_amount: '800.00', contribution_frequency: 'monthly', planning_mode: 'keep_contribution', planning_start_date: '2026-01-01' },
  ['2026-02-15', '2026-03-15', '2026-04-15', '2026-05-15'].map((d, i) => ({ amount: i === 0 ? '1600.00' : '800.00', entry_date: d })),
);

console.log('created:', JSON.stringify(created));
