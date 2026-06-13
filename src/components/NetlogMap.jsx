import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import './NetlogMap.css'

function useAnimatedProgress(active, duration = 2500) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!active) { setProgress(0); return }
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, duration])
  return progress
}

function DateRangePicker({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(2026)
  const [viewMonth, setViewMonth] = useState(4)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const fmt = (d) => d ? `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.` : '날짜 선택'
  const handleDayClick = (day) => {
    const date = new Date(viewYear, viewMonth, day)
    if (!startDate || (startDate && endDate)) onChange(date, null)
    else { if (date < startDate) onChange(date, startDate); else onChange(startDate, date); setOpen(false) }
  }
  const isInRange = (day) => { if (!startDate || !endDate) return false; const d = new Date(viewYear, viewMonth, day); return d > startDate && d < endDate }
  const isStart = (day) => startDate && new Date(viewYear, viewMonth, day).toDateString() === startDate.toDateString()
  const isEnd   = (day) => endDate   && new Date(viewYear, viewMonth, day).toDateString() === endDate.toDateString()
  const mn = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="date-badge" onClick={() => setOpen(o => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(15,45,74,0.5)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{fmt(startDate)}</span><span style={{ color:'rgba(15,45,74,0.3)' }}>–</span><span>{fmt(endDate)}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(15,45,74,0.5)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      {open && (
        <div className="calendar-dropdown">
          <div className="calendar-nav">
            <button onClick={() => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1) }}>‹</button>
            <span>{viewYear}년 {mn[viewMonth]}</span>
            <button onClick={() => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1) }}>›</button>
          </div>
          <div className="calendar-hint">{!startDate||(startDate&&endDate)?'시작일 선택':'종료일 선택'}</div>
          <div className="calendar-grid">
            {['일','월','화','수','목','금','토'].map(d=><div key={d} className="cal-header">{d}</div>)}
            {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
            {Array(daysInMonth).fill(null).map((_,i)=>{
              const day=i+1,s=isStart(day),e=isEnd(day),r=isInRange(day)
              return <div key={day} onClick={()=>handleDayClick(day)} className={`cal-day${s?' cal-start':''}${e?' cal-end':''}${r?' cal-range':''}`}>{day}</div>
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const CarSVG = ({ filled }) => {
  const [hovered, setHovered] = useState(false)
  const col = filled ? (hovered ? '#FF6A6D' : '#F8A09B') : 'rgba(15,45,74,0.1)'
  return (
    <svg className={`car-icon${filled?' filled':''}`} width="30" height="18" viewBox="0 0 30 18"
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <path d="M4 10h22M4 10L7 4h16l3 6M4 10v4M26 10v4M4 14H2v-2M26 14h2v-2M4 14h22"
        stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="8.5" cy="14" r="2" fill={col}/>
      <circle cx="21.5" cy="14" r="2" fill={col}/>
    </svg>
  )
}

const BatterySVG = ({ pct, flash }) => (
  <div style={{ position:'relative', width:'48px', height:'22px' }} className={flash?'battery-flash':''}>
    <svg width="48" height="22" viewBox="0 0 48 22">
      <rect x="1" y="3" width="40" height="16" rx="3" stroke="rgba(15,45,74,0.35)" strokeWidth="1.5" fill="none"/>
      <rect x="41" y="7.5" width="5" height="7" rx="1.5" fill="rgba(15,45,74,0.35)"/>
      <rect x="3" y="5" width={Math.round(36*pct/100)} height="12" rx="2"
        fill={pct>60?'#47D26A':pct>30?'#6EC99A':'#D25A46'}/>
    </svg>
    {pct>=100&&(
      <svg style={{position:'absolute',top:2,left:14}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )}
  </div>
)

const TreeSVG = ({ filled, popped }) => (
  <svg className={`tree-icon${popped?' popped':''}`} width="20" height="24" viewBox="0 0 20 24" fill="none">
    <polygon points="10,1 19,12 1,12" fill={filled?'#94BE64':'rgba(15,45,74,0.12)'}/>
    <polygon points="10,7 18,16 2,16" fill={filled?'#759F00':'rgba(15,45,74,0.08)'}/>
    <rect x="8" y="16" width="4" height="7" rx="1.2" fill={filled?'#0F4C6B':'rgba(15,45,74,0.10)'}/>
  </svg>
)

const BIG_NUM = (color='#0F2D4A') => ({ color, fontSize:'48px', fontWeight:800, lineHeight:'1', letterSpacing:'-0.03em' })
const MED_NUM = (color='#0F2D4A') => ({ color, fontSize:'38px', fontWeight:800, lineHeight:'1', letterSpacing:'-0.03em' })
const LABEL = { color:'rgba(15,45,74,0.60)', fontSize:'16px', fontWeight:500, letterSpacing:'0.01em', display:'flex', alignItems:'center', gap:'5px' }
const UNIT  = { color:'rgba(15,45,74,0.45)', fontSize:'16px', fontWeight:400 }
const SUB   = { color:'rgba(15,45,74,0.45)', fontSize:'12px' }

function SummaryPanel({ visible, onClose }) {
  const [startDate, setStartDate] = useState(new Date(2026,4,6))
  const [endDate,   setEndDate]   = useState(new Date(2026,5,6))
  const p = useAnimatedProgress(visible, 2500)

  const waste  = Math.round(p*1250)
  const co2    = Math.round(p*3400)
  const charge = Math.round(p*450000)
  const pine   = Math.round(p*12)
  const batt   = Math.round(p*100)
  const cars   = Math.round(p*8)
  const trees  = Math.round(p*12)

  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (batt>=100&&visible) { setFlash(true); const t=setTimeout(()=>setFlash(false),700); return ()=>clearTimeout(t) }
  }, [batt, visible])

  return (
    <div id="ui-panel-summary" className={`ui-panel${visible?'':' hidden'}`}>
      <div className="panel-body">
        <div className="date-section">
          <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s,e)=>{setStartDate(s);setEndDate(e)}}/>
        </div>
        <div className="stat-card">
          <div style={LABEL}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0055A0" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>
            누적 폐어망 수거량
          </div>
          <div className="stat-value-group">
            <span style={BIG_NUM('#0F2D4A')}>{waste.toLocaleString()}</span>
            <span style={UNIT}>kg</span>
          </div>
          <div style={{ height:'8px', backgroundColor:'rgba(0,85,160,0.12)', borderRadius:'4px', overflow:'hidden' }}>
            <div style={{ height:'100%', backgroundColor:'#0055A0', borderRadius:'4px', width:`${p*100}%` }}/>
          </div>
          <div style={SUB}>마지막 수거일: 2026년 6월 1일</div>
        </div>
        <div className="stat-card">
          <div style={LABEL}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6A6D" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            누적 이산화탄소 감축량
          </div>
          <div className="stat-value-group">
            <span style={BIG_NUM('#0F2D4A')}>{co2.toLocaleString()}</span>
            <span style={UNIT}>kg</span>
          </div>
          <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'5px' }}>
            {Array(8).fill(null).map((_,i)=><CarSVG key={i} filled={i<cars}/>)}
          </div>
          <div style={{ ...SUB, color:'#0F2D4A', fontWeight:600 }}>소형차 {cars}대 분량 탄소 감축</div>
        </div>
        <div className="stat-card">
          <div style={LABEL}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#47D26A" strokeWidth="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            누적 스마트폰 완충 횟수
          </div>
          <div className="stat-value-group">
            <span style={MED_NUM('#0F2D4A')}>{charge.toLocaleString()}</span>
            <span style={UNIT}>회</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'5px' }}>
            <BatterySVG pct={batt} flash={flash}/>
            <div style={{ flex:1, height:'8px', backgroundColor:'rgba(76,175,125,0.15)', borderRadius:'4px', overflow:'hidden' }}>
              <div style={{ height:'100%', backgroundColor:'#47D26A', width:`${p*100}%`, borderRadius:'4px' }}/>
            </div>
            <span style={{ fontSize:'14px', color:'#47D26A', fontWeight:800 }}>{batt}%</span>
          </div>
        </div>
        <div className="stat-card">
          <div style={LABEL}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F4C6B" strokeWidth="2.5"><path d="M12 22V12"/><path d="M12 12 8 8M12 12l4-4"/><line x1="5" y1="20" x2="19" y2="20"/></svg>
            소나무 1그루 흡수 기간
          </div>
          <div className="stat-value-group">
            <span style={BIG_NUM('#0F2D4A')}>{pine}</span>
            <span style={UNIT}>개월</span>
          </div>
          <div style={{ display:'flex', gap:'3px', flexWrap:'wrap', marginTop:'5px' }}>
            {Array(12).fill(null).map((_,i)=><TreeSVG key={i} filled={i<trees} popped={i<trees}/>)}
          </div>
          <div style={{ ...SUB, color:'#0F4C6B', fontWeight:600 }}>소나무 {trees}그루 1년 흡수량</div>
        </div>
      </div>
      <button className="close-button" onClick={onClose}>닫기</button>
    </div>
  )
}

