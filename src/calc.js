export const LIFTS = [
  { ko: '스쿼트', en: 'Squat' },
  { ko: '벤치프레스', en: 'Bench Press' },
  { ko: '데드리프트', en: 'Deadlift' },
  { ko: '오버헤드 프레스', en: 'Overhead Press' },
]
const PF = 0.95 // 수행 1RM 보정 비율

export function estimate(w, r) {
  const kg = parseFloat(w)
  const reps = parseInt(r, 10)
  if (!(kg > 0) || !(reps >= 1)) return null
  const e = reps === 1 ? kg : kg * (1 + reps / 30)
  return Math.round(e * 2) / 2
}
export function repMax(e, n) {
  const v = n === 1 ? e : e / (1 + n / 30)
  return Math.round(v * 2) / 2
}
export function targets(e, unit) {
  const step = unit === 'kg' ? 2.5 : 5
  const p = e * PF
  const rd = (x) => Math.round(x / step) * step
  return { perf: Math.round(p * 10) / 10, heavy: rd(p * 0.9), mid: rd(p * 0.8), vol: rd(p * 0.7) }
}
export const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
