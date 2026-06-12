import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import DashboardLayout, { activeFilter } from '../components/DashboardLayout'
import side1 from '../assets/side1.svg'

function SummaryCard({ label, value, unit, diff, diffLabel, diffUp }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', padding: '20px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>{value}</span>
        {unit && <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{unit}</span>}
      </div>
      {diff !== null && diff !== undefined && (
        <span style={{ fontSize: '12px', fontWeight: 500, color: diffUp ? '#EF4444' : '#3B82F6' }}>
          {diffUp ? '▲' : '▼'} 전주 대비 {diffUp ? '+' : ''}{diff}{diffLabel}
        </span>
      )}
    </div>
  )
}

function StatusDot({ status }) {
  const color = status === 'red' ? '#EF4444' : status === 'yellow' ? '#F59E0B' : '#10B981'
  return <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [sites, setSites] = useState([])
  const [selectedSites, setSelectedSites] = useState([])
  const [loading, setLoading] = useState(true)

  // 모달 상태: null | 'form' | 'success'
  const [modalStep, setModalStep] = useState(null)
  const [planManagerName, setPlanManagerName] = useState(localStorage.getItem('manager_name') || '')
  const [creating, setCreating] = useState(false)

  const managerName = localStorage.getItem('manager_name') || '관리자'

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('manager_id')
    localStorage.removeItem('manager_name')
    localStorage.removeItem('manager_role')
    navigate('/dashboard/login')
  }

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/dashboard/main/summary'),
      axiosInstance.get('/dashboard/main/sites')
    ]).then(([summaryRes, sitesRes]) => {
      setSummary(summaryRes.data.data)
      setSites(sitesRes.data.data.items)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const toggleSite = (siteId) => {
    setSelectedSites(prev => prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId])
  }

  const handleCreatePlan = async () => {
    setCreating(true)
    try {
      const managerId = localStorage.getItem('manager_id')
      await axiosInstance.post('/dashboard/collection-records', {
        manager_id: managerId,
        planned_at: new Date().toISOString(),
        site_ids: selectedSites
      })
      setModalStep('success')
    } catch (e) {
      console.error(e)
      alert('수거 계획 생성에 실패했습니다')
    } finally {
      setCreating(false)
    }
  }

  const handleCloseModal = () => {
    setModalStep(null)
    setSelectedSites([])
    setPlanManagerName(localStorage.getItem('manager_name') || '')
  }

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const bagColor = (status) => status === 'red' ? '#EF4444' : status === 'yellow' ? '#F59E0B' : '#10B981'

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={side1} width="22" height="22" style={{ filter: activeFilter }} />
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>집하량 대시보드</span>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{today}</span>
        </div>
        <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{managerName}</span>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '110px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6' }} />)}
          </div>
        ) : summary && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <SummaryCard label="총 대기 자루" value={summary.total_bag_count?.toLocaleString()} unit="" diff={summary.total_bag_count_diff} diffLabel="자루" diffUp={(summary.total_bag_count_diff ?? 0) > 0} />
            <SummaryCard label="수거 필요 집하장" value={summary.urgent_site_count} unit="곳" diff={null} diffLabel="" diffUp={false} />
            <SummaryCard label="이번 주 수거량" value={summary.this_month_weight_kg?.toLocaleString()} unit="kg" diff={summary.this_month_weight_kg_diff} diffLabel="kg" diffUp={(summary.this_month_weight_kg_diff ?? 0) > 0} />
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F9FAFB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏠</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>집하장 별 현황</span>
            </div>
            <button onClick={() => selectedSites.length > 0 && setModalStep('form')} disabled={selectedSites.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: selectedSites.length > 0 ? '#0055FF' : '#F3F4F6', color: selectedSites.length > 0 ? '#fff' : '#9CA3AF', fontSize: '13px', fontWeight: 600, cursor: selectedSites.length > 0 ? 'pointer' : 'not-allowed' }}>
              ↻ 수거 계획 생성
            </button>
          </div>

          <div style={{ padding: '10px 20px', backgroundColor: '#FFFBEB', borderBottom: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#F59E0B', fontSize: '13px' }}>⚠</span>
            <span style={{ fontSize: '12px', color: '#92400E' }}>수거할 집하장을 탭하여 선택하세요.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 150px 100px 120px 60px', padding: '10px 20px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
            {['#', '집하장명', 'ID', '위치', '대기량', '최근수거일', '상태'].map(h => (
              <span key={h} style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{h}</span>
            ))}
          </div>

          {loading ? [...Array(4)].map((_, i) => <div key={i} style={{ height: '52px', borderBottom: '1px solid #F9FAFB' }} />) :
            sites.length === 0 ? <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>집하장 데이터가 없습니다.</div> :
            sites.map((site, idx) => {
              const selected = selectedSites.includes(site.site_id)
              return (
                <div key={site.site_id} onClick={() => toggleSite(site.site_id)}
                  style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 150px 100px 120px 60px', padding: '14px 20px', borderBottom: '1px solid #F9FAFB', backgroundColor: selected ? '#EFF6FF' : '#fff', cursor: 'pointer', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{idx + 1}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{site.site_name}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{site.site_code || '-'}</span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{site.address || '-'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: bagColor(site.bag_status) }}>{site.current_bag_count}자루</span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{site.last_collected_at ? new Date(site.last_collected_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}</span>
                  <StatusDot status={site.bag_status} />
                </div>
              )
            })
          }
        </div>
      </div>

      {/* 모달 오버레이 */}
      {modalStep && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal() }}>

          {/* STEP 1: 폼 */}
          {modalStep === 'form' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '36px 32px', width: '400px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 700, color: '#111827' }}>수거 계획 생성</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#9CA3AF' }}>수거 계획 관리자를 입력하면 수거 관리 페이지에 추가됩니다.</p>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>수거 계획 관리자</label>
                <input value={planManagerName} onChange={e => setPlanManagerName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
              </div>
              <button onClick={handleCreatePlan} disabled={creating}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#fff', fontSize: '15px', color: '#374151', cursor: 'pointer', fontWeight: 500, opacity: creating ? 0.7 : 1 }}>
                {creating ? '생성 중...' : '수거 관리 시작'}
              </button>
            </div>
          )}

          {/* STEP 2: 완료 */}
          {modalStep === 'success' && (
            <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '36px 32px', width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0055FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>수거 계획 생성이 완료되었습니다.</h3>
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                <button onClick={() => { setModalStep(null); navigate('/dashboard/collections') }}
                  style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', backgroundColor: '#0055FF', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  수거 관리 바로가기
                </button>
                <button onClick={handleCloseModal}
                  style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#fff', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}