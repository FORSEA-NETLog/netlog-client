import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

// ── 아이콘 ──
const IconMain = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const IconTruck = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconWarehouse = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconProcess = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IconLayers = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
)

const NAV_ITEMS = [
  { path: '/dashboard',             icon: IconMain,      label: '메인'     },
  { path: '/dashboard/collections', icon: IconTruck,     label: '수거관리'  },
  { path: '/dashboard/storage',     icon: IconWarehouse, label: '보관현황'  },
  { path: '/dashboard/processing',  icon: IconProcess,   label: '공정투입'  },
  { path: '/dashboard/status',      icon: IconLayers,    label: '공정현황'  },
]

function Sidebar({ currentPath, onLogout }) {
  const navigate = useNavigate()
  const isMobile = window.innerWidth < 768
  if (isMobile) return null

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: '56px', backgroundColor: '#fff',
      borderRight: '1px solid #F3F4F6',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '16px 0',
      zIndex: 20
    }}>
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = currentPath.startsWith(path) && (path !== '/dashboard' || currentPath === '/dashboard')
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            style={{
              width: '40px', height: '40px',
              borderRadius: '10px', border: 'none',
              backgroundColor: active ? '#EFF6FF' : 'transparent',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: '4px'
            }}
          >
            <Icon active={active} />
          </button>
        )
      })}
      <div style={{ flex: 1 }} />
      <button
        onClick={onLogout}
        title="로그아웃"
        style={{
          width: '40px', height: '40px', borderRadius: '10px',
          border: 'none', backgroundColor: 'transparent',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#9CA3AF', fontSize: '11px'
        }}
      >
        나가기
      </button>
    </aside>
  )
}

