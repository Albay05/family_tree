let myTree = new FamilyTree(); 
let selectedNodes = new Set();
let editingNodeId = null; 
let draggedNodes = []; 
let dropTargetId = null; 
let isDraggingNode = false;

// --- TEMA MANTIĞI ---
function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('.theme-toggle-input').forEach((cb) => { cb.checked = isDark; });
    try {
        localStorage.setItem('ft_theme', isDark ? 'dark' : 'light');
    } catch (e) {}
}
document.querySelectorAll('.theme-toggle-input').forEach((cb) => {
    cb.addEventListener('change', (e) => applyTheme(e.target.checked));
});

// Varsayılan olarak Koyu Mod (Dark Theme) aktif olarak başlat
let initialIsDark = true;
try {
    const savedTheme = localStorage.getItem('ft_theme');
    if (savedTheme) {
        initialIsDark = (savedTheme === 'dark');
    }
} catch (e) {}
applyTheme(initialIsDark);

// --- EKRAN GEÇİŞLERİ ---
const introScreen = document.getElementById('intro-screen');
const treeContainer = document.getElementById('tree-container');
const btnNewTree = document.getElementById('btn-new-tree');
const btnLoadTree = document.getElementById('btn-load-tree');
const fileInput = document.getElementById('file-input');
const nullNode = document.getElementById('null-node');
const treeNameInput = document.getElementById('tree-name-input');

function syncTreeNameInput() {
    treeNameInput.value = myTree.treeName || '';
}

treeNameInput.addEventListener('input', (e) => { myTree.treeName = e.target.value; });
treeNameInput.addEventListener('change', (e) => { myTree.treeName = e.target.value; });

btnNewTree.addEventListener('click', () => { 
    myTree = new FamilyTree();
    resetTreeCanvas();
    syncTreeNameInput();
    introScreen.style.display = 'none';
    treeContainer.style.display = 'block';
    checkNullNode();
});

btnLoadTree.addEventListener('click', () => { fileInput.click(); });
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const rawText = (e.target.result || '').replace(/^\uFEFF/, '');
            const data = JSON.parse(rawText);
            myTree = new FamilyTree();
            myTree.loadFromJsonData(data);
            resetTreeCanvas();
            syncTreeNameInput();

            introScreen.style.display = 'none';
            treeContainer.style.display = 'block';
            checkNullNode();

            for (const id in myTree.nodes) {
                const node = myTree.nodes[id];
                const x = Number.isFinite(node.x) ? node.x : (window.innerWidth / 2) - 90;
                const y = Number.isFinite(node.y) ? node.y : (window.innerHeight / 2) - 60;
                renderPersonCard(node, x, y, true);
            }
            redrawAllEdges();
        } catch (err) {
            console.error(err);
            alert('JSON dosyası okunamadı. Lütfen bu uygulamadan kaydedilmiş bir soy ağacı dosyası seçin.');
        } finally {
            fileInput.value = '';
        }
    };
    reader.readAsText(file);
});

function checkNullNode() {
    const isEmpty = Object.keys(myTree.nodes).length === 0;
    nullNode.style.display = isEmpty ? 'flex' : 'none';
    if (isEmpty) {
        treeContainer.classList.add('tree-empty');
        pointX = 0; pointY = 0; scale = 1; updateTransform();
    } else {
        treeContainer.classList.remove('tree-empty');
    }
}

// --- SONSUZ DÜZLEM ---
const canvas = document.getElementById('tree-canvas');
let scale = 1, panning = false, pointX = 0, pointY = 0, startX = 0, startY = 0;

function updateTransform() { 
    canvas.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    treeContainer.style.backgroundPosition = `${pointX}px ${pointY}px`;
    treeContainer.style.backgroundSize = `${30 * scale}px ${30 * scale}px`;
}

