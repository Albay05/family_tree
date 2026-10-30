// Bir kişiyi ve onun özelliklerini/ilişkilerini temsil eden sınıf
class PersonNode {
    constructor(id, firstName, lastName, birthDate, deathDate, birthPlace, note = "", x = 0, y = 0) {
        this.id = id; 
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.birthPlace = birthPlace;
        this.note = note;
        
        // Ekranda çizileceği koordinatlar (Kaydedip yüklerken konumu hatırlamak için)
        this.x = x;
        this.y = y;
        
        // Bağlantılar (Graph kenarları)
        this.parents = [];  // Ebeveynlerin ID'leri
        this.children = []; // Kişinin çocuklarının ID'leri
        this.partners = []; // Eş(ler)inin ID'leri
    }
}

// Tüm ağacı ve veri yönetimini sağlayan sınıf
class FamilyTree {
    constructor() {
        this.nodes = {}; // Tüm node'ları ID'sine göre sözlük yapısında tutar
    }

    addNode(node) {
        this.nodes[node.id] = node;
    }

    // Ebeveyn-Çocuk ilişkisi kurma
    addConnection(parentId, childId) {
        if(this.nodes[parentId] && this.nodes[childId]) {
            if (!this.nodes[parentId].children.includes(childId)) {
                this.nodes[parentId].children.push(childId);
            }
            if (!this.nodes[childId].parents.includes(parentId)) {
                this.nodes[childId].parents.push(parentId);
            }
        }
    }

    // Eş/Partner ilişkisi kurma
    addPartner(person1Id, person2Id) {
        if(this.nodes[person1Id] && this.nodes[person2Id]) {
            if (!this.nodes[person1Id].partners.includes(person2Id)) {
                this.nodes[person1Id].partners.push(person2Id);
            }
            if (!this.nodes[person2Id].partners.includes(person1Id)) {
                this.nodes[person2Id].partners.push(person1Id);
            }
        }
    }

    // Ağacı JSON olarak bilgisayara indirme (Export)
    exportToJsonFile() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.nodes, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "soy_agaci.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    // JSON dosyasından ağacı yükleme (Import)
    loadFromJsonData(jsonData) {
        this.nodes = jsonData;
    }
}