function BottomNav({ currentPath }) {
  const navigate = useNavigate()
  const isMobile = window.innerWidth < 768

  if (!isMobile) return null  // ← 768px 이상이면 아예 렌더 안 함

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: '#fff', borderTop: '1px solid #F3F4F6',
      display: 'flex', zIndex: 20
    }}>
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = currentPath.startsWith(path) && (path !== '/dashboard' || currentPath === '/dashboard')
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0', border: 'none',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: active ? '#2563EB' : '#9CA3AF',
              fontSize: '10px', gap: '3px'
            }}
          >
            <Icon active={active} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function SummaryCard({ label, value, unit, diff, diffLabel, diffUp }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: '16px',
      border: '1px solid #F3F4F6', padding: '20px',
      flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px'
    }}>
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
  return (
    <span style={{
      display: 'inline-block', width: '10px', height: '10px',
      borderRadius: '50%', backgroundColor: color
    }} />
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const [summary, setSummary] = useState(null)
  const [sites, setSites] = useState([])
  const [selectedSites, setSelectedSites] = useState([])
  const [loading, setLoading] = useState(true)

  const managerName = localStorage.getItem('manager_name') || '관리자'

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('manager_id')
    localStorage.removeItem('manager_name')
    localStorage.removeItem('manager_role')
    navigate('/dashboard/login')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, sitesRes] = await Promise.all([
          axiosInstance.get('/dashboard/main/summary'),
          axiosInstance.get('/dashboard/main/sites')
        ])
        setSummary(summaryRes.data.data)
        setSites(sitesRes.data.data.items)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const toggleSite = (siteId) => {
    setSelectedSites(prev =>
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    )
  }

  const handleCreatePlan = async () => {
    if (selectedSites.length === 0) return
    try {
      const managerId = localStorage.getItem('manager_id')
      await axiosInstance.post('/dashboard/collection-records', {
        manager_id: managerId,
        planned_at: new Date().toISOString(),
        site_ids: selectedSites
      })
      navigate('/dashboard/collections')
    } catch (e) {
      console.error(e)
      alert('수거 계획 생성에 실패했습니다')
    }
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  })

  const bagColor = (status) =>
    status === 'red' ? '#EF4444' : status === 'yellow' ? '#F59E0B' : '#10B981'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <Sidebar currentPath={currentPath} onLogout={handleLogout} />

      {/* 메인 컨텐츠 */}
      <div style={{ 
        marginLeft: window.innerWidth >= 768 ? '56px' : '0',
        paddingBottom: window.innerWidth < 768 ? '80px' : '0'
      }}>

        {/* 헤더 */}
        <div style={{
          backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6',
          padding: '14px 24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconMain active={true} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>집하량 대시보드</span>
            <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{today}</span>
          </div>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{managerName}</span>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 요약 카드 */}
          {loading ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  flex: 1, height: '110px', backgroundColor: '#fff',
                  borderRadius: '16px', border: '1px solid #F3F4F6'
                }} />
              ))}
            </div>
          ) : summary && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <SummaryCard
                label="총 대기 자루"
                value={summary.total_bag_count?.toLocaleString()}
                unit=""
                diff={summary.total_bag_count_diff}
                diffLabel="자루"
                diffUp={(summary.total_bag_count_diff ?? 0) > 0}
              />
              <SummaryCard
                label="수거 필요 집하장"
                value={summary.urgent_site_count}
                unit="곳"
                diff={null}
                diffLabel=""
                diffUp={false}
              />
              <SummaryCard
                label="이번 주 수거량"
                value={summary.this_month_weight_kg?.toLocaleString()}
                unit="kg"
                diff={summary.this_month_weight_kg_diff}
                diffLabel="kg"
                diffUp={(summary.this_month_weight_kg_diff ?? 0) > 0}
              />
            </div>
          )}

          {/* 집하장별 현황 */}
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px',
            border: '1px solid #F3F4F6', overflow: 'hidden'
          }}>
            {/* 섹션 헤더 */}
            <div style={{
              padding: '16px 20px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #F9FAFB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏠</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>집하장 별 현황</span>
              </div>
              <button
                onClick={handleCreatePlan}
                disabled={selectedSites.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                  backgroundColor: selectedSites.length > 0 ? '#2563EB' : '#F3F4F6',
                  color: selectedSites.length > 0 ? '#fff' : '#9CA3AF',
                  fontSize: '13px', fontWeight: 600, cursor: selectedSites.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                ↻ 수거 계획 생성
              </button>
            </div>

            {/* 안내 */}
            <div style={{
              padding: '10px 20px', backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #FEF3C7',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span style={{ color: '#F59E0B', fontSize: '13px' }}>⚠</span>
              <span style={{ fontSize: '12px', color: '#92400E' }}>수거할 집하장을 탭하여 선택하세요.</span>
            </div>

            {/* 테이블 헤더 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 150px 100px 120px 60px',
              padding: '10px 20px',
              borderBottom: '1px solid #F3F4F6',
              backgroundColor: '#F9FAFB'
            }}>
              {['#', '집하장명', 'ID', '위치', '대기량', '최근수거일', '상태'].map(h => (
                <span key={h} style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>{h}</span>
              ))}
            </div>

            {/* 테이블 바디 */}
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{
                  height: '52px', borderBottom: '1px solid #F9FAFB',
                  backgroundColor: '#fff'
                }} />
              ))
            ) : sites.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
                집하장 데이터가 없습니다.
              </div>
            ) : sites.map((site, idx) => {
              const selected = selectedSites.includes(site.site_id)
              return (
                <div
                  key={site.site_id}
                  onClick={() => toggleSite(site.site_id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 150px 100px 120px 60px',
                    padding: '14px 20px',
                    borderBottom: '1px solid #F9FAFB',
                    backgroundColor: selected ? '#EFF6FF' : '#fff',
                    cursor: 'pointer',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{idx + 1}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{site.site_name}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{site.site_code || '-'}</span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{site.address || '-'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: bagColor(site.bag_status) }}>
                    {site.current_bag_count}자루
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    {site.last_collected_at
                      ? new Date(site.last_collected_at).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: '2-digit', day: '2-digit'
                        })
                      : '-'}
                  </span>
                  <StatusDot status={site.bag_status} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav currentPath={currentPath} />
    </div>
  )
}