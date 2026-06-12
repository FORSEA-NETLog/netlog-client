import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import DashboardLayout, { activeFilter } from '../components/DashboardLayout'
import side2 from '../assets/side2.svg'

function StatusBadge({ status }) {
  const map = {
    planned:          { label: '대기',    color: '#F59E0B', bg: '#FFFBEB' },
    in_progress:      { label: '진행중',  color: '#3B82F6', bg: '#EFF6FF' },
    completed:        { label: '완료',    color: '#10B981', bg: '#ECFDF5' },
    stacking_pending: { label: '적재대기', color: '#8B5CF6', bg: '#F5F3FF' },
    stacked:          { label: '적재완료', color: '#6B7280', bg: '#F3F4F6' },
  }
  const s = map[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' }
  return <span style={{ fontSize: '12px', fontWeight: 600, color: s.color, backgroundColor: s.bg, padding: '2px 8px', borderRadius: '6px' }}>{s.label}</span>
}

export default function CollectionsPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [filterSite, setFilterSite] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('2026.05.20')
  const [filterDateTo, setFilterDateTo] = useState('2026.05.25')
  const [filterStatus, setFilterStatus] = useState([])

  const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/dashboard/login') }

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/dashboard/collection-records')
      setRecords(res.data.data.items)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    axiosInstance.get('/dashboard/main/sites').then(res => setSites(res.data.data.items)).catch(console.error)
    fetchRecords()
  }, [fetchRecords])

  const toggleExpand = (id) => {
    setExpandedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const toggleStatusFilter = (s) => {
    setFilterStatus(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])
  }
  const handleStart = () => {
    if (selectedIds.length === 0) return
    navigate(`/dashboard/collections/${selectedIds[0]}/step1`)
  }

  const filtered = records.filter(r => {
    if (filterSite && !r.sites.some(s => s.site_id === filterSite)) return false
    if (filterStatus.length > 0 && !filterStatus.includes(r.status)) return false
    return true
  })

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src={side2} width="22" height="22" style={{ filter: activeFilter }} />
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>수거 관리</span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>항구명:</span>
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
              style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 28px 6px 10px', fontSize: '13px', color: '#111827', backgroundColor: '#fff', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
              <option value="">전체 항구</option>
              {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.site_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>날짜:</span>
            <input type="text" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', width: '100px', outline: 'none' }} />
            <span style={{ color: '#9CA3AF' }}>~</span>
            <input type="text" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', width: '100px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>상태:</span>
            {[{ key: 'planned', label: '수거 대기' }, { key: 'stacked', label: '수거 완료' }].map(({ key, label }) => (
              <button key={key} onClick={() => toggleStatusFilter(key)}
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', border: `1px solid ${filterStatus.includes(key) ? '#0055FF' : '#E5E7EB'}`, backgroundColor: filterStatus.includes(key) ? '#EFF6FF' : '#fff', color: filterStatus.includes(key) ? '#0055FF' : '#6B7280', cursor: 'pointer', fontWeight: filterStatus.includes(key) ? 600 : 400 }}>{label}</button>
            ))}
          </div>
          <button onClick={handleStart} disabled={selectedIds.length === 0}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: selectedIds.length > 0 ? '#0055FF' : '#E5E7EB', color: selectedIds.length > 0 ? '#fff' : '#9CA3AF', fontSize: '13px', fontWeight: 600, cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed' }}>
            🚛 수거 시작
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>총 {filtered.length}건</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? [...Array(3)].map((_, i) => <div key={i} style={{ height: '72px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F3F4F6' }} />) :
            filtered.length === 0 ? <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>수거 기록이 없습니다.</div> :
            filtered.map(record => {
              const selected = selectedIds.includes(record.collection_id)
              const expanded = expandedIds.has(record.collection_id)
              const siteName = record.sites.map(s => s.site_name).join(', ')
              const siteCode = record.sites.map(s => s.site_code).join(', ')
              const totalBags = record.sites.reduce((sum, s) => sum + s.bag_count, 0)
              return (
                <div key={record.collection_id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${selected ? '#BFDBFE' : '#F3F4F6'}`, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: selected ? '#EFF6FF' : '#fff' }}>
                    <input type="checkbox" checked={selected} onChange={() => toggleSelect(record.collection_id)} style={{ width: '16px', height: '16px', accentColor: '#0055FF', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{siteName}</span>
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{siteCode}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>수거 계획 관리자 : {record.manager_name}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{totalBags}</span>
                        <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '2px' }}>자루</span>
                      </div>
                      <StatusBadge status={record.status} />
                      <button onClick={() => toggleExpand(record.collection_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px', padding: '4px' }}>
                        {expanded ? '∧' : '∨'}
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px 20px', backgroundColor: '#F9FAFB' }}>
                      {record.sites.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {record.sites.map(site => (
                            <div key={site.site_id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #F3F4F6', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{site.site_name}</span>
                                <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '8px' }}>{site.site_code}</span>
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0055FF' }}>{site.bag_count}자루</span>
                            </div>
                          ))}
                          {record.planned_at && <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>수거 예정일: {new Date(record.planned_at).toLocaleDateString('ko-KR')}</p>}
                        </div>
                      ) : (
                        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', margin: 0 }}>완료된 수거 내역이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          }
        </div>
      </div>
    </DashboardLayout>
  )
}