treeContainer.addEventListener('mousedown', function(e) {
    // Ağaç henüz boşken arka plan hareket ettirilemez!
    if (Object.keys(myTree.nodes).length === 0) return;

    // UI kontrollerine veya karta tıklandığında pan başlatma
    if(!e.target.closest('.person-card') && !e.target.closest('.action-btn') && !e.target.closest('.null-node') && !e.target.closest('.node-plus-menu') && !e.target.closest('#ui-controls')) {
        e.preventDefault(); startX = e.clientX - pointX; startY = e.clientY - pointY; panning = true;
    }
});
window.addEventListener('mouseup', () => { panning = false; });
treeContainer.addEventListener('mousemove', function(e) {
    if (!panning || Object.keys(myTree.nodes).length === 0) return;
    pointX = (e.clientX - startX); pointY = (e.clientY - startY); updateTransform();
});
treeContainer.addEventListener('wheel', function(e) {
    // Ağaç henüz boşken yakınlaştırma/uzaklaştırma yapılmaz!
    if (Object.keys(myTree.nodes).length === 0) return;

    e.preventDefault();
    const xs = (e.clientX - pointX) / scale, ys = (e.clientY - pointY) / scale;
    const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
    let newScale = scale;
    (delta > 0) ? (newScale *= 1.1) : (newScale /= 1.1);
    
    if (newScale >= 0.3 && newScale <= 2.5) {
        scale = newScale;
        pointX = e.clientX - xs * scale; pointY = e.clientY - ys * scale;
        updateTransform();
    }
}, { passive: false });


// --- YENİ EKLEME MANTIĞI & MODAL ---
const nodeModal = document.getElementById('node-modal');
const modalTitle = document.getElementById('modal-title');
const mFname = document.getElementById('m-fname'), mLname = document.getElementById('m-lname');
const mBdate = document.getElementById('m-bdate'), mDdate = document.getElementById('m-ddate');
const mBplace = document.getElementById('m-bplace'), mNote = document.getElementById('m-note');
const gMale = document.getElementById('g-male'), gFemale = document.getElementById('g-female');

let currentRelation = { targetId: null, type: 'first' };

nullNode.onclick = function() {
    editingNodeId = null; currentRelation = { targetId: null, type: 'first' };
    modalTitle.innerText = "Kişi Bilgileri"; clearModalFields(); nodeModal.classList.remove('hidden');
};

document.getElementById('btn-cancel-modal').onclick = function() { nodeModal.classList.add('hidden'); clearModalFields(); };

function clearModalFields() { 
    mFname.value = ''; mLname.value = ''; mBdate.value = ''; mDdate.value = ''; mBplace.value = ''; mNote.value = ''; gMale.checked = true;
}

window.openEditModal = function(e, id) {
    e.stopPropagation(); editingNodeId = id; const person = myTree.nodes[id];
    mFname.value = person.firstName; mLname.value = person.lastName;
    mBdate.value = person.birthDate; mDdate.value = person.deathDate;
    mBplace.value = person.birthPlace; mNote.value = person.note;
    if(person.gender === 'F') gFemale.checked = true; else gMale.checked = true;
    modalTitle.innerText = "Kişiyi Düzenle"; nodeModal.classList.remove('hidden');
};

window.deleteNode = function(e, id) {
    e.stopPropagation(); delete myTree.nodes[id];
    const card = document.getElementById(id); if(card) card.remove();
    selectedNodes.delete(id); redrawAllEdges(); checkNullNode();
};

window.openRelationModal = function(e, relationType, targetId) {
    if (e && e.stopPropagation) e.stopPropagation();
    document.querySelectorAll('.node-plus-menu.active').forEach(m => {
        m.classList.remove('active');
        const c = m.closest('.person-card');
        if (c) c.classList.remove('active-menu');
    });
    editingNodeId = null;
    currentRelation = { targetId: targetId, type: relationType };
    
    if (relationType === 'parent') modalTitle.innerText = "Yeni Ebeveyn Ekle";
    else if (relationType === 'partner') modalTitle.innerText = "Yeni Eş Ekle";
    else if (relationType === 'child') modalTitle.innerText = "Yeni Çocuk Ekle";
    else modalTitle.innerText = "Yeni Akraba Ekle";
    
    clearModalFields();
    
    // Akıllı Cinsiyet Otomatik Seçimi
    if (relationType === 'partner' && myTree.nodes[targetId]) {
        const targetGender = myTree.nodes[targetId].gender;
        if (targetGender === 'M') gFemale.checked = true;
        else gMale.checked = true;
    } else if (relationType === 'parent' && myTree.nodes[targetId]) {
        const existingParents = myTree.nodes[targetId].parents || [];
        if (existingParents.length === 1 && myTree.nodes[existingParents[0]]) {
            const firstGender = myTree.nodes[existingParents[0]].gender;
            if (firstGender === 'M') gFemale.checked = true;
            else gMale.checked = true;
        }
    }
    
    nodeModal.classList.remove('hidden');
};

