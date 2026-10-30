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

// --- ANA EKRANA DÖNME MANTIĞI ---
const btnBack = document.getElementById('btn-back');

btnBack.addEventListener('click', () => {
    // Ağaçta eleman var mı kontrol et
    const nodeCount = Object.keys(myTree.nodes).length;

    if (nodeCount > 0) {
        const confirmLeave = confirm(
            "Oluşturduğunuz soy ağacı kaydedilmedi! Ana ekrana dönerseniz mevcut verileri kaybedebilirsiniz.\n\nYine de çıkmak istiyor musunuz?"
        );
        if (!confirmLeave) return; // Kullanıcı vazgeçtiyse işlem yapma
    }

    // Ağacı sıfırla ve DOM'u temizle
    resetTreeState();

    // Ekran geçişi yap
    treeContainer.style.display = 'none';
    introScreen.style.display = 'flex';
});

// Ağacı ve arayüzü sıfırlayan yardımcı fonksiyon
function resetTreeState() {
    myTree = new FamilyTree(); // Mantıksal veri yapısını sıfırla
    document.getElementById('tree-canvas').innerHTML = ''; // Canvas üzerindeki kartları sil
    btnAddFirst.style.display = 'inline-block'; // 'İlk Kişiyi Ekle' butonunu tekrar göster
    
    // Pan/Zoom konumlarını sıfırla
    pointX = 0;
    pointY = 0;
    scale = 1;
    updateTransform();
}


// --- MODAL AÇMA/KAPATMA VE DÜĞÜM EKLEME (GARANTİ CATCH) ---
// Tıklama olayını doğrudan DOM üzerinden güvene alıyoruz
btnAddFirst.onclick = function() {
    nodeModal.classList.remove('hidden');
};

btnCancelModal.onclick = function() {
    nodeModal.classList.add('hidden');
    clearModalFields();
};

// JSON İndirme Butonu Bağlantısı
const btnExport = document.getElementById('btn-export');
btnExport.addEventListener('click', () => {
    if (Object.keys(myTree.nodes).length === 0) {
        alert("Kaydedilecek bir ağaç bulunamadı!");
        return;
    }
    myTree.exportToJsonFile();
});
