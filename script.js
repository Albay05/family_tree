// --- VERİ MODELİ VE SEÇİM DURUMLARI ---
let myTree = new FamilyTree(); 
let selectedNodes = new Set(); // Ctrl+Click ile çoklu seçimi tutacak set
let editingNodeId = null; // Eğer null değilse "Düzenleme" modundayız demektir

// --- EKRAN GEÇİŞLERİ ---
const introScreen = document.getElementById('intro-screen');
const treeContainer = document.getElementById('tree-container');
const btnNewTree = document.getElementById('btn-new-tree');
const btnLoadTree = document.getElementById('btn-load-tree');
const fileInput = document.getElementById('file-input');

btnNewTree.addEventListener('click', () => { introScreen.style.display = 'none'; treeContainer.style.display = 'block'; });
btnLoadTree.addEventListener('click', () => { fileInput.click(); });
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) { introScreen.style.display = 'none'; treeContainer.style.display = 'block'; }
});

// --- SONSUZ DÜZLEM (PAN & ZOOM) ---
const canvas = document.getElementById('tree-canvas');
let scale = 1, panning = false, pointX = 0, pointY = 0, startX = 0, startY = 0;

treeContainer.addEventListener('mousedown', function(e) {
    // Sadece boşluğa tıklandıysa kaydırma başlasın
    if(!e.target.closest('.person-card') && !e.target.closest('.action-btn')) {
        e.preventDefault(); startX = e.clientX - pointX; startY = e.clientY - pointY; panning = true;
    }
});
window.addEventListener('mouseup', () => { panning = false; });
treeContainer.addEventListener('mousemove', function(e) {
    if (!panning) return; pointX = (e.clientX - startX); pointY = (e.clientY - startY); updateTransform();
});
treeContainer.addEventListener('wheel', function(e) {
    e.preventDefault();
    const xs = (e.clientX - pointX) / scale, ys = (e.clientY - pointY) / scale;
    const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
    (delta > 0) ? (scale *= 1.1) : (scale /= 1.1);
    pointX = e.clientX - xs * scale; pointY = e.clientY - ys * scale;
    updateTransform();
}, { passive: false });

