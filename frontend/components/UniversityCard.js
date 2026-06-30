import { useRouter } from 'next/router'
import { useState } from 'react'

const EMOJI = { reach: '😟', match: '😐', safety: '😊' }
const ICON_CLASS = { reach: 'icon-reach', match: 'icon-match', safety: 'icon-safety' }

export default function UniversityCard({ uni, showRemove = false, onSaveToggle, onRemove }) {
  const router = useRouter()
  const [saved, setSaved] = useState(uni.saved || false)

  function handleSave() {
    const next = !saved
    setSaved(next)
    if (onSaveToggle) onSaveToggle(uni.id, next)

    // Обновляем localStorage
    const list = JSON.parse(localStorage.getItem('savedList') || '[]')
    if (next) {
      if (!list.find(u => u.id === uni.id)) list.push({ ...uni, saved: true })
    } else {
      const idx = list.findIndex(u => u.id === uni.id)
      if (idx !== -1) list.splice(idx, 1)
    }
    localStorage.setItem('savedList', JSON.stringify(list))
  }

  function handleRemove() {
    const list = JSON.parse(localStorage.getItem('savedList') || '[]')
    const idx = list.findIndex(u => u.id === uni.id)
    if (idx !== -1) list.splice(idx, 1)
    localStorage.setItem('savedList', JSON.stringify(list))
    if (onRemove) onRemove(uni.id)
  }

  function handleView() {
    router.push(`/university/${uni.id}`)
  }

  const tier = uni.tier_label || uni.tier || 'match'

  // Строка с деталями карточки
  const details = [
    uni.acceptance_rate ? `AC ~${(uni.acceptance_rate * 100).toFixed(1)}%` : null,
    uni.deadline_ed1 ? `1-Nov (ED I)` : uni.deadline_rd ? `${uni.deadline_rd} (RD)` : null,
    uni.aid_label || null,
    uni.sports_conference || null,
    uni.city_size ? uni.city_size : null,
    uni.full_ride ? 'full ride available' : null,
    uni.grant_probability?.score != null ? `grant probability: ${uni.grant_probability.score}%` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="uni-card">
      <div className="uni-card-top">
        <div className={`uni-card-icon ${ICON_CLASS[tier]}`}>
          {EMOJI[tier]}
        </div>
        <div>
          <div className="uni-card-name">{uni.name}</div>
          <div className="uni-card-tier">{tier}</div>
        </div>
      </div>

      <div className="uni-card-info">{details}</div>

      <div className="uni-card-actions">
        {showRemove ? (
          <button
            className="btn-outline btn-outline-red"
            onClick={handleRemove}
          >
            remove
          </button>
        ) : (
          <button
            className="btn-outline"
            onClick={handleSave}
            style={saved ? { borderColor: '#e53935', color: '#e53935' } : {}}
          >
            {saved ? 'unsave' : 'save'}
          </button>
        )}
        <button className="btn-black" onClick={handleView}>view</button>
      </div>
    </div>
  )
}
