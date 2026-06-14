// GuideOverlay.jsx — 지도 진입 시 인터랙션 가이드
import { useState, useEffect } from 'react'
import panelIcon from '../assets/panel.png'
import facIcon from '../assets/fac.png'
import siteIcon from '../assets/site.png'

const BUBBLES = [
  {
    id: 'summary',
    // 상단 중앙 — LOG THE NET 버튼 근처 (iPhone 14 Pro: 393x852 기준)
    top: '153px', left: '192px',
    text: '버튼을 눌러\n 수거에 대한 수치 패널을\n 확인하세요',
    icon: panelIcon,
    arrowDir: 'left', // 말풍선 꼬리 방향
  },
  {
    id: 'factory',
    // 좌측 하단 — 집(공장) 근처
    top: '714px', left: '156px',
    text: '건물을 눌러\n공정 애니메이션을 확인하세요',
    icon: facIcon,
    arrowDir: 'left',
  },
  {
    id: 'site2',
    // 중앙 하단 집하장들
    top: '438px', left: '292px',
    text: '각 집하장에서\n수거 현황을 볼 수 있어요',
    icon: siteIcon,
    arrowDir: 'right',
    width: '170px',
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
        width: bubble.width || '170px',
      }}>
        <img src={bubble.icon} alt="" width="28" height="28" style={{ display: 'block', marginBottom: '4px' }} />
        <p style={{
          margin: 0,
          fontSize: '12px',
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
          top: '48px', right: '20px',
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
      <div className="guide-bottom-hint" style={{
        position: 'absolute',
        bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '13px', fontWeight: 600, color: '#fff',
        whiteSpace: 'nowrap',
        letterSpacing: '0.2px',
        fontFamily: "'Pretendard', 'Inter', sans-serif",
      }}>
        <span className="guide-bottom-hint__icon">👆</span>
        지도를 드래그하거나 확대·축소할 수 있어요!
      </div>
    </div>
  )
}