function MinrakPanel({ visible, onClose }) {
  return (
    <div id="ui-panel-minrak" className={`ui-panel${visible?'':' hidden'}`}>
      <div className="panel-header">
        <img src="https://placehold.co/350x140" alt="민락항"/>
        <div className="badge-port">민락항</div>
      </div>
      <div className="panel-body">
        <div className="stat-card">
          <div style={LABEL}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#47D26A" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>
            누적 수거량
          </div>
          <div className="stat-value-group">
            <span style={BIG_NUM('#0F2D4A')}>1,250</span>
            <span style={UNIT}>kg</span>
          </div>
          <div style={SUB}>마지막 수거일: 2026년 6월 1일</div>
        </div>
        <div className="env-title">환경지표</div>
        <div className="stat-card">
          <div style={LABEL}>이산화탄소 감축량</div>
          <div className="stat-value-group">
            <span style={MED_NUM('#0F2D4A')}>3,400</span>
            <span style={UNIT}>kg</span>
          </div>
        </div>
        <div className="stat-card">
          <div style={LABEL}>스마트폰 완충 횟수</div>
          <div className="stat-value-group">
            <span style={MED_NUM('#0F2D4A')}>450,000</span>
            <span style={UNIT}>회</span>
          </div>
        </div>
      </div>
      <button className="close-button" onClick={onClose}>닫기</button>
    </div>
  )
}

