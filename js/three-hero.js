/* G Connect Solutions — Hero "signal network" visual
   A sphere of points connected by short-range links, slowly rotating,
   with a few arcs pulsing outward — a literal read of "G Connect". */

window.GCHero = (function () {
  let renderer, scene, camera, points, lines, pulses = [];
  let raf;
  let mounted = false;
  let resizeObs = null;
  let moveHandler = null;

  function build(canvas) {
    const isSmall = window.innerWidth < 760;
    const pointCount = isSmall ? 220 : 520;
    const radius = 3.2;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // ---- node cloud on a fibonacci sphere ----
    const positions = new Float32Array(pointCount * 3);
    const nodeVecs = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < pointCount; i++) {
      const y = 1 - (i / (pointCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const v = new THREE.Vector3(x, y, z).multiplyScalar(radius);
      nodeVecs.push(v);
      positions[i * 3] = v.x; positions[i * 3 + 1] = v.y; positions[i * 3 + 2] = v.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xE8A33D, size: isSmall ? 0.035 : 0.028, transparent: true, opacity: 0.85,
      sizeAttenuation: true
    });
    points = new THREE.Points(geo, mat);
    scene.add(points);

    // ---- short-range connective lines (network look) ----
    const linePositions = [];
    const maxDist = isSmall ? 0.85 : 0.62;
    const maxLinksPerNode = 3;
    for (let i = 0; i < nodeVecs.length; i++) {
      let links = 0;
      for (let j = i + 1; j < nodeVecs.length && links < maxLinksPerNode; j++) {
        if (nodeVecs[i].distanceTo(nodeVecs[j]) < maxDist) {
          linePositions.push(nodeVecs[i].x, nodeVecs[i].y, nodeVecs[i].z, nodeVecs[j].x, nodeVecs[j].y, nodeVecs[j].z);
          links++;
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xF3EEE1, transparent: true, opacity: 0.08 });
    lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ---- a handful of "signal" arc pulses (coral) ----
    const pulseGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xE85A3B });
    const pulseCount = isSmall ? 3 : 6;
    for (let i = 0; i < pulseCount; i++) {
      const m = new THREE.Mesh(pulseGeo, pulseMat.clone());
      const idx = Math.floor(Math.random() * nodeVecs.length);
      m.position.copy(nodeVecs[idx]);
      m.userData.phase = Math.random() * Math.PI * 2;
      scene.add(m);
      pulses.push(m);
    }

    return { group: new THREE.Group() };
  }

  let mouseX = 0, mouseY = 0;
  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }

  function animate(t) {
    raf = requestAnimationFrame(animate);
    if (!points) return;
    const time = t * 0.001;
    points.rotation.y = time * 0.05 + mouseX * 0.3;
    points.rotation.x = mouseY * 0.2;
    lines.rotation.y = points.rotation.y;
    lines.rotation.x = points.rotation.x;

    pulses.forEach((p, i) => {
      const s = 1 + Math.sin(time * 1.6 + p.userData.phase) * 0.6;
      p.scale.setScalar(Math.max(0.3, s));
      p.material.opacity = 0.4 + Math.sin(time * 1.6 + p.userData.phase) * 0.4;
      p.rotation.y = points.rotation.y;
    });
    pulses.forEach(p => { p.material.transparent = true; });

    renderer.render(scene, camera);
  }

  function onResize(canvas) {
    if (!renderer || !camera) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function mount(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === 'undefined') return;
    if (mounted) unmount();
    build(canvas);
    moveHandler = onMouseMove;
    window.addEventListener('mousemove', moveHandler);
    resizeObs = new ResizeObserver(() => onResize(canvas));
    resizeObs.observe(canvas);
    mounted = true;
    animate(0);
    requestAnimationFrame(() => canvas.classList.add('ready'));
  }

  function unmount() {
    if (raf) cancelAnimationFrame(raf);
    if (moveHandler) { window.removeEventListener('mousemove', moveHandler); moveHandler = null; }
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
    if (renderer) { renderer.dispose(); }
    if (points) { points.geometry.dispose(); points.material.dispose(); }
    if (lines) { lines.geometry.dispose(); lines.material.dispose(); }
    pulses = [];
    mounted = false;
  }

  return { mount, unmount };
})();