function updateTransform() { canvas.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`; }

// DÜZLEME (BOŞLUĞA) TIKLANINCA SEÇİMİ KALDIRMA
treeContainer.addEventListener('click', (e) => {
    if(!e.target.closest('.person-card')) {
        document.querySelectorAll('.person-card').forEach(c => c.classList.remove('selected'));
        selectedNodes.clear();
    }
});


// --- MODAL VE VERİ GİRİŞİ ---
const btnAddFirst = document.getElementById('btn-add-first');
const nodeModal = document.getElementById('node-modal');
const modalTitle = document.getElementById('modal-title');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSaveModal = document.getElementById('btn-save-modal');
const mFname = document.getElementById('m-fname'), mLname = document.getElementById('m-lname');
const mBdate = document.getElementById('m-bdate'), mDdate = document.getElementById('m-ddate');
const mBplace = document.getElementById('m-bplace'), mNote = document.getElementById('m-note');

let currentRelation = { targetId: null, type: 'first' };

btnAddFirst.onclick = function() {
    editingNodeId = null; currentRelation = { targetId: null, type: 'first' };
    modalTitle.innerText = "Kişi Bilgileri"; clearModalFields(); nodeModal.classList.remove('hidden');
};

btnCancelModal.onclick = function() { nodeModal.classList.add('hidden'); clearModalFields(); };

function clearModalFields() { mFname.value = ''; mLname.value = ''; mBdate.value = ''; mDdate.value = ''; mBplace.value = ''; mNote.value = ''; }

// DÜZENLEME (EDİT) MODALINI AÇMA (Global fonksiyon)
window.openEditModal = function(e, id) {
    e.stopPropagation(); // Tıklamanın kart seçimine gitmesini engelle
    editingNodeId = id;
    const person = myTree.nodes[id];
    mFname.value = person.firstName; mLname.value = person.lastName;
    mBdate.value = person.birthDate; mDdate.value = person.deathDate;
    mBplace.value = person.birthPlace; mNote.value = person.note;
    
    modalTitle.innerText = "Kişiyi Düzenle";
    nodeModal.classList.remove('hidden');
};

// YENİ İLİŞKİ MODALINI AÇMA
window.openRelationModal = function(e, relationType, targetId) {
    e.stopPropagation();
    editingNodeId = null; currentRelation = { targetId: targetId, type: relationType };
    modalTitle.innerText = "Yeni Akraba Ekle"; clearModalFields();
    nodeModal.classList.remove('hidden');
};

// KAYDET & GÜNCELLE BUTONU
btnSaveModal.addEventListener('click', () => {
    if (mFname.value.trim() === '') { alert("İsim alanı zorunludur!"); return; }

    // Eğer Düzenleme Modundaysak sadece veriyi güncelleyip HTML'i yeniliyoruz
    if (editingNodeId) {
        const p = myTree.nodes[editingNodeId];
        p.firstName = mFname.value; p.lastName = mLname.value;
        p.birthDate = mBdate.value; p.deathDate = mDdate.value;
        p.birthPlace = mBplace.value; p.note = mNote.value;
        
        // Kart içeriğini yenile
        document.getElementById(editingNodeId).innerHTML = getCardInnerHtml(p);
        
        nodeModal.classList.add('hidden');
        editingNodeId = null;
        return; 
    }

    // Yeni Kayıt Modu
    const uniqueId = 'node-' + Date.now();
    const newPerson = new PersonNode(uniqueId, mFname.value, mLname.value, mBdate.value, mDdate.value, mBplace.value, mNote.value);
    myTree.addNode(newPerson);

    let startX = (window.innerWidth / 2) - 90;
    let startY = (window.innerHeight / 2) - 60;

    if (currentRelation.type !== 'first' && currentRelation.targetId) {
        const targetElement = document.getElementById(currentRelation.targetId);
        const targetX = parseInt(targetElement.style.left);
        const targetY = parseInt(targetElement.style.top);

        if (currentRelation.type === 'parent') { myTree.addConnection(uniqueId, currentRelation.targetId); startX = targetX; startY = targetY - 180; } 
        else if (currentRelation.type === 'child') { myTree.addConnection(currentRelation.targetId, uniqueId); startX = targetX; startY = targetY + 180; } 
        else if (currentRelation.type === 'partner') { myTree.addPartner(currentRelation.targetId, uniqueId); startX = targetX + 220; startY = targetY; }
        
        // Çizgiyi ortalayarak çiz (Kart genişliği 180px, yarısı 90. Yüksekliği ortalama 120, yarısı 60)
        drawLine(targetX + 90, targetY + 60, startX + 90, startY + 60);
    }

    renderPersonCard(newPerson, startX, startY);

    if (currentRelation.type === 'first') { btnAddFirst.style.display = 'none'; }
    nodeModal.classList.add('hidden');
    clearModalFields();
});

// --- KART HTML İÇERİĞİ OLUŞTURUCU ---
function getCardInnerHtml(person) {
    const birthYear = person.birthDate ? person.birthDate.split('-')[0] : '?';
    const deathYear = person.deathDate ? person.deathDate.split('-')[0] : '';
    const dateText = (person.birthDate || person.deathDate) ? `${birthYear} - ${deathYear}` : '';
    
    // Sadece not varsa Tooltip (i) ikonunu göster
    const infoHtml = person.note ? `
        <div class="info-wrapper">i
            <div class="note-tooltip">${person.note}</div>
        </div>
    ` : '<div></div>';

    return `
        <div class="card-header">
            ${infoHtml}
            <span class="edit-icon" onclick="openEditModal(event, '${person.id}')" title="Düzenle">✏️</span>
        </div>
        <h3>${person.firstName} ${person.lastName}</h3>
        <p>${dateText}</p>
        <p><i>${person.birthPlace}</i></p>
        <div class="node-actions">
            <button class="action-btn" onclick="openRelationModal(event, 'parent', '${person.id}')">Ebeveyn</button>
            <button class="action-btn" onclick="openRelationModal(event, 'partner', '${person.id}')">Eş</button>
            <button class="action-btn" onclick="openRelationModal(event, 'child', '${person.id}')">Çocuk</button>
        </div>
    `;
}

// --- DÜĞÜM ÇİZDİRME VE SEÇİM (SELECTION) OLAYLARI ---
function renderPersonCard(person, x, y) {
    const card = document.createElement('div');
    card.classList.add('person-card');
    card.id = person.id;
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.innerHTML = getCardInnerHtml(person);

    // Pan (sürükleme) işlemini kartın üzerinde iptal et
    card.addEventListener('mousedown', (e) => e.stopPropagation());
    
    // TIKLAMA İLE SEÇİM (Ctrl kombinasyonu ile)
    card.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey) {
            // Çoklu Seçim
            if (selectedNodes.has(person.id)) {
                selectedNodes.delete(person.id);
                card.classList.remove('selected');
            } else {
                selectedNodes.add(person.id);
                card.classList.add('selected');
            }
        } else {
            // Tekli Seçim (Diğerlerini temizle)
            document.querySelectorAll('.person-card').forEach(c => c.classList.remove('selected'));
            selectedNodes.clear();
            selectedNodes.add(person.id);
            card.classList.add('selected');
        }
    });

    document.getElementById('tree-canvas').appendChild(card);
}

// --- ÇİZGİ ÇİZME (SVG) ---
const svgEdges = document.getElementById('tree-edges');
function drawLine(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const pathData = `M ${x1} ${y1} C ${x1} ${(y1+y2)/2}, ${x2} ${(y1+y2)/2}, ${x2} ${y2}`;
    line.setAttribute("d", pathData);
    line.classList.add("tree-line");
    svgEdges.appendChild(line);
}

// --- ANA EKRANA DÖNME VE SIFIRLAMA ---
document.getElementById('btn-back').addEventListener('click', () => {
    if (Object.keys(myTree.nodes).length > 0 && !confirm("Kaydedilmemiş verileri kaybedebilirsiniz. Çıkmak istiyor musunuz?")) return;
    myTree = new FamilyTree();
    document.getElementById('tree-canvas').innerHTML = '<svg id="tree-edges"></svg>'; // Sadece SVG'yi bırak
    btnAddFirst.style.display = 'inline-block';
    selectedNodes.clear(); pointX = 0; pointY = 0; scale = 1; updateTransform();
    treeContainer.style.display = 'none'; introScreen.style.display = 'flex';
});

// JSON İNDİRME
document.getElementById('btn-export').addEventListener('click', () => {
    if (Object.keys(myTree.nodes).length === 0) { alert("Ağaç boş!"); return; }
    myTree.exportToJsonFile();
});