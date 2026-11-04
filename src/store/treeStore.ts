import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';
import type { PersonData, ModalType } from '../types/tree';

interface TreeState {
  treeName: string;
  isTreeActive: boolean;
  isDarkTheme: boolean;
  nodes: Node<PersonData>[];
  edges: Edge[];

  activeModal: ModalType;
  selectedNodeId: string | null;
  relationType: 'parent' | 'partner' | 'child' | 'sibling' | null;
  previewImageUrl: string;

  setTreeName: (name: string) => void;
  setDarkTheme: (isDark: boolean) => void;
  setTreeActive: (active: boolean) => void;
  updateNodes: (nodes: Node<PersonData>[]) => void;
  updateEdges: (edges: Edge[]) => void;

  openModal: (type: ModalType, nodeId?: string | null, relType?: 'parent' | 'partner' | 'child' | 'sibling' | null) => void;
  closeModal: () => void;
  setPreviewImageUrl: (url: string) => void;

  addPerson: (data: Omit<PersonData, 'id' | 'parents' | 'children' | 'partners'>) => void;
  editPerson: (id: string, data: Partial<PersonData>) => void;
  deletePerson: (id: string) => void;
  loadFromJSON: (jsonData: any) => void;
  resetTree: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  treeName: 'Benim Soy Ağacım',
  isTreeActive: false,
  isDarkTheme: true,
  nodes: [],
  edges: [],

  activeModal: null,
  selectedNodeId: null,
  relationType: null,
  previewImageUrl: '',

  setTreeName: (name) => set({ treeName: name }),
  setDarkTheme: (isDark) => set({ isDarkTheme: isDark }),
  setTreeActive: (active) => set({ isTreeActive: active }),
  updateNodes: (nodes) => set({ nodes }),
  updateEdges: (edges) => set({ edges }),

  openModal: (type, nodeId = null, relType = null) =>
    set({ activeModal: type, selectedNodeId: nodeId, relationType: relType }),
  closeModal: () =>
    set({ activeModal: null, selectedNodeId: null, relationType: null }),
  setPreviewImageUrl: (url) => set({ previewImageUrl: url }),

  addPerson: (data, partnerId = null) => {
    const { nodes, selectedNodeId, relationType } = get();
    const newId = 'node-' + Date.now();

    // Varsayılan pozisyon (merkez)
    let x = window.innerWidth / 2 - 90;
    let y = window.innerHeight / 2 - 60;

    if (selectedNodeId) {
      const targetNode = nodes.find(n => n.id === selectedNodeId);
      if (targetNode) {
        if (relationType === 'parent') { x = targetNode.position.x; y = targetNode.position.y - 180; }
        else if (relationType === 'child') { x = targetNode.position.x; y = targetNode.position.y + 180; }
        else if (relationType === 'partner') { x = targetNode.position.x + 220; y = targetNode.position.y; }
        else if (relationType === 'sibling') { x = targetNode.position.x + 200; y = targetNode.position.y; }
      }
    }

    const newPerson: PersonData = {
      id: newId,
      ...data,
      parents: [],
      children: [],
      partners: []
    };

    const newNode: Node<PersonData> = {
      id: newId,
      type: 'person',
      position: { x, y },
      data: newPerson
    };

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...get().edges];

    // İlişki çizgisi ekleme (React Flow Edge)
    if (selectedNodeId && relationType) {
      if (relationType === 'parent') {
        updatedEdges.push({ id: `e-${newId}-${selectedNodeId}`, source: newId, target: selectedNodeId, animated: false });
      } else if (relationType === 'child') {
        // Edge from the primary selected parent
        updatedEdges.push({ id: `e-${selectedNodeId}-${newId}`, source: selectedNodeId, target: newId, animated: false });
        // Determine the partner that should also be a parent
        let actualPartnerId = partnerId;
        if (!actualPartnerId) {
          const parentNode = nodes.find(n => n.id === selectedNodeId);
          actualPartnerId = parentNode?.data.partners?.[0] || null;
        }
        // If a partner exists, add a second edge and record both parents
        if (actualPartnerId) {
          updatedEdges.push({ id: `e-${actualPartnerId}-${newId}`, source: actualPartnerId, target: newId, animated: false });
          newPerson.parents = [selectedNodeId, actualPartnerId];
        } else {
          newPerson.parents = [selectedNodeId];
        }
      } else if (relationType === 'partner') {
        // Use partner‑specific handles so the edge attaches left↔right
        updatedEdges.push({
          id: `e-${selectedNodeId}-${newId}`,
          source: selectedNodeId,
          sourceHandle: 'partner-source',
          target: newId,
          targetHandle: 'partner-target',
          style: { strokeDasharray: '5,5' },
        });
        // Record partnership in both nodes
        newPerson.partners = [selectedNodeId];
        const idx = updatedNodes.findIndex(n => n.id === selectedNodeId);
        if (idx !== -1) {
          const existing = updatedNodes[idx];
          existing.data = { ...existing.data, partners: [...existing.data.partners, newId] };
          updatedNodes[idx] = existing;
        }
      }
    }

    set({ nodes: updatedNodes, edges: updatedEdges });
  },

  editPerson: (id, data) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      )
    });
  },

  deletePerson: (id) => {
    set({
      nodes: get().nodes.filter(n => n.id !== id),
      edges: get().edges.filter(e => e.source !== id && e.target !== id)
    });
  },

  loadFromJSON: (jsonData) => {
    const rawNodes = jsonData.nodes || jsonData;
    const name = jsonData.treeName || "Yüklenen Ağaç";

    const loadedNodes: Node<PersonData>[] = [];
    const loadedEdges: Edge[] = [];

    Object.values(rawNodes).forEach((person: any) => {
      loadedNodes.push({
        id: person.id,
        type: 'person',
        position: { x: person.x ?? 250, y: person.y ?? 150 },
        data: person
      });

      // Bağlantıları yükle
      (person.children || []).forEach((childId: string) => {
        loadedEdges.push({ id: `e-${person.id}-${childId}`, source: person.id, target: childId });
      });
    });

    set({ treeName: name, nodes: loadedNodes, edges: loadedEdges, isTreeActive: true });
  },

  resetTree: () => set({ nodes: [], edges: [], isTreeActive: false, treeName: 'Benim Soy Ağacım' })
}));