document.getElementById('btn-save-modal').addEventListener('click', () => {
    if (mFname.value.trim() === '') return;
    const selectedGender = gMale.checked ? 'M' : 'F';

    if (editingNodeId) {
        const p = myTree.nodes[editingNodeId];
        p.firstName = mFname.value; p.lastName = mLname.value;
        p.birthDate = mBdate.value; p.deathDate = mDdate.value;
        p.birthPlace = mBplace.value; p.note = mNote.value; p.gender = selectedGender;
        document.getElementById(editingNodeId).innerHTML = getCardInnerHtml(p);
        nodeModal.classList.add('hidden'); editingNodeId = null; return; 
    }

    const uniqueId = 'node-' + Date.now();
    const newPerson = new PersonNode(uniqueId, mFname.value, mLname.value, mBdate.value, mDdate.value, mBplace.value, mNote.value, selectedGender);
    myTree.addNode(newPerson);

    let startX = (window.innerWidth / 2) - 90;
    let startY = (window.innerHeight / 2) - 60;

    if (currentRelation.type !== 'first' && currentRelation.targetId) {
        const targetElement = document.getElementById(currentRelation.targetId);
        const targetX = targetElement ? (parseFloat(targetElement.style.left) || 0) : startX;
        const targetY = targetElement ? (parseFloat(targetElement.style.top) || 0) : startY;

        if (currentRelation.type === 'parent') { 
            const targetNode = myTree.nodes[currentRelation.targetId];
            const existingParentId = (targetNode.parents || []).find(pid => pid !== uniqueId);
            myTree.addConnection(uniqueId, currentRelation.targetId); 

            if (existingParentId && myTree.nodes[existingParentId]) {
                myTree.addPartner(existingParentId, uniqueId);
                const pEl = document.getElementById(existingParentId);
                if (pEl) {
                    const pX = parseFloat(pEl.style.left) || targetX;
                    const pY = parseFloat(pEl.style.top) || (targetY - 180);
                    startX = pX + 220; // İlk ebeveynin yanına yerleştir
                    startY = pY;
                } else {
                    startX = targetX + 110;
                    startY = targetY - 180;
                }
            } else {
                startX = targetX - 110; // İkinci ebeveyne yer kalsın diye hafif sola
                startY = targetY - 180;
            }
        } 
        else if (currentRelation.type === 'child') { 
            myTree.addConnection(currentRelation.targetId, uniqueId); 
            const parentNode = myTree.nodes[currentRelation.targetId];
            const partnerId = (parentNode.partners || [])[0];
            let baseX = targetX;
            if (partnerId && myTree.nodes[partnerId]) {
                const partnerEl = document.getElementById(partnerId);
                if (partnerEl) {
                    const partnerX = parseFloat(partnerEl.style.left) || targetX;
                    baseX = (targetX + partnerX) / 2; // Anne ve baba arasına hizala
                }
            }
            const otherChildren = (parentNode.children || []).filter(cid => cid !== uniqueId);
            if (otherChildren.length > 0) {
                const lastChildId = otherChildren[otherChildren.length - 1];
                const lastChildEl = document.getElementById(lastChildId);
                if (lastChildEl) {
                    const lastChildX = parseFloat(lastChildEl.style.left) || baseX;
                    baseX = lastChildX + 200;
                }
            }
            startX = baseX; 
            startY = targetY + 180; 
        } 
        else if (currentRelation.type === 'partner') { 
            myTree.addPartner(currentRelation.targetId, uniqueId); 
            startX = targetX + 220; 
            startY = targetY; 
            // Kişinin tek ebeveynli çocukları varsa yeni eşi de onların diğer ebeveyni yap
            const targetNode = myTree.nodes[currentRelation.targetId];
            (targetNode.children || []).forEach(cid => {
                const childNode = myTree.nodes[cid];
                if (childNode && (childNode.parents || []).length === 1) {
                    myTree.addConnection(uniqueId, cid);
                }
            });
        }
        else if (currentRelation.type === 'sibling') {
            const targetNode = myTree.nodes[currentRelation.targetId];
            if (targetNode.parents && targetNode.parents.length > 0) {
                targetNode.parents.forEach(pId => { myTree.addConnection(pId, uniqueId); });
            }
            startX = targetX + 200; startY = targetY; // Yanına yerleştir
        }
    }

    renderPersonCard(newPerson, startX, startY);
    redrawAllEdges();
    nodeModal.classList.add('hidden'); clearModalFields(); checkNullNode();
});

