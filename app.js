/**
 * 3D Geometrik Şekiller Galerisi
 * Modern Üç Boyutlu Şekil İnceleme ve Geçiş Uygulaması
 */

// ==========================================================
// 1. ŞEKİL VERİLERİ VE TANIMLARI
// ==========================================================
const SHAPES_DATA = [
  {
    id: 'cube',
    name: 'Küp',
    subtitle: 'Düzgün Altıyüzlü • 6 Yüz, 12 Ayrıt, 8 Köşe',
    createMesh: () => {
      const group = new THREE.Group();
      // Küp Geometrisi
      const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0);
      const material = createShapeMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Hat / Çizgi (Hafif Siyahımsı Ayrıtlar)
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = createEdgeMaterial();
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      group.add(edges);

      return group;
    }
  },
  {
    id: 'triangle',
    name: 'Üçgen',
    subtitle: '3 Boyutlu Üçgen Piramit (Dörtyüzlü) • 4 Yüz, 6 Ayrıt, 4 Köşe',
    createMesh: () => {
      const group = new THREE.Group();
      // 3 Boyutlu Üçgen (Üçgen Tabanlı Piramit - Her yüzü üçgen)
      const radius = 1.6;
      const height = 2.2;
      const geometry = new THREE.ConeGeometry(radius, height, 3);
      // Piramidin merkezini kütle merkezine doğru hafif dengeleyelim
      geometry.translate(0, -0.15, 0);

      const material = createShapeMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Hat / Çizgi (Ayrıtlar)
      const edgesGeometry = new THREE.EdgesGeometry(geometry, 15);
      const edgesMaterial = createEdgeMaterial();
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      group.add(edges);

      return group;
    }
  },
  {
    id: 'cylinder',
    name: 'Silindir',
    subtitle: 'Dairesel Silindir • 3 Yüz, 2 Eğri Ayrıt',
    createMesh: () => {
      const group = new THREE.Group();
      // Silindir Geometrisi
      const radius = 1.15;
      const height = 2.3;
      const segments = 48;
      const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
      const material = createShapeMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Çember hatları (Üst ve alt çemberler)
      const edgesGeometry = new THREE.EdgesGeometry(geometry, 25);
      const edgesMaterial = createEdgeMaterial();
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      group.add(edges);

      // Silindirin yan hatlarını belirginleştirmek için 4 düşey kılavuz çizgi
      const linePositions = [];
      const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      const halfH = height / 2;
      angles.forEach(ang => {
        const x = Math.cos(ang) * radius;
        const z = Math.sin(ang) * radius;
        linePositions.push(x, -halfH, z);
        linePositions.push(x, halfH, z);
      });
      const sideLinesGeo = new THREE.BufferGeometry();
      sideLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const sideLines = new THREE.LineSegments(sideLinesGeo, edgesMaterial);
      group.add(sideLines);

      return group;
    }
  },
  {
    id: 'rectangle',
    name: 'Dikdörtgen',
    subtitle: 'Dikdörtgenler Prizması • 6 Yüz, 12 Ayrıt, 8 Köşe',
    createMesh: () => {
      const group = new THREE.Group();
      // Dikdörtgenler Prizması Geometrisi (Farklı kenar uzunlukları)
      const geometry = new THREE.BoxGeometry(2.9, 1.6, 1.8);
      const material = createShapeMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Hat / Çizgi (Ayrıtlar)
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = createEdgeMaterial();
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      group.add(edges);

      return group;
    }
  }
];

// ==========================================================
// 2. MATERYAL FABRİKASI (GRİ GÖVDE & SİYAHIMSI AYRITLAR)
// ==========================================================
function createShapeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xb5bcc7,         // Şık, mat studio grisi
    roughness: 0.35,         // Işık kırılımlarını yumuşatır
    metalness: 0.12,         // Hafif metalik zenginlik
    flatShading: false,
    polygonOffset: true,
    polygonOffsetFactor: 1,  // Çizgilerin yüzeyle çakışıp kaybolmasını önler
    polygonOffsetUnits: 1
  });
}

