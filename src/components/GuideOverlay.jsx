// GuideOverlay.jsx — 지도 진입 시 인터랙션 가이드
import { useState, useEffect } from 'react'

const BUBBLES = [
  {
    id: 'summary',
    // 상단 중앙 — LOG THE NET 버튼 근처
    top: '18%', left: '45%',
    text: '버튼을 눌러\n수치 패널을 확인하세요',
    icon: '📊',
    arrowDir: 'left', // 말풍선 꼬리 방향
  },
  {
    id: 'factory',
    // 좌측 하단 — 집(공장) 근처
    top: '77%', left: '35%',
    text: '건물을 눌러\n공정 애니메이션을 확인하세요',
    icon: '🏭',
    arrowDir: 'left',
  },
  {
    id: 'site2',
    // 중앙 하단 집하장들
    top: '47%', left: '70%',
    text: '각 집하장에서\n수거 현황을 볼 수 있어요',
    icon: '🗺️',
    arrowDir: 'right',
    maxWidth: '170px',
  },
]

const arrowStyles = {
  right: {
    // 말풍선 오른쪽에 꼬리
    after: {
      position: 'absolute', right: '-10px', top: '50%',
      transform: 'translateY(-50%)',
      width: 0, height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderLeft: '10px solid rgba(255,255,255,0.55)',
    }
  },
  left: {
    after: {
      position: 'absolute', left: '-10px', top: '50%',
      transform: 'translateY(-50%)',
      width: 0, height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: '10px solid rgba(255,255,255,0.55)',
    }
  },
}

function Bubble({ bubble, index }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300 + index * 150)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div style={{
      position: 'absolute',
      top: bubble.top,
      left: bubble.left,
      transform: 'translate(-50%, -50%)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      zIndex: 20,
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px)',
        borderRadius: '14px',
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        maxWidth: bubble.maxWidth || '140px',
      }}>
        <div style={{ fontSize: '18px', marginBottom: '4px' }}>{bubble.icon}</div>
        <p style={{
          margin: 0,
          fontSize: '11.5px',
          fontWeight: 600,
          color: '#0F2D4A',
          lineHeight: '1.5',
          whiteSpace: 'pre-line',
          fontFamily: "'Pretendard', 'Inter', sans-serif",
        }}>{bubble.text}</p>
        {/* 말풍선 꼬리 */}
        <div style={{ ...arrowStyles[bubble.arrowDir].after }} />
      </div>
    </div>
  )
}

export default function GuideOverlay({ onDismiss }) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onDismiss, 350)
  }

  return (
    <div className="guide-overlay" style={{
      position: 'absolute', inset: 0, zIndex: 15,
      opacity: closing ? 0 : 1,
      transition: 'opacity 0.35s ease',
      pointerEvents: closing ? 'none' : 'auto',
    }}>
      {/* 반투명 딤 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10, 20, 40, 0.35)',
        backdropFilter: 'blur(2px)',
      }} />

      {/* 말풍선들 */}
      {BUBBLES.map((b, i) => <Bubble key={b.id} bubble={b} index={i} />)}

      {/* X 닫기 버튼 */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '60px', right: '20px',
          width: '40px', height: '40px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', color: '#fff', fontWeight: 400,
          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
          zIndex: 30,
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ✕
      </button>

      {/* 하단 안내 텍스트 */}
      <div style={{
        position: 'absolute',
        bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        background: '#214288',
        borderRadius: '20px',
        padding: '10px 20px',
        fontSize: '13px', fontWeight: 600, color: '#fff',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        fontFamily: "'Pretendard', 'Inter', sans-serif",
      }}>
        지도를 드래그하거나 확대·축소할 수 있어요!
      </div>
    </div>
  )
}