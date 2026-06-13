import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import DashboardLayout, { activeFilter } from '../components/DashboardLayout'
import side3 from '../assets/side3.svg'

function CircleGauge({ current, max }) {
  const pct = Math.min(current / max, 1)
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const gap = circ - dash
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
      <circle cx="55" cy="55" r={r} fill="none" stroke="#0055FF" strokeWidth="10" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 55 55)" />
      <text x="55" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{current}</text>
      <text x="55" y="68" textAnchor="middle" fontSize="12" fill="#9CA3AF">/ {max}자루</text>
    </svg>
  )
}

export default function StoragePage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [racks, setRacks] = useState([])
  const [selectedRack, setSelectedRack] = useState(null)
  const [rackBags, setRackBags] = useState([])
  const [loadingBags, setLoadingBags] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/dashboard/login') }

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/dashboard/racks/summary'),
      axiosInstance.get('/dashboard/racks')
    ]).then(([s, r]) => { setSummary(s.data.data); setRacks(r.data.data.items) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleRackClick = async (rackCode) => {
    if (selectedRack === rackCode) { setSelectedRack(null); setRackBags([]); return }
    setSelectedRack(rackCode)
    setLoadingBags(true)
    try {
      const res = await axiosInstance.get(`/dashboard/racks/${rackCode}/bags?size=100`)
      setRackBags(res.data.data.items)
    } catch (e) { console.error(e) }
    finally { setLoadingBags(false) }
  }

  const selectedRackInfo = racks.find(r => r.rack_code === selectedRack)

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={side3} width="22" height="22" style={{ filter: activeFilter }} />
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>보관 현황</span>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: '100px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6' }} />)}
          </div>
        ) : summary && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: '총 보관 자루', value: summary.total_stored_bag_count?.toLocaleString(), unit: '자루', diff: summary.total_stored_bag_count_diff, diffUp: summary.total_stored_bag_count_diff > 0 },
              { label: '총 무게', value: summary.total_weight_kg?.toLocaleString(), unit: 'kg', diff: summary.total_weight_kg_diff, diffUp: summary.total_weight_kg_diff > 0 },
              { label: '수거 건수', value: summary.collection_count, unit: '건', diff: summary.collection_count_diff, diffUp: summary.collection_count_diff > 0 },
              { label: '가장 오래된 수거', value: summary.oldest_bag?.serial_number || '-', unit: null, sub: summary.oldest_bag ? `${summary.oldest_bag.site_name} · ${summary.oldest_bag.bag_count}자루` : null },
            ].map((card, i) => (
              <div key={i} style={{ flex: 1, minWidth: '160px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{card.label}</span>
                <span style={{ fontSize: card.unit ? '28px' : '16px', fontWeight: 700, color: '#111827' }}>{card.value}</span>
                {card.unit && <span style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '-6px' }}>{card.unit}</span>}
                {card.sub && <span style={{ fontSize: '12px', color: '#6B7280' }}>{card.sub}</span>}
                {card.diff !== undefined && card.diff !== null && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: card.diffUp ? '#EF4444' : '#3B82F6' }}>
                    {card.diffUp ? '▲' : '▼'} 전주 대비 {card.diffUp ? '+' : ''}{card.diff}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>보관 현황</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {racks.map(rack => (
                <div key={rack.rack_code} onClick={() => handleRackClick(rack.rack_code)}
                  style={{ backgroundColor: selectedRack === rack.rack_code ? '#EFF6FF' : '#F9FAFB', borderRadius: '12px', border: `1.5px solid ${selectedRack === rack.rack_code ? '#BFDBFE' : '#F3F4F6'}`, padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0055FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{rack.rack_code}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{rack.rack_code}구역</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>{rack.current_count}건 수거분 보관중</p>
                    </div>
                  </div>
                  <CircleGauge current={rack.current_count} max={rack.max_capacity} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', padding: '20px', minHeight: '300px' }}>
            {!selectedRack ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>📦</span>
                <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>구역을 클릭하면<br />상세 정보가 표시됩니다.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0055FF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{selectedRack}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>{selectedRack}구역</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{selectedRackInfo?.current_count}/{selectedRackInfo?.max_capacity}자루 적재 중</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 100px 140px 1fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid #F3F4F6', marginBottom: '8px' }}>
                  {['마대 ID', '집하장', '적재 일시', '수거 ID'].map(h => <span key={h} style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{h}</span>)}
                </div>
                {loadingBags ? <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>불러오는 중...</div> :
                  rackBags.length === 0 ? <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>보관된 자루가 없습니다.</div> : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {rackBags.map(bag => {
                        const shortCollectionId = bag.collection_id ? bag.collection_id.slice(0, 8).toUpperCase() : '-'
                        return (
                          <div key={bag.bag_id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 100px 140px 1fr', gap: '8px', padding: '10px 0', borderBottom: '1px solid #F9FAFB', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827' }}>{bag.serial_number}</p>
                            </div>
                            <span style={{ fontSize: '13px', color: '#111827' }}>{bag.site_name}</span>
                            <span style={{ fontSize: '13px', color: '#111827' }}>{bag.stored_at ? new Date(bag.stored_at).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</span>
                            <span style={{ fontSize: '13px', color: '#4B5563' }} title={bag.collection_id}>
                              {shortCollectionId}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                }
                <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>소계</span>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{rackBags.length} 자루</span>
                    {/*<span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{(rackBags.length * 40).toLocaleString()}kg</span>*/}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}