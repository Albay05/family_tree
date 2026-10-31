class PersonNode {
    constructor(id, firstName, lastName, birthDate, deathDate, birthPlace, note = "", gender = "M") {
        this.id = id; 
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.birthPlace = birthPlace;
        this.note = note;
        this.gender = gender; // 'M' (Erkek) veya 'F' (Kadın)
        
        // Bağlantılar
        this.parents = [];  
        this.children = []; 
        this.partners = []; 
    }
}

class FamilyTree {
    constructor() {
        this.treeName = "Benim Soy Ağacım"; // Ağaç İsmi
        this.nodes = {}; 
    }

    addNode(node) {
        this.nodes[node.id] = node;
    }

    addPartner(person1Id, person2Id) {
        if(this.nodes[person1Id] && this.nodes[person2Id]) {
            if (!this.nodes[person1Id].partners.includes(person2Id)) this.nodes[person1Id].partners.push(person2Id);
            if (!this.nodes[person2Id].partners.includes(person1Id)) this.nodes[person2Id].partners.push(person1Id);
        }
    }

    addConnection(parentId, childId) {
        if(!this.nodes[parentId] || !this.nodes[childId]) return;
        const link = (pId) => {
            if (!this.nodes[pId].children.includes(childId)) this.nodes[pId].children.push(childId);
            if (!this.nodes[childId].parents.includes(pId)) this.nodes[childId].parents.push(pId);
        };
        link(parentId);
        const partners = this.nodes[parentId].partners || [];
        if (partners.length === 1) link(partners[0]);

        // Çocuğun 2 ebeveyni olduğunda onları partner olarak da birbirine bağla
        const childParents = this.nodes[childId].parents || [];
        if (childParents.length === 2) {
            this.addPartner(childParents[0], childParents[1]);
        }
    }

    exportToJsonFile() {
        const exportData = {
            treeName: this.treeName,
            nodes: this.nodes
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", (this.treeName || "soy_agaci") + ".json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    loadFromJsonData(jsonData) {
        if (!jsonData || typeof jsonData !== 'object') {
            throw new Error('Geçersiz JSON verisi');
        }

        if (Array.isArray(jsonData)) {
            this.treeName = "Yüklenen Ağaç";
            this.nodes = this.normalizeNodesMap(jsonData);
            return;
        }

        const nodesSource = jsonData.nodes !== undefined ? jsonData.nodes : jsonData;
        this.treeName = jsonData.treeName || "Yüklenen Ağaç";
        this.nodes = this.normalizeNodesMap(nodesSource);
    }

    normalizeNodesMap(nodesSource) {
        const result = {};
        if (Array.isArray(nodesSource)) {
            nodesSource.forEach((raw) => {
                const node = this.normalizeNode(raw);
                if (node) result[node.id] = node;
            });
            return result;
        }
        if (!nodesSource || typeof nodesSource !== 'object') return result;
        for (const id in nodesSource) {
            const node = this.normalizeNode(nodesSource[id], id);
            if (node) result[node.id] = node;
        }
        return result;
    }

    normalizeNode(raw, fallbackId) {
        if (!raw || typeof raw !== 'object') return null;
        const id = raw.id || fallbackId;
        if (!id) return null;
        const node = new PersonNode(
            id,
            raw.firstName || '',
            raw.lastName || '',
            raw.birthDate || '',
            raw.deathDate || '',
            raw.birthPlace || '',
            raw.note || '',
            raw.gender || 'M'
        );
        node.parents = Array.isArray(raw.parents) ? [...raw.parents] : [];
        node.children = Array.isArray(raw.children) ? [...raw.children] : [];
        node.partners = Array.isArray(raw.partners) ? [...raw.partners] : [];
        if (raw.x !== undefined && raw.x !== null && raw.x !== '') node.x = parseFloat(raw.x);
        if (raw.y !== undefined && raw.y !== null && raw.y !== '') node.y = parseFloat(raw.y);
        return node;
    }
}