// --- ARTI (+) MENÜSÜ KONTROLLERİ ---
window.togglePlusMenu = function(e, btn) {
    if (e && e.stopPropagation) e.stopPropagation();
    const menu = btn.closest('.node-plus-menu');
    if (!menu) return;
    if (menu._closeTimer) clearTimeout(menu._closeTimer);
    const wasOpen = menu.classList.contains('active');
    document.querySelectorAll('.node-plus-menu.active').forEach(m => {
        m.classList.remove('active');
        const c = m.closest('.person-card');
        if (c) c.classList.remove('active-menu');
    });
    if (!wasOpen) {
        menu.classList.add('active');
        const c = menu.closest('.person-card');
        if (c) c.classList.add('active-menu');
    }
};

window.handleMenuEnter = function(menu) {
    if (menu._closeTimer) {
        clearTimeout(menu._closeTimer);
        menu._closeTimer = null;
    }
    menu.classList.add('active');
    const c = menu.closest('.person-card');
    if (c) c.classList.add('active-menu');
};

window.handleMenuLeave = function(menu) {
    if (menu._closeTimer) clearTimeout(menu._closeTimer);
    menu._closeTimer = setTimeout(() => {
        menu.classList.remove('active');
        const c = menu.closest('.person-card');
        if (c) c.classList.remove('active-menu');
    }, 400); // 400ms hareket tampon süresi
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.node-plus-menu')) {
        document.querySelectorAll('.node-plus-menu.active').forEach(m => {
            m.classList.remove('active');
            const c = m.closest('.person-card');
            if (c) c.classList.remove('active-menu');
        });
    }
});

function getCardInnerHtml(person) {
    const birthYear = person.birthDate ? person.birthDate.split('-')[0] : '?';
    const deathYear = person.deathDate ? person.deathDate.split('-')[0] : '';
    const dateText = (person.birthDate || person.deathDate) ? `${birthYear} - ${deathYear}` : '';
    const infoHtml = person.note ? `<div class="info-wrapper">i<div class="note-tooltip">${person.note}</div></div>` : '<div></div>';
    const genderClass = person.gender === 'F' ? 'gender-F' : 'gender-M';

    return `
        <!-- HOVER & TIKLAMA (+) MENÜSÜ: Sağa doğru açılan, alt alta 3 seçenek -->
        <div class="node-plus-menu" onmouseenter="handleMenuEnter(this)" onmouseleave="handleMenuLeave(this)">
            <div class="plus-btn" title="Yeni Akraba Ekle" onclick="togglePlusMenu(event, this)">+</div>
            <div class="plus-options">
                <button type="button" onclick="openRelationModal(event, 'parent', '${person.id}')">Ebeveyn Ekle</button>
                <button type="button" onclick="openRelationModal(event, 'partner', '${person.id}')">Eş Ekle</button>
                <button type="button" onclick="openRelationModal(event, 'child', '${person.id}')">Çocuk Ekle</button>
            </div>
        </div>
        <div class="card-header">
            ${infoHtml}
            <div class="header-actions">
                <span class="edit-icon" onclick="openEditModal(event, '${person.id}')">✏️</span>
                <span class="delete-icon" onclick="deleteNode(event, '${person.id}')">🗑️</span>
            </div>
        </div>
        <h3><span class="gender-indicator ${genderClass}"></span>${person.firstName} ${person.lastName}</h3>
        <p>${dateText}</p>
        <p><i>${person.birthPlace}</i></p>
    `;
}

