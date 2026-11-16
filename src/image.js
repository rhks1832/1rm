import { estimate, repMax, targets, fmt } from './calc.js'

// 결과를 1080px 폭 이미지(PNG data URL)로 그립니다. 외부 라이브러리 없음.
export function makeImage(LIFTS, results, unit) {
  const idx = LIFTS.map((_, i) => i).filter((i) => results[i] !== null)
  if (!idx.length) return null
  const W = 1080
  const pad = 56
  const font = '-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif'
  const H = 330 + idx.length * 120 + 80 + 11 * 62 + 60 + 80 + (idx.length + 1) * 62 + 100
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = '#0a0a0a'
  g.fillRect(0, 0, W, H)
  const grad = g.createLinearGradient(0, 0, 0, 260)
  grad.addColorStop(0, '#2a0709')
  grad.addColorStop(1, '#0a0a0a')
  g.fillStyle = grad
  g.fillRect(0, 0, W, 260)
  g.fillStyle = '#e11d2e'
  g.fillRect(0, 258, W, 6)
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#ff3b4a'
  g.font = '800 26px ' + font
  g.fillText('1RM CALCULATOR', pad, 90)
  g.fillStyle = '#f5f5f5'
  g.font = '900 72px ' + font
  g.fillText('내 1RM 추정 결과', pad, 180)

  let y = 330
  idx.forEach((i) => {
    g.fillStyle = '#151515'
    g.fillRect(pad, y - 62, W - pad * 2, 104)
    g.fillStyle = '#e11d2e'
    g.fillRect(pad, y - 62, 8, 104)
    g.fillStyle = '#f5f5f5'
    g.font = '800 38px ' + font
    g.fillText(LIFTS[i].ko, pad + 36, y - 6)
    g.fillStyle = '#9a9a9a'
    g.font = '500 24px ' + font
    g.fillText(LIFTS[i].en, pad + 36, y + 28)
    g.textAlign = 'right'
    g.fillStyle = '#ff3b4a'
    g.font = '900 54px ' + font
    g.fillText(fmt(results[i]) + ' ' + unit, W - pad - 30, y + 14)
    g.textAlign = 'left'
    y += 120
  })

  y += 40
  const colW = (W - pad * 2 - 150) / idx.length
  const drawHead = (title) => {
    g.fillStyle = '#f5f5f5'
    g.font = '800 34px ' + font
    g.fillText(title, pad, y)
    y += 34
    g.fillStyle = '#9a9a9a'
    g.font = '600 24px ' + font
  }
  drawHead('반복 횟수별 추정 중량 (' + unit + ')')
  idx.forEach((i, k) => g.fillText(LIFTS[i].ko, pad + 150 + k * colW + 10, y + 14))
  y += 62
  for (let n = 1; n <= 10; n++) {
    g.fillStyle = '#2a2a2a'
    g.fillRect(pad, y + 14, W - pad * 2, 2)
    g.fillStyle = '#ff3b4a'
    g.font = '800 28px ' + font
    g.fillText(n + '회', pad, y)
    g.fillStyle = '#f5f5f5'
    g.font = '600 30px ' + font
    idx.forEach((i, k) => g.fillText(fmt(repMax(results[i], n)), pad + 150 + k * colW + 10, y))
    y += 52
  }

  y += 50
  drawHead('목표 중량 (수행 1RM 기준, ' + unit + ')')
  const cols = ['수행 1RM', '헤비 90%', '중간 80%', '볼륨 70%']
  const cw = (W - pad * 2 - 230) / 4
  cols.forEach((t, k) => g.fillText(t, pad + 230 + k * cw, y + 14))
  y += 66
  idx.forEach((i) => {
    const t = targets(results[i], unit)
    g.fillStyle = '#2a2a2a'
    g.fillRect(pad, y + 14, W - pad * 2, 2)
    g.fillStyle = '#f5f5f5'
    g.font = '700 26px ' + font
    g.fillText(LIFTS[i].ko, pad, y)
    ;[t.perf, t.heavy, t.mid, t.vol].forEach((v, k) => {
      g.fillStyle = k === 0 ? '#f5f5f5' : '#ff3b4a'
      g.font = '800 30px ' + font
      g.fillText(fmt(v), pad + 230 + k * cw, y)
    })
    y += 52
  })

  g.fillStyle = '#777777'
  g.font = '500 22px ' + font
  g.fillText('모든 값은 추정치입니다 · © 좌용관', pad, H - 50)
  return c.toDataURL('image/png')
}
