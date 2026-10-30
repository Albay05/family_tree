// --- EKRAN GEÇİŞLERİ ---
const introScreen = document.getElementById('intro-screen');
const treeContainer = document.getElementById('tree-container');
const btnNewTree = document.getElementById('btn-new-tree');
const btnLoadTree = document.getElementById('btn-load-tree');
const fileInput = document.getElementById('file-input');

btnNewTree.addEventListener('click', () => {
    introScreen.style.display = 'none';
    treeContainer.style.display = 'block';
    // Burada yeni, boş bir FamilyTree objesi oluşturacağız (Aşama 1'deki kod)
});

btnLoadTree.addEventListener('click', () => {
    fileInput.click(); // Gizli input'u tetikler
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Burada dosyayı okuyup sisteme yükleyeceğiz (Aşama 2'deki kod)
        introScreen.style.display = 'none';
        treeContainer.style.display = 'block';
    }
});

// --- SONSUZ DÜZLEM (PAN & ZOOM) MOTORU ---
const canvas = document.getElementById('tree-canvas');

let scale = 1;
let panning = false;
let pointX = 0; // Canvas'ın X eksenindeki konumu
let pointY = 0; // Canvas'ın Y eksenindeki konumu
let startX = 0;
let startY = 0;

// Sürüklemeye başlama (Fareye basılı tutma)
treeContainer.addEventListener('mousedown', function(e) {
    e.preventDefault();
    startX = e.clientX - pointX;
    startY = e.clientY - pointY;
    panning = true;
});

// Sürüklemeyi bırakma
window.addEventListener('mouseup', function() {
    panning = false;
});

// Sürükleme (Fareyi hareket ettirme)
treeContainer.addEventListener('mousemove', function(e) {
    if (!panning) return;
    pointX = (e.clientX - startX);
    pointY = (e.clientY - startY);
    updateTransform();
});

// Yakınlaştırma / Uzaklaştırma (Fare tekerleği)
treeContainer.addEventListener('wheel', function(e) {
    e.preventDefault();
    
    // Farenin canvas üzerindeki mevcut koordinatlarını hesapla
    const xs = (e.clientX - pointX) / scale;
    const ys = (e.clientY - pointY) / scale;
    
    // Yön tespiti (Yukarı/Aşağı)
    const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
    
    // Zoom çarpanı
    (delta > 0) ? (scale *= 1.1) : (scale /= 1.1);
    
    // Canvasın yeni konumunu farenin olduğu yere doğru kaydır (Merkezleme)
    pointX = e.clientX - xs * scale;
    pointY = e.clientY - ys * scale;
    
    updateTransform();
}, { passive: false });

// DOM Manipülasyonu ile CSS güncelleyen fonksiyon
function updateTransform() {
    canvas.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}