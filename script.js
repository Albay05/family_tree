// --- VERİ MODELİ BAŞLATMA ---
let myTree = new FamilyTree(); 

// --- MODAL VE BUTON REFERANSLARI ---
const btnAddFirst = document.getElementById('btn-add-first');
const nodeModal = document.getElementById('node-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSaveModal = document.getElementById('btn-save-modal');

// Girdi Referansları
const mFname = document.getElementById('m-fname');
const mLname = document.getElementById('m-lname');
const mBdate = document.getElementById('m-bdate');
const mDdate = document.getElementById('m-ddate');
const mBplace = document.getElementById('m-bplace');
const mNote = document.getElementById('m-note');

// Modalı Aç/Kapat
btnAddFirst.addEventListener('click', () => {
    nodeModal.classList.remove('hidden');
});

btnCancelModal.addEventListener('click', () => {
    nodeModal.classList.add('hidden');
    clearModalFields();
});

function clearModalFields() {
    mFname.value = ''; mLname.value = ''; mBdate.value = '';
    mDdate.value = ''; mBplace.value = ''; mNote.value = '';
}

// KAYDET BUTONU - Düğüm Oluşturma
btnSaveModal.addEventListener('click', () => {
    if (mFname.value.trim() === '') {
        alert("İsim alanı zorunludur!");
        return;
    }

    // Benzersiz ID üret (Zaman damgası + rastgele sayı)
    const uniqueId = 'node-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // node.js içindeki Sınıfı kullanarak kişiyi oluştur
    const newPerson = new PersonNode(
        uniqueId,
        mFname.value,
        mLname.value,
        mBdate.value,
        mDdate.value,
        mBplace.value,
        mNote.value
    );

    // Ağaca kaydet
    myTree.addNode(newPerson);

    // Ekrana çizdir (Şimdilik ekranın ortasına yakın bir yere atıyoruz)
    // İleride algoritma ile otomatik koordinat vereceğiz.
    const startX = (window.innerWidth / 2) - 80; // 80, kart genişliğinin yarısı
    const startY = (window.innerHeight / 2) - 50;
    
    renderPersonCard(newPerson, startX, startY);

    // İlk kişi eklendikten sonra 'İlk Kişiyi Ekle' butonunu gizleyebiliriz
    btnAddFirst.style.display = 'none';

    nodeModal.classList.add('hidden');
    clearModalFields();
});

// GÖRSELLEŞTİRME: Kişi Kartını Canvas'a Ekleme
function renderPersonCard(person, x, y) {
    const card = document.createElement('div');
    card.classList.add('person-card');
    card.id = person.id;
    
    // Canvas içindeki konumu (Absolute Positioning)
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;

    // İçeriği doldur
    // Sadece doğum yılı göstermek için ufak bir ayarlama:
    const birthYear = person.birthDate ? person.birthDate.split('-')[0] : '?';
    const deathYear = person.deathDate ? person.deathDate.split('-')[0] : '';
    const dateText = (person.birthDate || person.deathDate) ? `${birthYear} - ${deathYear}` : '';

    card.innerHTML = `
        <h3>${person.firstName} ${person.lastName}</h3>
        <p>${dateText}</p>
        <p><i>${person.birthPlace}</i></p>
    `;

    // Sürükleme esnasında kartın tıklamasını durdurmamak için olayı engelle
    card.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Pan (canvas sürükleme) işlemini bu eleman üzerinde iptal et
    });

    document.getElementById('tree-canvas').appendChild(card);
}