function renderPersonCard(person, x, y, doAppend = true) {
    const card = document.createElement('div');
    card.classList.add('person-card');
    card.id = person.id; card.style.left = `${x}px`; card.style.top = `${y}px`;
    card.innerHTML = getCardInnerHtml(person);

    // İmlecin konumuna göre parlamasını sağlayan hareket dinleyicisi
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        card.style.setProperty('--glow-x', `${mx}px`);
        card.style.setProperty('--glow-y', `${my}px`);
    });

    let isNodeDragging = false; let nodeStartX = 0; let nodeStartY = 0;
    
    card.addEventListener('mousedown', (e) => {
        if(e.target.closest('.node-plus-menu') || e.target.closest('.action-btn') || e.target.closest('.header-actions')) return;
        e.stopPropagation();
        if (e.button !== 0) return;
        if (selectedNodes.has(person.id)) draggedNodes = Array.from(selectedNodes);
        else {
            if (!e.ctrlKey && !e.metaKey) { document.querySelectorAll('.person-card').forEach(c => c.classList.remove('selected')); selectedNodes.clear(); }
            selectedNodes.add(person.id); card.classList.add('selected'); draggedNodes = [person.id];
        }
        isNodeDragging = true; isDraggingNode = true; nodeStartX = e.clientX; nodeStartY = e.clientY;
        draggedNodes.forEach(id => { document.getElementById(id).style.zIndex = 100; });
    });

    window.addEventListener('mousemove', (e) => {
        if (!isNodeDragging) return;
        const dx = (e.clientX - nodeStartX) / scale; const dy = (e.clientY - nodeStartY) / scale;
        draggedNodes.forEach(id => {
            const el = document.getElementById(id);
            el.style.left = `${(parseFloat(el.style.left) || 0) + dx}px`;
            el.style.top = `${(parseFloat(el.style.top) || 0) + dy}px`;
        });
        nodeStartX = e.clientX; nodeStartY = e.clientY; redrawAllEdges();
    });

    window.addEventListener('mouseup', (e) => {
        if (!isNodeDragging) return;
        isNodeDragging = false; setTimeout(() => isDraggingNode = false, 10);
        draggedNodes.forEach(id => { document.getElementById(id).style.zIndex = ''; });

        const mouseX = e.clientX; const mouseY = e.clientY;
        const draggedEls = draggedNodes.map(id => document.getElementById(id));
        draggedEls.forEach(el => el.style.display = 'none');
        const elementBelow = document.elementFromPoint(mouseX, mouseY);
        draggedEls.forEach(el => el.style.display = '');
        
        const targetCard = elementBelow ? elementBelow.closest('.person-card') : null;
        if (targetCard && !draggedNodes.includes(targetCard.id)) {
            dropTargetId = targetCard.id; document.getElementById('relation-modal').classList.remove('hidden');
        }
    });

    card.addEventListener('click', (e) => {
        if (isDraggingNode || e.target.closest('.node-plus-menu') || e.target.closest('.header-actions')) return;
        if (e.ctrlKey || e.metaKey) {
            if (selectedNodes.has(person.id)) { selectedNodes.delete(person.id); card.classList.remove('selected'); } 
            else { selectedNodes.add(person.id); card.classList.add('selected'); }
        } else {
            document.querySelectorAll('.person-card').forEach(c => c.classList.remove('selected'));
            selectedNodes.clear(); selectedNodes.add(person.id); card.classList.add('selected');
        }
    });

    if (doAppend) document.getElementById('tree-canvas').appendChild(card);
}

// --- SÜRÜKLE BIRAK ONAYI ---
window.cancelRelationDrop = function() { document.getElementById('relation-modal').classList.add('hidden'); dropTargetId = null; }
window.confirmRelationDrop = function(type) {
    const sourceId = draggedNodes[0]; 
    if (type === 'parent') myTree.addConnection(sourceId, dropTargetId);
    else if (type === 'child') myTree.addConnection(dropTargetId, sourceId);
    else if (type === 'partner') myTree.addPartner(sourceId, dropTargetId);
    
    document.getElementById('relation-modal').classList.add('hidden'); dropTargetId = null; redrawAllEdges();
}