function createEdgeMaterial() {
  return new THREE.LineBasicMaterial({
    color: 0x181a20,         // Hafif siyahımsı / antrasit koyu hat çizgisi
    linewidth: 2,
    transparent: true,
    opacity: 0.95
  });
}

// Zemin Kontak Gölgesi Dokusu Oluşturucu
function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 118);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.28)');
  gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.14)');
  gradient.addColorStop(0.65, 'rgba(15, 23, 42, 0.05)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ==========================================================
// 3. SAHNE VE THREE.JS KURULUMU
// ==========================================================
const canvas = document.getElementById('webglCanvas');
const sceneContainer = document.getElementById('sceneContainer');

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.8, 7.8);
camera.lookAt(0, 0.2, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

// ==========================================================
// 4. AYDINLATMA (STUDIO SHOWROOM LIGHTING)
// ==========================================================
// Yumuşak Çevre Işığı
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

// Ana Işık (Key Light)
const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
mainLight.position.set(5, 8, 5);
scene.add(mainLight);

// Dolgu Işığı (Fill Light)
const fillLight = new THREE.DirectionalLight(0xdce7f5, 0.45);
fillLight.position.set(-6, 3, -3);
scene.add(fillLight);

// Üst/Kenar Vurgu Işığı (Rim Light)
const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(0, -5, -4);
scene.add(rimLight);

// ==========================================================
// 5. ŞEKİL GRUPLARININ HAZIRLANMASI
// ==========================================================
const shapeContainers = [];
const shadowTexture = createShadowTexture();
const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
const shadowMat = new THREE.MeshBasicMaterial({
  map: shadowTexture,
  transparent: true,
  depthWrite: false
});

const BASE_Y = 0.25;

SHAPES_DATA.forEach((data, index) => {
  // Her şekil için bir taşıyıcı konteyner
  const container = new THREE.Group();

  // Şekil modeli
  const shapeGroup = data.createMesh();
  shapeGroup.position.set(0, 0, 0);

  // Başlangıç için estetik 3/4 izometrik vitrin açısı
  shapeGroup.rotation.set(0.38, -0.55, 0);
  container.add(shapeGroup);

  // Zemindeki yumuşak gölge
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -1.65;
  container.add(shadowMesh);

  // Konumlandırma: İlk şekil merkezde, diğerleri sağ tarafta gizli
  if (index === 0) {
    container.position.set(0, BASE_Y, 0);
    container.visible = true;
  } else {
    container.position.set(12, BASE_Y, 0);
    container.visible = false;
  }

  scene.add(container);

  shapeContainers.push({
    container: container,
    shapeGroup: shapeGroup,
    shadowMesh: shadowMesh
  });
});

// ==========================================================
// 6. UYGULAMA DURUMU (STATE)
// ==========================================================
let currentIndex = 0;
let isTransitioning = false;
let autoRotate = false;

// Mouse ile Döndürme Değişkenleri
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = { x: 0, y: 0 };
const DAMPING = 0.94; // Sürtünme / yumuşak durma katsayısı

// ==========================================================
// 7. UI ELEMANLARI
// ==========================================================
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shapeTitle = document.getElementById('shapeTitle');
const shapeSubtitle = document.getElementById('shapeSubtitle');
const counterBadge = document.getElementById('counterBadge');
const shapeTabs = document.querySelectorAll('.tab-item');
const autoRotateBtn = document.getElementById('autoRotateBtn');
const autoRotateText = document.getElementById('autoRotateText');
const resetRotationBtn = document.getElementById('resetRotationBtn');

// Okların görünürlüğünü güncelle
function updateNavButtons() {
  // En başta (Küp): Sola bakan ok yok
  if (currentIndex === 0) {
    prevBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
  }

  // En sonda (Dikdörtgen): Sağa bakan ok yok
  if (currentIndex === SHAPES_DATA.length - 1) {
    nextBtn.classList.add('hidden');
  } else {
    nextBtn.classList.remove('hidden');
  }

  // Başlık ve Bilgi Güncelleme
  const currentData = SHAPES_DATA[currentIndex];

  // Başlık animasyonlu değişim
  gsap.to([shapeTitle, shapeSubtitle], {
    opacity: 0,
    y: -8,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: () => {
      shapeTitle.textContent = currentData.name;
      shapeSubtitle.textContent = currentData.subtitle;
      counterBadge.textContent = `${currentIndex + 1} / ${SHAPES_DATA.length}`;

      gsap.fromTo(
        [shapeTitle, shapeSubtitle],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  });

  // Tab Göstergesi
  shapeTabs.forEach((tab, idx) => {
    if (idx === currentIndex) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// ==========================================================
// 8. ARABA OYUNLARI TARZI GEÇİŞ ANİMASYONU (GSAP)
// ==========================================================
function goToShape(targetIndex, direction = null) {
  if (isTransitioning || targetIndex === currentIndex) return;
  if (targetIndex < 0 || targetIndex >= SHAPES_DATA.length) return;

  isTransitioning = true;
  rotationVelocity = { x: 0, y: 0 };

  // Yönü belirle (1: sağa doğru yeni şekil / ileri, -1: sola doğru yeni şekil / geri)
  const dir = direction !== null ? direction : (targetIndex > currentIndex ? 1 : -1);

  const currentObj = shapeContainers[currentIndex];
  const targetObj = shapeContainers[targetIndex];

  targetObj.container.visible = true;

  // Başlangıç pozisyonu ve rotasyonu
  targetObj.container.position.x = dir * 10;
  targetObj.container.position.y = BASE_Y;
  targetObj.container.scale.set(0.65, 0.65, 0.65);
  // Hedef şekli güzel bir sunum açısına ayarla
  targetObj.shapeGroup.rotation.set(0.38, -0.55, 0);

  const duration = 0.7;
  const easeType = 'power3.out';

  // Mevcut şekil dışarı kayar (Car showroom slide-out)
  gsap.to(currentObj.container.position, {
    x: -dir * 10,
    duration: duration,
    ease: 'power3.inOut'
  });

  gsap.to(currentObj.container.scale, {
    x: 0.65,
    y: 0.65,
    z: 0.65,
    duration: duration,
    ease: 'power3.inOut',
    onComplete: () => {
      currentObj.container.visible = false;
    }
  });

  // Yeni şekil içeri kayar (Car showroom slide-in)
  gsap.to(targetObj.container.position, {
    x: 0,
    duration: duration,
    ease: easeType
  });

  gsap.to(targetObj.container.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: duration,
    ease: easeType,
    onComplete: () => {
      currentIndex = targetIndex;
      isTransitioning = false;
      updateNavButtons();
    }
  });

  // Butonları hemen güncelle
  currentIndex = targetIndex;
  updateNavButtons();
}

// ==========================================================
// 9. MOUSE VE ETKİLEŞİM KONTROLLERİ (360° İNCELEME)
// ==========================================================
// Sol tık ile sürükleme kontrolü
canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Sol tık
    isDragging = true;
    previousMousePosition = {
      x: e.clientX,
      y: e.clientY
    };
    rotationVelocity = { x: 0, y: 0 };
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging || isTransitioning) return;

  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  const activeShape = shapeContainers[currentIndex].shapeGroup;

  // Döndürme hızları (Yatay ve dikey eksen)
  const rotSpeed = 0.007;
  activeShape.rotation.y += deltaX * rotSpeed;
  activeShape.rotation.x += deltaY * rotSpeed;

  // Hızı kaydet (Atalet/damping için)
  rotationVelocity.x = deltaY * rotSpeed;
  rotationVelocity.y = deltaX * rotSpeed;

  previousMousePosition = {
    x: e.clientX,
    y: e.clientY
  };
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

// Dokunmatik Ekran Desteği (Mobil ve Tabletler)
let touchStartPos = { x: 0, y: 0 };
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    previousMousePosition = { ...touchStartPos };
    rotationVelocity = { x: 0, y: 0 };
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isDragging || isTransitioning || e.touches.length !== 1) return;

  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;

  const deltaX = currentX - previousMousePosition.x;
  const deltaY = currentY - previousMousePosition.y;

  const activeShape = shapeContainers[currentIndex].shapeGroup;
  const rotSpeed = 0.008;
  activeShape.rotation.y += deltaX * rotSpeed;
  activeShape.rotation.x += deltaY * rotSpeed;

  rotationVelocity.x = deltaY * rotSpeed;
  rotationVelocity.y = deltaX * rotSpeed;

  previousMousePosition = { x: currentX, y: currentY };
}, { passive: true });

window.addEventListener('touchend', () => {
  isDragging = false;
});

// Fare Tekerleği ile İnce Yakınlaşma / Uzaklaşma (Opsiyonel konfor)
window.addEventListener('wheel', (e) => {
  if (isTransitioning) return;
  const zoomDelta = e.deltaY * 0.002;
  camera.position.z = Math.min(Math.max(camera.position.z + zoomDelta, 4.5), 11);
}, { passive: true });

// ==========================================================
// 10. BUTON VE KLAVYE OLAY DİNLEYİCİLERİ
// ==========================================================
// Sağ Ok Butonu
nextBtn.addEventListener('click', () => {
  if (currentIndex < SHAPES_DATA.length - 1) {
    goToShape(currentIndex + 1, 1);
  }
});

// Sol Ok Butonu
prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    goToShape(currentIndex - 1, -1);
  }
});

