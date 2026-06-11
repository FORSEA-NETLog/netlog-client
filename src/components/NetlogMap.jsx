import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import './NetlogMap.css'

export default function NetlogMap() {
  const canvasRef = useRef(null)
  const minrakRef = useRef(null)
  const summaryRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const minrakPanel = minrakRef.current
    const summaryPanel = summaryRef.current

    const TARGET_ASPECT = 1170 / 2532
    const BLENDER_ORTHO_SCALE = 1.510

    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    let camera
    const clock = new THREE.Clock()
    let mixer
    let shipAction, storageAction, cube43Action, yoAction
    let armature001Action, armature002Action, armature003Action, armature004Action
    let facAction
    let textAction
    let facTimeout = null
    let isFacPlaying = false
    let isYoForward = true
    let isColorToggled = false

    let uiTimeout = null
    let summaryTimeout = null

    const closeBtns = [minrakPanel, summaryPanel]
      .map(p => p?.querySelector('.close-button'))
      .filter(Boolean)

    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const panel = e.target.closest('.ui-panel')
        if (panel) {
          panel.classList.add('hidden')
          if (panel.id === 'ui-panel-summary') {
            if (yoAction && yoAction.timeScale > 0) {
              yoAction.paused = false
              yoAction.timeScale = -1
              yoAction.play()
              isYoForward = true
            }
            if (cube43Action && !cube43Action.isRunning()) cube43Action.reset().play()
            isColorToggled = false
          }
        }
        if (uiTimeout) { clearTimeout(uiTimeout); uiTimeout = null }
        if (summaryTimeout) { clearTimeout(summaryTimeout); summaryTimeout = null }
      })
    })

    const emissionColors = [
      { name: 'sea',      mat: null, base: new THREE.Color('#57B5C5'), target: new THREE.Color('#000000') },
      { name: 'blue',     mat: null, base: new THREE.Color('#417DDA'), target: new THREE.Color('#317238') },
      { name: 'blue_er',  mat: null, base: new THREE.Color('#5C8CEF'), target: new THREE.Color('#4A9A51') },
      { name: 'blue_est', mat: null, base: new THREE.Color('#8EB5FF'), target: new THREE.Color('#71BB6A') },
      { name: 'letter',   mat: null, base: new THREE.Color('#3F3F3F'), target: new THREE.Color('#C7C9CC') }
    ]

    const dynamicLights = {
      'lightpath_1': { mat: null, base: new THREE.Color(), target: new THREE.Color(), highlight: new THREE.Color('#FFEC77'), timeout: null },
      'lightpath_2': { mat: null, base: new THREE.Color(), target: new THREE.Color(), highlight: new THREE.Color('#FFEC77'), timeout: null },
      'lightpath_3': { mat: null, base: new THREE.Color(), target: new THREE.Color(), highlight: new THREE.Color('#FFEC77'), timeout: null },
      'lightpath_4': { mat: null, base: new THREE.Color(), target: new THREE.Color(), highlight: new THREE.Color('#FFEC77'), timeout: null }
    }

    function triggerLight(lightName) {
      const light = dynamicLights[lightName]
      if (light && light.mat) {
        light.target.copy(light.highlight)
        if (light.timeout) clearTimeout(light.timeout)
        light.timeout = setTimeout(() => light.target.copy(light.base), 1000)
      }
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let clickStartPos = { x: 0, y: 0 }
    let zoomLevel = 1
    const MAX_ZOOM = 4
    let panOffset = { x: 0, y: 0 }
    let baseRenderWidth = 0
    let baseRenderHeight = 0

    function updateCameraView() {
      if (!camera || !camera.isOrthographicCamera) return
      const zoomedWidth = baseRenderWidth / zoomLevel
      const zoomedHeight = baseRenderHeight / zoomLevel
      const maxPanX = Math.max(0, (baseRenderWidth - zoomedWidth) / 2)
      const maxPanY = Math.max(0, (baseRenderHeight - zoomedHeight) / 2)
      panOffset.x = THREE.MathUtils.clamp(panOffset.x, -maxPanX, maxPanX)
      panOffset.y = THREE.MathUtils.clamp(panOffset.y, -maxPanY, maxPanY)
      camera.left   = -zoomedWidth  / 2 + panOffset.x
      camera.right  =  zoomedWidth  / 2 + panOffset.x
      camera.top    =  zoomedHeight / 2 + panOffset.y
      camera.bottom = -zoomedHeight / 2 + panOffset.y
      camera.updateProjectionMatrix()
    }

    function calculateBaseBounds() {
      const width = window.innerWidth
      const height = window.innerHeight
      const screenAspect = width / height
      renderer.setSize(width, height)
      const baseWidth = BLENDER_ORTHO_SCALE
      const baseHeight = BLENDER_ORTHO_SCALE / TARGET_ASPECT
      if (screenAspect > TARGET_ASPECT) {
        baseRenderWidth = baseWidth
        baseRenderHeight = baseWidth / screenAspect
      } else {
        baseRenderHeight = baseHeight
        baseRenderWidth = baseHeight * screenAspect
      }
      updateCameraView()
    }

    function checkIntersection(clientX, clientY) {
      if (!camera || !mixer) return
      if (isFacPlaying) return

      pointer.x =  (clientX / window.innerWidth)  * 2 - 1
      pointer.y = -(clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)

      if (intersects.length > 0) {
        const shipTargets    = ['Cylinder025', 'Cylinder025_1', 'Cylinder_025', 'Cylinder_025_1']
        const storageTargets = ['storage001', 'Cube004', 'storage_2']
        const cubeTargets    = ['Cube011_3']
        const arm001Targets  = ['storage003', 'Cube008_1', 'Cube008']
        const arm002Targets  = ['Cube039_1', 'Cube039_2', 'Cube039']
        const arm003Targets  = ['Cube041_2', 'storage007', 'Cube041_1']
        const arm004Targets  = ['Cube043_1', 'Cube043_3', 'Cube043_2']

        const hit = intersects.find(i =>
          [...shipTargets, ...storageTargets, ...cubeTargets,
           ...arm001Targets, ...arm002Targets, ...arm003Targets, ...arm004Targets]
          .includes(i.object.name)
        )

        if (hit) {
          if (uiTimeout) clearTimeout(uiTimeout)
          if (summaryTimeout) clearTimeout(summaryTimeout)

          if (shipTargets.includes(hit.object.name)) {
            shipAction?.reset().play()
          } else if (storageTargets.includes(hit.object.name)) {
            storageAction?.reset().play()
            triggerLight('lightpath_3')
            uiTimeout = setTimeout(() => minrakPanel?.classList.remove('hidden'), 1200)
          } else if (cubeTargets.includes(hit.object.name)) {
            if (summaryPanel && !summaryPanel.classList.contains('hidden'))
              summaryPanel.classList.add('hidden')
            if (cube43Action && !cube43Action.isRunning()) cube43Action.reset().play()
            if (yoAction) {
              yoAction.paused = false
              yoAction.timeScale = isYoForward ? 1 : -1
              yoAction.play()
              isYoForward = !isYoForward
            }
            isColorToggled = !isColorToggled
          } else if (arm002Targets.includes(hit.object.name)) {
            armature002Action?.reset().play()
            triggerLight('lightpath_1')
            uiTimeout = setTimeout(() => minrakPanel?.classList.remove('hidden'), 1200)
          } else if (arm001Targets.includes(hit.object.name)) {
            armature001Action?.reset().play()
            triggerLight('lightpath_4')
            uiTimeout = setTimeout(() => minrakPanel?.classList.remove('hidden'), 1200)
          } else if (arm003Targets.includes(hit.object.name)) {
            armature003Action?.reset().play()
            triggerLight('lightpath_2')
            uiTimeout = setTimeout(() => minrakPanel?.classList.remove('hidden'), 1200)
          } else if (arm004Targets.includes(hit.object.name)) {
            armature004Action?.reset().play()
            if (facAction) {
              if (facTimeout) clearTimeout(facTimeout)
              facTimeout = setTimeout(() => {
                isFacPlaying = true
                facAction.reset().play()
                if (textAction) textAction.reset().play()  // ← 추가
              }, 1000)
            }
          }
        }
      }
    }

    let isDragging = false
    let previousPointer = { x: 0, y: 0 }
    let previousPinchDistance = null

    function applyPanDelta(deltaX, deltaY) {
      const zoomedWidth  = baseRenderWidth  / zoomLevel
      const zoomedHeight = baseRenderHeight / zoomLevel
      panOffset.x -= (deltaX / window.innerWidth)  * zoomedWidth
      panOffset.y += (deltaY / window.innerHeight) * zoomedHeight
      updateCameraView()
    }

    const onMouseDown = (e) => {
      if (e.target.closest('.ui-panel')) return
      isDragging = true
      previousPointer = { x: e.clientX, y: e.clientY }
      clickStartPos = { x: e.clientX, y: e.clientY }
    }
    const onMouseMove = (e) => {
      if (!isDragging) return
      applyPanDelta(e.clientX - previousPointer.x, e.clientY - previousPointer.y)
      previousPointer = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = (e) => {
      isDragging = false
      if (e.target.closest('.ui-panel')) return
      if (Math.hypot(e.clientX - clickStartPos.x, e.clientY - clickStartPos.y) < 5)
        checkIntersection(e.clientX, e.clientY)
    }
    const onWheel = (e) => {
      if (e.target.closest('.ui-panel')) return
      zoomLevel -= e.deltaY * 0.002
      zoomLevel = THREE.MathUtils.clamp(zoomLevel, 1, MAX_ZOOM)
      updateCameraView()
    }
    const onTouchStart = (e) => {
      if (e.target.closest('.ui-panel')) return
      if (e.touches.length === 1) {
        isDragging = true
        previousPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        clickStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      } else if (e.touches.length === 2) {
        isDragging = false
        previousPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      }
    }
    const onTouchMove = (e) => {
      if (e.target.closest('.ui-panel')) return
      e.preventDefault()
      if (isDragging && e.touches.length === 1) {
        applyPanDelta(e.touches[0].clientX - previousPointer.x, e.touches[0].clientY - previousPointer.y)
        previousPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      } else if (e.touches.length === 2 && previousPinchDistance) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
        zoomLevel += (d - previousPinchDistance) * 0.01
        zoomLevel = THREE.MathUtils.clamp(zoomLevel, 1, MAX_ZOOM)
        updateCameraView()
        previousPinchDistance = d
      }
    }
    const onTouchEnd = (e) => {
      isDragging = false
      previousPinchDistance = null
      if (e.target.closest('.ui-panel')) return
      if (e.cancelable) e.preventDefault()
      if (e.changedTouches.length === 1) {
        const t = e.changedTouches[0]
        if (Math.hypot(t.clientX - clickStartPos.x, t.clientY - clickStartPos.y) < 15)
          checkIntersection(t.clientX, t.clientY)
      }
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseleave', () => isDragging = false)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: false })
    window.addEventListener('resize', calculateBaseBounds)

    const loader = new GLTFLoader()
    loader.load('/models/netlog_nla_netspa_text.glb', (gltf) => {
      scene.add(gltf.scene)

      gltf.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((m) => {
            const pureName = m.name.split('.')[0]
            const config = emissionColors.find(c => c.name === pureName)
            if (config) { config.mat = m; config.mat.emissive.copy(config.base) }
            if (dynamicLights[pureName]) {
              dynamicLights[pureName].mat = m
              dynamicLights[pureName].base.copy(m.emissive)
              dynamicLights[pureName].target.copy(m.emissive)
            }
          })
        }
      })

      camera = gltf.cameras?.[0]
      if (!camera) { console.error('카메라 없음'); return }

      mixer = new THREE.AnimationMixer(gltf.scene)

      mixer.addEventListener('finished', (e) => {
        if (e.action === yoAction && yoAction.timeScale > 0) {
          summaryTimeout = setTimeout(() => summaryPanel?.classList.remove('hidden'), 150)
        }
        if (e.action === facAction) {
          isFacPlaying = false
        }
      })

      const BLENDER_FPS = 24
      const clips = gltf.animations

      const loadClip = (name, subclip) => {
        const clip = THREE.AnimationClip.findByName(clips, name)
        if (!clip) return null
        const action = mixer.clipAction(subclip
          ? THREE.AnimationUtils.subclip(clip, name, ...subclip, BLENDER_FPS)
          : clip)
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        return action
      }

      shipAction        = loadClip('Empty.002Action', ['ship', 1, 130])
      storageAction     = loadClip('ArmatureAction')
      cube43Action      = loadClip('Cube.043Action')
      yoAction          = loadClip('yo')
      armature002Action = loadClip('ArmatureAction.002')
      armature001Action = loadClip('ArmatureAction.001')
      armature003Action = loadClip('ArmatureAction.003')
      armature004Action = loadClip('ArmatureAction.004')
      facAction         = loadClip('fac')
      textAction        = loadClip('text')  // 추가

      camera.updateMatrixWorld()
      calculateBaseBounds()
    })

    let animFrameId
    function animate() {
      animFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      mixer?.update(delta)

      const lerpSpeed = 4.0 * delta
      emissionColors.forEach(c => {
        if (c.mat) c.mat.emissive.lerp(isColorToggled ? c.target : c.base, lerpSpeed)
      })
      Object.values(dynamicLights).forEach(l => {
        if (l.mat) l.mat.emissive.lerp(l.target, lerpSpeed)
      })

      if (camera) renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animFrameId)
      if (facTimeout) clearTimeout(facTimeout)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', calculateBaseBounds)
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#ffffff'
      }}>
      <canvas ref={canvasRef} id="webgl-canvas" />

      <div ref={minrakRef} id="ui-panel-minrak" className="ui-panel hidden">
        <div className="panel-header">
          <img src="https://placehold.co/344x192" alt="민락항 배경" />
          <div className="badge-port">민락항</div>
        </div>
        <div className="panel-body">
          <div className="stat-card">
            <div className="stat-title">누적 수거량</div>
            <div className="stat-value-group">
              <span className="stat-number primary-color">1,250</span>
              <span className="stat-unit">kg</span>
            </div>
            <div className="stat-date">마지막 수거일: 2026년 6월 1일</div>
          </div>
          <div className="env-section">
            <div className="env-title">환경지표</div>
            <div className="stat-card">
              <div className="stat-title">이산화탄소 감축량</div>
              <div className="stat-value-group">
                <span className="stat-number dark-color">3,400</span>
                <span className="stat-unit">kg</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">스마트폰 완충 횟수</div>
              <div className="stat-value-group">
                <span className="stat-number dark-color">450,000</span>
                <span className="stat-unit">회</span>
              </div>
            </div>
          </div>
        </div>
        <button className="close-button">닫기</button>
      </div>

      <div ref={summaryRef} id="ui-panel-summary" className="ui-panel hidden">
        <div className="panel-body">
          <div className="date-section">
            <div className="date-badge">
              <div className="date-icon"></div>
              <span>2026년 5월 6일 - 2026년 6월 6일</span>
              <div className="date-icon"></div>
            </div>
          </div>
          <div className="stat-cards-wrapper">
            <div className="stat-card">
              <div className="stat-title">누적 폐어망 수거량</div>
              <div className="stat-value-group">
                <span className="stat-number dark-color">1,250</span>
                <span className="stat-unit">kg</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">누적 이산화탄소 감축량</div>
              <div className="stat-value-group">
                <span className="stat-number dark-color">3,400</span>
                <span className="stat-unit">kg</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">누적 스마트폰 완충 횟수</div>
              <div className="stat-value-group">
                <span className="stat-number dark-color">450,000</span>
                <span className="stat-unit">회</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-title">소나무 1그루가 흡수하는 데 걸리는 기간</div>
              <div className="stat-value-group">
                <span className="stat-number dark-color">12</span>
                <span className="stat-unit">개월</span>
              </div>
            </div>
          </div>
        </div>
        <button className="close-button">닫기</button>
      </div>
    </div>
  )
}