// --- ÇİZGİ ÇİZİM MİMARİSİ ---
let svgEdges = document.getElementById('tree-edges');
function resetTreeCanvas() {
    canvas.innerHTML = '<svg id="tree-edges" width="50000" height="50000" style="position: absolute; top: 0; left: 0; overflow: visible; pointer-events: none;"></svg>';
    svgEdges = document.getElementById('tree-edges');
    selectedNodes.clear();
    pointX = 0; pointY = 0; scale = 1;
    updateTransform();
}
function pairKey(a, b) {
    return [a, b].sort().join('|');
}
function cardBox(el) {
    const w = el.offsetWidth || 180;
    const h = el.offsetHeight || 120;
    const x = (el.style.left ? parseFloat(el.style.left) : el.offsetLeft) || 0;
    const y = (el.style.top ? parseFloat(el.style.top) : el.offsetTop) || 0;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, top: y, bottom: y + h, left: x, right: x + w };
}
function appendPath(d, extraClass) {
    if (!svgEdges) svgEdges = document.getElementById('tree-edges');
    if (!svgEdges) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", d);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "var(--tree-edge-color, #e67e51)");
    line.setAttribute("stroke-width", "3.5");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    line.classList.add("tree-line");
    if (extraClass) line.classList.add(extraClass);
    svgEdges.appendChild(line);
}

function appendAnchorDot(x, y) {
    if (!svgEdges) svgEdges = document.getElementById('tree-edges');
    if (!svgEdges) return;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", 5.5);
    dot.setAttribute("fill", "var(--tree-edge-color, #e67e51)");
    dot.setAttribute("stroke", "var(--card-bg, #ffffff)");
    dot.setAttribute("stroke-width", "2.5");
    dot.classList.add("anchor-dot");
    svgEdges.appendChild(dot);
}

function appendUnionDot(x, y) {
    if (!svgEdges) svgEdges = document.getElementById('tree-edges');
    if (!svgEdges) return;
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", 6.5);
    dot.setAttribute("fill", "var(--tree-edge-color, #e67e51)");
    dot.setAttribute("stroke", "var(--card-bg, #ffffff)");
    dot.setAttribute("stroke-width", "3");
    dot.classList.add("union-dot");
    svgEdges.appendChild(dot);
}

function collectCouples() {
    const seen = new Set();
    const couples = [];
    const add = (a, b) => {
        if (!a || !b || a === b || !myTree.nodes[a] || !myTree.nodes[b]) return;
        const key = pairKey(a, b);
        if (seen.has(key)) return;
        seen.add(key);
        couples.push([a, b]);
    };
    for (const id in myTree.nodes) {
        const node = myTree.nodes[id];
        (node.partners || []).forEach((pid) => add(id, pid));
        const parents = (node.parents || []).filter((p) => myTree.nodes[p]);
        if (parents.length >= 2) {
            add(parents[0], parents[1]);
        }
    }
    return couples;
}

function childrenOfCouple(id1, id2) {
    const n1 = myTree.nodes[id1];
    const n2 = myTree.nodes[id2];
    if (!n1 || !n2) return [];
    const ids = new Set();

    for (const cid in myTree.nodes) {
        const child = myTree.nodes[cid];
        const parents = child.parents || [];
        if (parents.includes(id1) && parents.includes(id2)) {
            ids.add(cid);
        }
    }

    const exclusiveCouple = (n1.partners || []).length <= 1 && (n2.partners || []).length <= 1;
    if (exclusiveCouple) {
        [...(n1.children || []), ...(n2.children || [])].forEach((cid) => {
            if (myTree.nodes[cid]) ids.add(cid);
        });
    }

    return Array.from(ids);
}

function drawCoupleAndChildren(el1, el2, childIds) {
    const a = cardBox(el1);
    const b = cardBox(el2);
    const left = a.cx <= b.cx ? a : b;
    const right = a.cx <= b.cx ? b : a;

    // Ebeveyn bağlantı noktaları (Anne ve Baba kenarları)
    let p1, p2;
    if (left.right + 12 < right.left) {
        // Yan yana duran ebeveynler (Soldakinin sağ kenarı, sağdakinin sol kenarı)
        p1 = { x: left.right, y: left.cy };
        p2 = { x: right.left, y: right.cy };
    } else {
        // Üst üste veya çakışan ebeveynler
        const topP = left.cy <= right.cy ? left : right;
        const botP = left.cy <= right.cy ? right : left;
        p1 = { x: topP.cx, y: topP.bottom };
        p2 = { x: botP.cx, y: botP.top };
    }

    const childBoxes = (childIds || [])
        .map((id) => {
            const el = document.getElementById(id);
            return el ? { id, ...cardBox(el) } : null;
        })
        .filter(Boolean);

    // Ortak birleşim noktası (Çizimdeki gibi anne ve babanın arasında ve biraz altında)
    const jx = (p1.x + p2.x) / 2;
    const yMid = (p1.y + p2.y) / 2;
    const dx = Math.abs(p2.x - p1.x);
    let dip = Math.max(22, Math.min(50, dx * 0.22 + 16));
    let jy = yMid + dip;

    if (childBoxes.length > 0) {
        const minChildTop = Math.min(...childBoxes.map(c => c.top));
        if (minChildTop < jy + 25 && minChildTop > yMid) {
            jy = (yMid + minChildTop) / 2;
        }
    }

    // 1. Anne ve Babadan ortak noktaya inen bağlar
    appendPath(`M ${p1.x} ${p1.y} L ${jx} ${jy}`, 'parent-link');
    appendPath(`M ${p2.x} ${p2.y} L ${jx} ${jy}`, 'parent-link');

    // 2. Düğümler üzerindeki noktalar (Çizimdeki 3 nokta: Baba, Anne ve Ortak Birleşim Noktası)
    appendAnchorDot(p1.x, p1.y);
    appendAnchorDot(p2.x, p2.y);
    appendUnionDot(jx, jy);

    if (!childBoxes.length) return;

    // Çocukları yatay düzlemde soldan sağa hizala
    childBoxes.sort((c1, c2) => c1.cx - c2.cx);

    // 3. Ortak noktadan çocuklara uzanan zarif S-eğrileri (Kübik Bezier)
    childBoxes.forEach((c) => {
        const targetX = c.cx;
        if (c.top >= jy - 10) {
            // Çocuk ebeveynlerin altında
            const targetY = c.top;
            const vDist = Math.max(30, targetY - jy);
            const cp1x = jx;
            const cp1y = jy + vDist * 0.5;
            const cp2x = targetX;
            const cp2y = targetY - vDist * 0.5;
            appendPath(
                `M ${jx} ${jy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`,
                'child-line'
            );
        } else {
            // Çocuk ebeveynlerin yukarısında
            const targetY = c.bottom;
            const vDist = Math.max(30, Math.abs(jy - targetY));
            const cp1x = jx;
            const cp1y = jy - vDist * 0.5;
            const cp2x = targetX;
            const cp2y = targetY + vDist * 0.5;
            appendPath(
                `M ${jx} ${jy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`,
                'child-line'
            );
        }
    });
}

function drawSingleParentChildren(parentEl, childIds) {
    const p = cardBox(parentEl);
    const childBoxes = (childIds || [])
        .map((id) => {
            const el = document.getElementById(id);
            return el ? { id, ...cardBox(el) } : null;
        })
        .filter(Boolean);
    if (!childBoxes.length) return;

    childBoxes.sort((c1, c2) => c1.cx - c2.cx);
    appendAnchorDot(p.cx, p.bottom);

    childBoxes.forEach((c) => {
        const targetX = c.cx;
        const targetY = c.top >= p.bottom ? c.top : c.bottom;
        const vDist = Math.max(30, Math.abs(targetY - p.bottom));
        const dir = targetY >= p.bottom ? 1 : -1;
        const cp1y = p.bottom + dir * vDist * 0.5;
        const cp2y = targetY - dir * vDist * 0.5;
        appendPath(
            `M ${p.cx} ${p.bottom} C ${p.cx} ${cp1y}, ${targetX} ${cp2y}, ${targetX} ${targetY}`,
            'child-line'
        );
    });
}

function redrawAllEdges() {
    svgEdges.innerHTML = '';
    const drawnChildren = new Set();
    const drawnCouples = new Set();

    // 1. Tüm çiftleri ve ortak çocuklarını çiz (Anne + Baba -> Ortak Nokta -> Çocuklar)
    collectCouples().forEach(([id1, id2]) => {
        const cKey = pairKey(id1, id2);
        if (drawnCouples.has(cKey)) return;
        drawnCouples.add(cKey);

        const el1 = document.getElementById(id1);
        const el2 = document.getElementById(id2);
        if (!el1 || !el2) return;

        const childIds = childrenOfCouple(id1, id2);
        drawCoupleAndChildren(el1, el2, childIds);
        childIds.forEach((cid) => drawnChildren.add(cid));
    });

    // 2. Tek ebeveynli kalan çocukları çiz
    const singleParentMap = {};
    for (const id in myTree.nodes) {
        const node = myTree.nodes[id];
        (node.children || []).forEach((childId) => {
            if (drawnChildren.has(childId)) return;
            if (!singleParentMap[id]) singleParentMap[id] = [];
            if (!singleParentMap[id].includes(childId)) singleParentMap[id].push(childId);
        });
    }

    for (const pId in singleParentMap) {
        const pEl = document.getElementById(pId);
        if (!pEl) continue;
        const unhandled = singleParentMap[pId].filter((cid) => !drawnChildren.has(cid));
        if (unhandled.length > 0) {
            drawSingleParentChildren(pEl, unhandled);
            unhandled.forEach((cid) => drawnChildren.add(cid));
        }
    }
}

// --- KAYDETME & PAYLAŞMA & ÇIKTI ---
document.getElementById('btn-back').addEventListener('click', () => {
    myTree = new FamilyTree();
    resetTreeCanvas();
    syncTreeNameInput();
    checkNullNode();
    treeContainer.style.display = 'none';
    introScreen.style.display = 'flex';
});

document.getElementById('btn-save-menu').addEventListener('click', () => {
    if (Object.keys(myTree.nodes).length === 0) return;
    document.getElementById('save-menu-modal').classList.remove('hidden');
});

document.getElementById('btn-export-json').addEventListener('click', () => {
    // BUG FIX: JSON'a kaydetmeden hemen önce güncel x,y koordinatlarını ağaca kaydet
    for (let id in myTree.nodes) {
        const el = document.getElementById(id);
        if (el) {
            myTree.nodes[id].x = parseFloat(el.style.left);
            myTree.nodes[id].y = parseFloat(el.style.top);
        }
    }
    myTree.exportToJsonFile();
    document.getElementById('save-menu-modal').classList.add('hidden');
});

// YÜKSEK ÇÖZÜNÜRLÜKLÜ RESİM ÇIKTISI (html2canvas)
let currentImageDataUrl = "";
document.getElementById('btn-export-image').addEventListener('click', async () => {
    document.getElementById('save-menu-modal').classList.add('hidden');
    
    // 1. Ağacın Sınırlarını Bul (Bounding Box)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const cards = document.querySelectorAll('.person-card');
    cards.forEach(c => {
        const x = parseFloat(c.style.left); const y = parseFloat(c.style.top);
        if(x < minX) minX = x; if(y < minY) minY = y;
        if(x + 200 > maxX) maxX = x + 200; if(y + 150 > maxY) maxY = y + 150; 
    });
    
    // Padding ekle
    const padding = 100; minX -= padding; minY -= padding; maxX += padding; maxY += padding;
    
    // 2. Geçici olarak Canvas'ı Transformdan arındır ve Ortala
    const originalTransform = canvas.style.transform;
    canvas.style.transform = `translate(${-minX}px, ${-minY}px) scale(1)`;
    
    // Çizimin oturması için çok kısa bekleme
    await new Promise(r => setTimeout(r, 100));
    
    // 3. Render (Yüksek Kalite)
    const renderWidth = maxX - minX;
    const renderHeight = maxY - minY;
    
    // Koyu/Açık Tema arkaplan rengini al
    const bgColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#121212' : '#f4f6f8';
    
    html2canvas(canvas, {
        width: renderWidth,
        height: renderHeight,
        backgroundColor: bgColor,
        scale: 2 // Çözünürlük Çarpanı (Keskin yazılar için)
    }).then(renderedCanvas => {
        // 4. Eski haline çevir
        canvas.style.transform = originalTransform;
        
        currentImageDataUrl = renderedCanvas.toDataURL("image/png");
        document.getElementById('preview-image').src = currentImageDataUrl;
        document.getElementById('image-preview-modal').classList.remove('hidden');
    });
});

document.getElementById('btn-download-img').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = currentImageDataUrl;
    a.download = (myTree.treeName || "soy_agaci") + ".png";
    a.click();
});

document.getElementById('btn-copy-img').addEventListener('click', async () => {
    try {
        const response = await fetch(currentImageDataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        alert("Fotoğraf panoya kopyalandı!");
    } catch (err) {
        alert("Kopyalama başarısız oldu. Tarayıcınız desteklemiyor olabilir.");
    }
});

document.getElementById('btn-share-img').addEventListener('click', async () => {
    try {
        const response = await fetch(currentImageDataUrl);
        const blob = await response.blob();
        const file = new File([blob], "soy_agaci.png", { type: "image/png" });
        if (navigator.share) {
            await navigator.share({
                title: myTree.treeName,
                text: 'Soy ağacımı oluşturdum, göz at!',
                files: [file]
            });
        } else {
            alert("Paylaşım özelliği tarayıcınızda desteklenmiyor.");
        }
    } catch (err) {
        console.error(err);
    }
});