// Alt Sekmeler / Noktalar
shapeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetIdx = parseInt(tab.dataset.index, 10);
    goToShape(targetIdx);
  });
});

// Klavye Yön Tuşları ile Geçiş
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' && currentIndex < SHAPES_DATA.length - 1) {
    goToShape(currentIndex + 1, 1);
  } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
    goToShape(currentIndex - 1, -1);
  }
});

// Görünüm Açısını Sıfırlama Butonu
resetRotationBtn.addEventListener('click', () => {
  const activeShape = shapeContainers[currentIndex].shapeGroup;
  rotationVelocity = { x: 0, y: 0 };
  gsap.to(activeShape.rotation, {
    x: 0.38,
    y: -0.55,
    z: 0,
    duration: 0.6,
    ease: 'power2.out'
  });
  gsap.to(camera.position, {
    x: 0,
    y: 0.8,
    z: 7.8,
    duration: 0.6,
    ease: 'power2.out'
  });
});

// Otomatik Döndürme Modu
autoRotateBtn.addEventListener('click', () => {
  autoRotate = !autoRotate;
  if (autoRotate) {
    autoRotateBtn.classList.add('active');
    autoRotateText.textContent = 'Döndürmeyi Durdur';
  } else {
    autoRotateBtn.classList.remove('active');
    autoRotateText.textContent = 'Otomatik Döndür';
  }
});

