import { useState, useEffect } from 'react'
import { INSTAGRAM_URL, INQUIRY_URL } from './config.js'
import { makeImage } from './image.js'
import { LIFTS, estimate, repMax, targets, fmt } from './calc.js'

const KEY = 'tls-1rm-v2'
const LB = 2.20462

function notice(reps) {
  const r = parseInt(reps, 10)
  if (!(r >= 1)) return null
  if (r > 10) return { cls: 'bad', text: '10회를 넘으면 오차가 큽니다. 3~5회 기록을 쓰세요' }
  if (r > 5) return { cls: 'mid', text: '6~10회는 참고용입니다' }
  return { cls: 'ok', text: '정확도 양호' }
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (d && Array.isArray(d.w) && Array.isArray(d.r) && d.w.length === 4) return d
  } catch (e) {}
  return { w: ['', '', '', ''], r: ['', '', '', ''], unit: 'kg' }
}

export default function App() {
  const init = load()
  const [w, setW] = useState(init.w)
  const [r, setR] = useState(init.r)
  const [unit, setUnit] = useState(init.unit === 'lb' ? 'lb' : 'kg')
  const [img, setImg] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ w, r, unit }))
    } catch (e) {}
  }, [w, r, unit])

  const set = (arr, setArr, i, v) => {
    const next = arr.slice()
    next[i] = v
    setArr(next)
  }
  const results = LIFTS.map((_, i) => estimate(w[i], r[i]))
  const any = results.some((x) => x !== null)

  const switchUnit = (u) => {
    if (u === unit) return
    const k = u === 'lb' ? LB : 1 / LB
    setW(w.map((v) => (parseFloat(v) > 0 ? String(Math.round(parseFloat(v) * k * 10) / 10) : v)))
    setUnit(u)
  }
  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    setW(['', '', '', ''])
    setR(['', '', '', ''])
    setConfirmReset(false)
  }
  const save = () => setImg(makeImage(LIFTS, results, unit))

  return (
    <main className="wrap">
      <header>
        <div className="top">
          <p className="brand">1RM CALCULATOR</p>
          <div className="seg" role="group" aria-label="단위">
            {['kg', 'lb'].map((u) => (
              <button key={u} className={unit === u ? 'on' : ''} onClick={() => switchUnit(u)}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <h1>1RM 추정표</h1>
        <p className="lead">
          종목별로 <b>최근에 든 무게</b>와 <b>그 무게로 한 횟수</b>만 넣으세요.
          <br />
          3~5회 기록이 가장 정확합니다.
        </p>
      </header>

      {LIFTS.map((L, i) => {
        const e = results[i]
        const n = notice(r[i])
        return (
          <section className="card" key={L.en}>
            <h2>
              {L.ko} <span className="en">{L.en}</span>
            </h2>
            <div className="row">
              <label>
                <span>든 무게 ({unit})</span>
                <input
                  inputMode="decimal"
                  placeholder="예: 100"
                  value={w[i]}
                  onChange={(ev) => set(w, setW, i, ev.target.value.replace(/[^0-9.]/g, ''))}
                />
              </label>
              <label>
                <span>횟수</span>
                <input
                  inputMode="numeric"
                  placeholder="예: 5"
                  value={r[i]}
                  onChange={(ev) => set(r, setR, i, ev.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                />
              </label>
            </div>
            <div className="result">
              <span>추정 1RM</span>
              <strong>{e === null ? '—' : fmt(e) + ' ' + unit}</strong>
            </div>
            {n && e !== null && <p className={'note ' + n.cls}>{n.text}</p>}
          </section>
        )
      })}

      {any && (
        <>
          <p className="next">나온 추정 1RM을 프로그램의 ‘내 1RM’에 입력하세요.</p>

          <section className="card">
            <h2>반복 횟수별 추정 중량 ({unit})</h2>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>횟수</th>
                    {LIFTS.map((L, i) => results[i] !== null && <th key={L.en}>{L.ko}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                    <tr key={n}>
                      <td>{n}회</td>
                      {LIFTS.map((_, i) => results[i] !== null && <td key={i}>{fmt(repMax(results[i], n))}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small">‘5회’ = 그 무게로 최대 5회까지 가능한 무게(5RM). 0.5{unit} 단위, 모든 값은 추정치입니다.</p>
          </section>

          <section className="card">
            <h2>목표 중량 보기</h2>
            <p className="small tight">수행 1RM(추정 1RM × 0.95)의 비율로 계산한 프로그램용 중량입니다. 헤비 주 3~5회 · 중간 주 6~8회 · 볼륨 주 10회 이상.</p>
            <div className="tablewrap">
              <table className="tgt">
                <thead>
                  <tr>
                    <th>종목</th>
                    <th>수행 1RM</th>
                    <th>헤비 90%</th>
                    <th>중간 80%</th>
                    <th>볼륨 70%</th>
                  </tr>
                </thead>
                <tbody>
                  {LIFTS.map((L, i) => {
                    if (results[i] === null) return null
                    const t = targets(results[i], unit)
                    return (
                      <tr key={L.en}>
                        <td>{L.ko}</td>
                        <td>{fmt(t.perf)}</td>
                        <td className="hl">{fmt(t.heavy)}</td>
                        <td className="hl">{fmt(t.mid)}</td>
                        <td className="hl">{fmt(t.vol)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="small">{unit === 'kg' ? '2.5kg' : '5lb'} 단위로 반올림했습니다.</p>
          </section>

          <button className="btn primary" onClick={save}>
            결과 이미지 저장
          </button>
        </>
      )}

      <p className="safety">⚠ 무거운 중량(헤비 구간)은 세이프티 바 또는 스포터와 함께 진행하세요.</p>

      {(INSTAGRAM_URL || INQUIRY_URL) && (
        <div className="cta">
          {INSTAGRAM_URL && (
            <a className="btn ghost" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              인스타그램 팔로우
            </a>
          )}
          {INQUIRY_URL && (
            <a className="btn solid" href={INQUIRY_URL} target="_blank" rel="noopener noreferrer">
              온라인 PT 문의
            </a>
          )}
        </div>
      )}

      <button className={'reset' + (confirmReset ? ' warn' : '')} onClick={reset}>
        {confirmReset ? '한 번 더 누르면 입력값이 모두 지워집니다' : '입력값 초기화'}
      </button>

      <footer>
        <p>입력값은 이 기기에만 저장됩니다.</p>
        <p>© 좌용관</p>
      </footer>

      {img && (
        <div className="modal" onClick={() => setImg(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <p className="tip">이미지를 길게 눌러 저장하세요</p>
            <img src={img} alt="1RM 추정 결과" />
            <a className="btn solid" href={img} download="1RM-result.png">
              이미지 다운로드
            </a>
            <button className="btn ghost" onClick={() => setImg(null)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
