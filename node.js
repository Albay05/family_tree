class PersonNode {
    constructor(id, firstName, lastName, birthDate, deathDate, birthPlace, note = "") {
        this.id = id; 
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.birthPlace = birthPlace;
        this.note = note;
        
        // Bağlantılar (Graph kenarları)
        this.parents = [];  // Çocuğun ebeveynleri (Genelde 2 ID)
        this.children = []; // Kişinin çocukları
        this.partners = []; // Eş(ler)inin ID'leri
    }
}

class FamilyTree {
    constructor() {
        this.nodes = {}; 
    }

    addNode(node) {
        this.nodes[node.id] = node;
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

    // Çocuğu iki ebeveyne birden bağlama
    addChildToPartners(childId, parent1Id, parent2Id) {
        if(this.nodes[childId]) {
            // Ebeveynleri çocuğa ekle
            this.nodes[childId].parents = [parent1Id, parent2Id].filter(id => id != null);
            
            // Çocuğu ebeveynlere ekle
            if (parent1Id && this.nodes[parent1Id]) this.nodes[parent1Id].children.push(childId);
            if (parent2Id && this.nodes[parent2Id]) this.nodes[parent2Id].children.push(childId);
        }
    }
}