export default function NetlogMap() {
  const canvasRef = useRef(null)
  const [minrakVisible,  setMinrakVisible]  = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)

  // 원본 JS 코드와 동일한 변수들을 ref로 노출
  const yoActionRef        = useRef(null)
  const cube43ActionRef    = useRef(null)
  const isYoForwardRef     = useRef(true)
  const isColorToggledRef  = useRef(false)

  // 원본 JS의 닫기 버튼 로직과 완전히 동일
  const handleSummaryClose = () => {
    if (yoActionRef.current && yoActionRef.current.timeScale > 0) {
      yoActionRef.current.paused = false
      yoActionRef.current.timeScale = -1
      yoActionRef.current.play()
      isYoForwardRef.current = true
    }
    if (cube43ActionRef.current && !cube43ActionRef.current.isRunning()) {
      cube43ActionRef.current.reset().play()
    }
    isColorToggledRef.current = false
    setSummaryVisible(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const TARGET_ASPECT = 1170/2532
    const BLENDER_ORTHO_SCALE = 1.510
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false})
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    let camera, mixer
    const clock = new THREE.Clock()
    let shipAction, storageAction
    let armature001Action, armature002Action, armature003Action, armature004Action
    let facAction, textAction
    let facTimeout=null, uiTimeout=null, summaryTimeout=null
    let isFacPlaying = false
    let zoomLevel=1, panOffset={x:0,y:0}, baseRenderWidth=0, baseRenderHeight=0

    const emissionColors = [
      {name:'sea',      mat:null, base:new THREE.Color('#57B5C5'), target:new THREE.Color('#000000')},
      {name:'blue',     mat:null, base:new THREE.Color('#417DDA'), target:new THREE.Color('#317238')},
      {name:'blue_er',  mat:null, base:new THREE.Color('#5C8CEF'), target:new THREE.Color('#4A9A51')},
      {name:'blue_est', mat:null, base:new THREE.Color('#8EB5FF'), target:new THREE.Color('#71BB6A')},
      {name:'letter',   mat:null, base:new THREE.Color('#3F3F3F'), target:new THREE.Color('#C7C9CC')},
    ]
    const dynamicLights = {
      'lightpath_1':{mat:null, base:new THREE.Color(), target:new THREE.Color(), highlight:new THREE.Color('#FFEC77'), timeout:null},
      'lightpath_2':{mat:null, base:new THREE.Color(), target:new THREE.Color(), highlight:new THREE.Color('#FFEC77'), timeout:null},
      'lightpath_3':{mat:null, base:new THREE.Color(), target:new THREE.Color(), highlight:new THREE.Color('#FFEC77'), timeout:null},
      'lightpath_4':{mat:null, base:new THREE.Color(), target:new THREE.Color(), highlight:new THREE.Color('#FFEC77'), timeout:null},
    }

    const triggerLight = (n) => {
      const l = dynamicLights[n]
      if (l?.mat) {
        l.target.copy(l.highlight)
        if (l.timeout) clearTimeout(l.timeout)
        l.timeout = setTimeout(() => l.target.copy(l.base), 1000)
      }
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let clickStartPos={x:0,y:0}, isDragging=false, previousPointer={x:0,y:0}, previousPinchDistance=null
    const MAX_ZOOM = 4

    function updateCameraView() {
      if (!camera?.isOrthographicCamera) return
      const zw = baseRenderWidth/zoomLevel, zh = baseRenderHeight/zoomLevel
      panOffset.x = THREE.MathUtils.clamp(panOffset.x, -(baseRenderWidth-zw)/2, (baseRenderWidth-zw)/2)
      panOffset.y = THREE.MathUtils.clamp(panOffset.y, -(baseRenderHeight-zh)/2, (baseRenderHeight-zh)/2)
      camera.left=-zw/2+panOffset.x; camera.right=zw/2+panOffset.x
      camera.top=zh/2+panOffset.y; camera.bottom=-zh/2+panOffset.y
      camera.updateProjectionMatrix()
    }

    function calculateBaseBounds() {
      const w=window.innerWidth, h=window.innerHeight, sa=w/h
      renderer.setSize(w, h)
      const bw=BLENDER_ORTHO_SCALE, bh=BLENDER_ORTHO_SCALE/TARGET_ASPECT
      if (sa>TARGET_ASPECT) { baseRenderWidth=bw; baseRenderHeight=bw/sa }
      else { baseRenderHeight=bh; baseRenderWidth=bh*sa }
      updateCameraView()
    }

    function checkIntersection(cx, cy) {
      if (!camera || !mixer || isFacPlaying) return
      pointer.x = (cx/window.innerWidth)*2-1
      pointer.y = -(cy/window.innerHeight)*2+1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(scene.children, true)
      if (!hits.length) return

      const shipT   = ['Cylinder025','Cylinder025_1','Cylinder_025','Cylinder_025_1']
      const storT   = ['storage001','Cube004','storage_2']
      const cubeT   = ['Cube011_3']
      const a1T     = ['storage003','Cube008_1','Cube008']
      const a2T     = ['Cube039_1','Cube039_2','Cube039']
      const a3T     = ['Cube041_2','storage007','Cube041_1']
      const a4T     = ['Cube043_1','Cube043_3','Cube043_2']

      const hit = hits.find(i => [...shipT,...storT,...cubeT,...a1T,...a2T,...a3T,...a4T].includes(i.object.name))
      if (!hit) return

      if (uiTimeout) clearTimeout(uiTimeout)
      if (summaryTimeout) clearTimeout(summaryTimeout)

      if (shipT.includes(hit.object.name)) {
        shipAction?.reset().play()
      }
      else if (storT.includes(hit.object.name)) {
        storageAction?.reset().play()
        triggerLight('lightpath_3')
        uiTimeout = setTimeout(() => setMinrakVisible(true), 1200)
      }
      else if (cubeT.includes(hit.object.name)) {
        // 원본 JS와 동일: 패널 닫고 cube43 + yo 재생 + 색상 토글
        setSummaryVisible(false)
        if (cube43ActionRef.current && !cube43ActionRef.current.isRunning()) cube43ActionRef.current.reset().play()
        if (yoActionRef.current) {
          yoActionRef.current.paused = false
          yoActionRef.current.timeScale = isYoForwardRef.current ? 1 : -1
          yoActionRef.current.play()
          isYoForwardRef.current = !isYoForwardRef.current
        }
        isColorToggledRef.current = !isColorToggledRef.current
      }
      else if (a2T.includes(hit.object.name)) {
        armature002Action?.reset().play()
        triggerLight('lightpath_1')
        uiTimeout = setTimeout(() => setMinrakVisible(true), 1200)
      }
      else if (a1T.includes(hit.object.name)) {
        armature001Action?.reset().play()
        triggerLight('lightpath_4')
        uiTimeout = setTimeout(() => setMinrakVisible(true), 1200)
      }
      else if (a3T.includes(hit.object.name)) {
        armature003Action?.reset().play()
        triggerLight('lightpath_2')
        uiTimeout = setTimeout(() => setMinrakVisible(true), 1200)
      }
      else if (a4T.includes(hit.object.name)) {
        armature004Action?.reset().play()
        if (facAction) {
          if (facTimeout) clearTimeout(facTimeout)
          facTimeout = setTimeout(() => {
            isFacPlaying = true
            facAction.reset().play()
            textAction?.reset().play()
          }, 1000)
        }
      }
    }

    const applyPanDelta = (dx, dy) => {
      panOffset.x -= (dx/window.innerWidth) * (baseRenderWidth/zoomLevel)
      panOffset.y += (dy/window.innerHeight) * (baseRenderHeight/zoomLevel)
      updateCameraView()
    }

    const onMouseDown = (e) => { if (e.target.closest('.ui-panel,.calendar-dropdown')) return; isDragging=true; previousPointer={x:e.clientX,y:e.clientY}; clickStartPos={x:e.clientX,y:e.clientY} }
    const onMouseMove = (e) => { if (!isDragging) return; applyPanDelta(e.clientX-previousPointer.x, e.clientY-previousPointer.y); previousPointer={x:e.clientX,y:e.clientY} }
    const onMouseUp   = (e) => { isDragging=false; if (e.target.closest('.ui-panel,.calendar-dropdown')) return; if (Math.hypot(e.clientX-clickStartPos.x, e.clientY-clickStartPos.y)<5) checkIntersection(e.clientX, e.clientY) }
    const onWheel     = (e) => { if (e.target.closest('.ui-panel')) return; zoomLevel=THREE.MathUtils.clamp(zoomLevel-e.deltaY*0.002, 1, MAX_ZOOM); updateCameraView() }
    const onTouchStart = (e) => { if (e.target.closest('.ui-panel')) return; if (e.touches.length===1){isDragging=true;previousPointer={x:e.touches[0].clientX,y:e.touches[0].clientY};clickStartPos={x:e.touches[0].clientX,y:e.touches[0].clientY}}else if(e.touches.length===2){isDragging=false;previousPinchDistance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)} }
    const onTouchMove  = (e) => { if (e.target.closest('.ui-panel')) return; e.preventDefault(); if(isDragging&&e.touches.length===1){applyPanDelta(e.touches[0].clientX-previousPointer.x,e.touches[0].clientY-previousPointer.y);previousPointer={x:e.touches[0].clientX,y:e.touches[0].clientY}}else if(e.touches.length===2&&previousPinchDistance){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);zoomLevel=THREE.MathUtils.clamp(zoomLevel+(d-previousPinchDistance)*0.01,1,MAX_ZOOM);updateCameraView();previousPinchDistance=d} }
    const onTouchEnd   = (e) => { isDragging=false; previousPinchDistance=null; if(e.target.closest('.ui-panel'))return; if(e.cancelable)e.preventDefault(); if(e.changedTouches.length===1){const t=e.changedTouches[0];if(Math.hypot(t.clientX-clickStartPos.x,t.clientY-clickStartPos.y)<15)checkIntersection(t.clientX,t.clientY)} }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('mouseleave', () => isDragging=false)
    window.addEventListener('wheel',      onWheel,      {passive:false})
    window.addEventListener('touchstart', onTouchStart, {passive:false})
    window.addEventListener('touchmove',  onTouchMove,  {passive:false})
    window.addEventListener('touchend',   onTouchEnd,   {passive:false})
    window.addEventListener('resize',     calculateBaseBounds)

    new GLTFLoader().load('/models/netlog_nla_netspa_text.glb', (gltf) => {
      scene.add(gltf.scene)
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach(m => {
            const n = m.name.split('.')[0]
            const cfg = emissionColors.find(c => c.name===n)
            if (cfg) { cfg.mat=m; cfg.mat.emissive.copy(cfg.base) }
            if (dynamicLights[n]) { dynamicLights[n].mat=m; dynamicLights[n].base.copy(m.emissive); dynamicLights[n].target.copy(m.emissive) }
          })
        }
      })

      camera = gltf.cameras?.[0]
      if (!camera) { console.error('카메라 없음'); return }

      mixer = new THREE.AnimationMixer(gltf.scene)

      // 원본 JS와 동일한 finished 이벤트
      mixer.addEventListener('finished', (e) => {
        if (e.action === yoActionRef.current && yoActionRef.current.timeScale > 0) {
          summaryTimeout = setTimeout(() => setSummaryVisible(true), 150)
        }
        if (e.action === facAction) isFacPlaying = false
      })

      const BLENDER_FPS = 24
      const clips = gltf.animations
      const loadClip = (name, sub) => {
        const clip = THREE.AnimationClip.findByName(clips, name)
        if (!clip) return null
        const action = mixer.clipAction(sub ? THREE.AnimationUtils.subclip(clip, name, ...sub, BLENDER_FPS) : clip)
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        return action
      }

      shipAction            = loadClip('Empty.002Action', ['ship_action_1_60', 1, 130])
      storageAction         = loadClip('ArmatureAction')
      cube43ActionRef.current = loadClip('Cube.043Action')
      yoActionRef.current     = loadClip('yo')
      armature002Action     = loadClip('ArmatureAction.002')
      armature001Action     = loadClip('ArmatureAction.001')
      armature003Action     = loadClip('ArmatureAction.003')
      armature004Action     = loadClip('ArmatureAction.004')
      facAction             = loadClip('fac')
      textAction            = loadClip('text')

      camera.updateMatrixWorld()
      calculateBaseBounds()
    })

    let animFrameId
    const animate = () => {
      animFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      mixer?.update(delta)
      const ls = 4.0 * delta
      // isColorToggledRef.current 사용 — 원본 JS의 isColorToggled와 동일
      emissionColors.forEach(c => { if (c.mat) c.mat.emissive.lerp(isColorToggledRef.current ? c.target : c.base, ls) })
      Object.values(dynamicLights).forEach(l => { if (l.mat) l.mat.emissive.lerp(l.target, ls) })
      if (camera) renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animFrameId)
      ;[facTimeout, uiTimeout, summaryTimeout].forEach(t => t && clearTimeout(t))
      window.removeEventListener('mousedown',  onMouseDown)
      window.removeEventListener('mousemove',  onMouseMove)
      window.removeEventListener('mouseup',    onMouseUp)
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('resize',     calculateBaseBounds)
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'fixed',top:0,left:0,backgroundColor:'#fff'}}>
      <canvas ref={canvasRef} id="webgl-canvas"/>
      <MinrakPanel  visible={minrakVisible}  onClose={() => setMinrakVisible(false)}/>
      <SummaryPanel visible={summaryVisible} onClose={handleSummaryClose}/>
    </div>
  )
}