import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

function Stepper({ current }) {
  const steps = ['수거 정보', '보관 장소', '수거 완료']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 0 }}>
      {steps.map((label, idx) => {
        const num = idx + 1
        const done = num < current
        const active = num === current
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: active || done ? '#2563EB' : '#F3F4F6',
                color: active || done ? '#fff' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{
                fontSize: '12px', fontWeight: active ? 600 : 400,
                color: active ? '#2563EB' : done ? '#2563EB' : '#9CA3AF'
              }}>{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                width: '160px', height: '2px', marginBottom: '18px',
                backgroundColor: done ? '#2563EB' : '#F3F4F6'
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CollectionStep3Page() {
  const navigate = useNavigate()
  const { collectionId } = useParams()

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axiosInstance.get(`/dashboard/collection-records/${collectionId}`)
      .then(res => setRecord(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [collectionId])

  const handleComplete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await axiosInstance.patch(`/dashboard/collection-records/${collectionId}/status`, {
        status: 'completed'
      })
      await axiosInstance.patch(`/dashboard/collection-records/${collectionId}/status`, {
        status: 'stacked'
      })
      navigate('/dashboard/collections')
    } catch (e) {
      setError('수거 완료 처리에 실패했습니다')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9CA3AF' }}>불러오는 중...</span>
    </div>
  )

  // 렉별 보관 요약 텍스트
  const rackSummary = record?.sites?.flatMap(s => s.racks || [])
    .reduce((acc, r) => {
      const existing = acc.find(a => a.rack_code === r.rack_code)
      if (existing) existing.bag_count += r.bag_count
      else acc.push({ ...r })
      return acc
    }, [])
    .map(r => `${r.rack_code} 구역 : ${r.bag_count}자루`)
    .join(' · ') || '-'

  const totalBags = record?.sites?.reduce((sum, s) => sum + (s.actual_bag_count || s.bag_count || 0), 0) || 0
  const totalWeight = record?.total_weight_kg
  const siteName = record?.sites?.map(s => s.site_name).join(', ') || '-'
  const collectedAt = record?.collected_at
    ? new Date(record.collected_at).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    : '-'

  const rowStyle = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 0',
    borderBottom: '1px solid #E5E7EB'
  }
  const labelStyle = { fontSize: '14px', color: '#6B7280' }
  const valueStyle = { fontSize: '14px', fontWeight: 600, color: '#111827' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>

      {/* 헤더 */}
      <div style={{
        backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span style={{ fontSize: '16px' }}>📍</span>
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>수거 정보 입력</span>
      </div>

      <div style={{ flex: 1, maxWidth: '720px', width: '100%', margin: '0 auto', padding: '0 24px 120px' }}>

        <Stepper current={3} />

        {/* 완료 아이콘 + 타이틀 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
            수거 정보 확인 및 등록
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#9CA3AF' }}>
            아래 내용을 확인하고 수거를 완료하세요.
          </p>
        </div>

        {/* 확인 카드 */}
        <div style={{
          backgroundColor: '#EFF6FF', borderRadius: '16px',
          border: '1px solid #BFDBFE', padding: '0 24px'
        }}>
          <div style={{ ...rowStyle }}>
            <span style={labelStyle}>집하장</span>
            <span style={valueStyle}>{siteName}</span>
          </div>
          <div style={{ ...rowStyle }}>
            <span style={labelStyle}>총 자루 수</span>
            <span style={valueStyle}>{totalBags}자루</span>
          </div>
          <div style={{ ...rowStyle }}>
            <span style={labelStyle}>계근 무게</span>
            <span style={valueStyle}>{totalWeight ? `${totalWeight} kg` : '-'}</span>
          </div>
          <div style={{ ...rowStyle }}>
            <span style={labelStyle}>구역 별 보관</span>
            <span style={{ ...valueStyle, textAlign: 'right', maxWidth: '60%' }}>{rackSummary}</span>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={labelStyle}>일시</span>
            <span style={valueStyle}>{collectedAt}</span>
          </div>
        </div>

        {error && (
          <p style={{
            color: '#EF4444', fontSize: '13px', textAlign: 'center',
            marginTop: '16px', padding: '12px',
            backgroundColor: '#FEF2F2', borderRadius: '8px'
          }}>{error}</p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTop: '1px solid #F3F4F6',
        padding: '16px 24px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', zIndex: 10
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px', borderRadius: '10px',
            border: '1px solid #E5E7EB', backgroundColor: '#fff',
            fontSize: '14px', color: '#6B7280', cursor: 'pointer'
          }}
        >← 이전</button>

        <button
          onClick={handleComplete}
          disabled={submitting}
          style={{
            padding: '12px 28px', borderRadius: '10px', border: 'none',
            backgroundColor: '#2563EB', color: '#fff',
            fontSize: '14px', fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? '처리 중...' : '수거 완료'}
        </button>
      </div>
    </div>
  )
}