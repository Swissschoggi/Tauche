import { useMemo } from "react"
import "./DiveCalendar.css"

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""]
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

function getIntensityClass(count) {
  if (count === 0) return "dc-cell dc-cell--0"
  if (count === 1) return "dc-cell dc-cell--1"
  if (count <= 3)  return "dc-cell dc-cell--2"
  if (count <= 5)  return "dc-cell dc-cell--3"
  return "dc-cell dc-cell--4"
}

export default function DiveCalendar({ dives }) {
  const weeks = useMemo(() => {
    const diveCountByDate = {}
    for (const d of dives) {
      if (d.date) {
        const key = d.date.substring(0, 10)
        diveCountByDate[key] = (diveCountByDate[key] || 0) + 1
      }
    }

    const now = new Date()
    const start = new Date(now)
    start.setFullYear(start.getFullYear() - 1)
    start.setDate(start.getDate() - start.getDay())

    const weeks = []
    const cursor = new Date(start)
    const monthLabels = []

    while (cursor <= now || weeks.length < 53) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().substring(0, 10)
        const count = diveCountByDate[dateStr] || 0
        const isToday = dateStr === now.toISOString().substring(0, 10)
        week.push({ date: dateStr, count, isToday })
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)

      if (cursor > now && weeks.length >= 53) break
    }

    const seen = new Set()
    for (const [wi, week] of weeks.entries()) {
      for (const cell of week) {
        const m = parseInt(cell.date.substring(5, 7), 10)
        if (!seen.has(m)) {
          seen.add(m)
          const dayOfMonth = parseInt(cell.date.substring(8, 10), 10)
          if (dayOfMonth <= 7) {
            monthLabels.push({ week: wi, month: m - 1 })
          }
        }
      }
    }

    return { weeks, monthLabels }
  }, [dives])

  const totalDives = dives.filter(d => d.date).length
  const streak = useMemo(() => {
    const dates = [...new Set(dives.filter(d => d.date).map(d => d.date.substring(0, 10)))]
    dates.sort().reverse()
    let s = 0
    for (const d of dates) {
      const expected = new Date()
      expected.setDate(expected.getDate() - s)
      if (d === expected.toISOString().substring(0, 10)) {
        s++
      } else break
    }
    return s
  }, [dives])

  const colorCounts = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const week of weeks.weeks) {
      for (const cell of week) {
        const idx = cell.count === 0 ? 0 : cell.count === 1 ? 1 : cell.count <= 3 ? 2 : cell.count <= 5 ? 3 : 4
        counts[idx]++
      }
    }
    return counts
  }, [weeks])

  return (
    <div className="dive-calendar">
      <div className="dc-header">
        <h3 className="dc-title">Dive Activity</h3>
        <div className="dc-stats">
          <span className="dc-stat">{totalDives} dives</span>
          {streak > 0 && <span className="dc-stat">{streak} day streak</span>}
        </div>
      </div>

      <div className="dc-body">
        <div className="dc-day-labels">
          {DAYS.map((d, i) => (
            <div key={i} className="dc-day-label">{d}</div>
          ))}
        </div>

        <div className="dc-grid-wrap">
          <div className="dc-month-labels">
            {weeks.monthLabels.map(({ week, month }) => (
              <div
                key={month}
                className="dc-month-label"
                style={{ marginLeft: `${week * 14}px` }}
              >
                {MONTHS[month]}
              </div>
            ))}
          </div>

          <div className="dc-grid">
            {weeks.weeks.map((week, wi) => (
              <div key={wi} className="dc-week">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={`${getIntensityClass(cell.count)} ${cell.isToday ? "dc-cell--today" : ""}`}
                    title={`${cell.date}: ${cell.count} dive${cell.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dc-footer">
        <span className="dc-legend-label">Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`dc-cell dc-cell--${i}`} />
        ))}
        <span className="dc-legend-label">More</span>
      </div>
    </div>
  )
}