// Pencere Boyutu Değişimi
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ==========================================================
// 11. ANİMASYON DÖNGÜSÜ (RENDER LOOP)
// ==========================================================
function animate() {
  requestAnimationFrame(animate);

  const activeShape = shapeContainers[currentIndex].shapeGroup;

  // Kullanıcı mouse'u bıraktığında atalet ile yumuşak dönüş (damping)
  if (!isDragging && !isTransitioning) {
    if (autoRotate) {
      activeShape.rotation.y += 0.008;
    } else {
      activeShape.rotation.y += rotationVelocity.y;
      activeShape.rotation.x += rotationVelocity.x;

      rotationVelocity.x *= DAMPING;
      rotationVelocity.y *= DAMPING;

      // Sıfıra çok yaklaştığında durdur
      if (Math.abs(rotationVelocity.x) < 0.00005) rotationVelocity.x = 0;
      if (Math.abs(rotationVelocity.y) < 0.00005) rotationVelocity.y = 0;
    }
  }

  // Hafif zarafet: Nesnelerin havada süzülüyormuş gibi çok tatlı mikro nefes alması
  const time = Date.now() * 0.0015;
  if (!isTransitioning) {
    shapeContainers[currentIndex].container.position.y = BASE_Y + Math.sin(time) * 0.05;
  }

  renderer.render(scene, camera);
}

// Başlangıç durumunu ayarla ve başlat
updateNavButtons();
animate();
