import { create } from 'zustand';
import type { Node, Edge, Connection } from 'reactflow';
import type { PersonData, ModalType } from '../types/tree';

interface TreeState {
  nodes: Node<PersonData>[];
  edges: Edge[];
  treeName: string;
  isTreeActive: boolean;
  isDarkTheme: boolean;
  language: 'tr' | 'en';
  activeModal: ModalType | null;
  selectedNodeId: string | null;
  relationType: 'parent' | 'child' | 'partner' | null;
  previewImageUrl: string;
  
  setLanguage: (lang: 'tr' | 'en') => void;
  setDarkTheme: (isDark: boolean) => void;
  setTreeName: (name: string) => void;
  setTreeActive: (active: boolean) => void;
  
  updateNodes: (nodes: Node<PersonData>[]) => void;
  updateEdges: (edges: Edge[]) => void;
  
  openModal: (type: ModalType, nodeId?: string | null, relType?: 'parent' | 'child' | 'partner' | null) => void;
  closeModal: () => void;
  setPreviewImageUrl: (url: string) => void;
  
  addPerson: (data: PersonData) => void;
  editPerson: (id: string, data: PersonData) => void;
  deletePerson: (id: string) => void;
  loadFromJSON: (data: any) => void;
  resetTree: () => void;
  
  handleManualConnect: (connection: Connection) => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  nodes: [],
  edges: [],
  treeName: '',
  isTreeActive: false,
  isDarkTheme: false,
  language: 'tr',
  activeModal: null,
  selectedNodeId: null,
  relationType: null,
  previewImageUrl: '',

  setLanguage: (lang) => set({ language: lang }),
  setDarkTheme: (isDarkTheme) => set({ isDarkTheme }),
  setTreeName: (treeName) => set({ treeName }),
  setTreeActive: (isTreeActive) => set({ isTreeActive }),
  
  updateNodes: (newNodes) => set({ nodes: typeof newNodes === 'function' ? newNodes(get().nodes) : newNodes }),
  updateEdges: (newEdges) => set({ edges: typeof newEdges === 'function' ? newEdges(get().edges) : newEdges }),
  
  openModal: (activeModal, selectedNodeId = null, relationType = null) => set({ activeModal, selectedNodeId, relationType }),
  closeModal: () => set({ activeModal: null, selectedNodeId: null, relationType: null }),
  setPreviewImageUrl: (previewImageUrl) => set({ previewImageUrl }),
  
  addPerson: (data) => {
    const { activeModal, selectedNodeId, nodes, edges, relationType } = get();
    const newNodeId = `node-${Date.now()}`;
    let x = 0, y = 0;

    if (selectedNodeId) {
      const targetNode = nodes.find(n => n.id === selectedNodeId);
      if (targetNode) {
        if (relationType === 'child') { x = targetNode.position.x; y = targetNode.position.y + 150; }
        else if (relationType === 'parent') { x = targetNode.position.x; y = targetNode.position.y - 150; }
        else if (relationType === 'partner') { x = targetNode.position.x + 240; y = targetNode.position.y; }
      }
    }

    const newNode: Node<PersonData> = { id: newNodeId, type: 'person', position: { x, y }, data };
    let newEdges = [...edges];

    if (selectedNodeId) {
      if (relationType === 'child') {
        newEdges.push({ id: `e-${selectedNodeId}-${newNodeId}`, source: selectedNodeId, target: newNodeId, sourceHandle: 'bottom', targetHandle: 'top', data: { type: 'child' } });
        const partners = edges.filter(e => e.data?.type === 'partner' && (e.source === selectedNodeId || e.target === selectedNodeId));
        if (partners.length === 1) {
          const partnerId = partners[0].source === selectedNodeId ? partners[0].target : partners[0].source;
          newEdges.push({ id: `e-${partnerId}-${newNodeId}`, source: partnerId, target: newNodeId, sourceHandle: 'bottom', targetHandle: 'top', data: { type: 'child' } });
        }
      } 
      else if (relationType === 'parent') {
        newEdges.push({ id: `e-${newNodeId}-${selectedNodeId}`, source: newNodeId, target: selectedNodeId, sourceHandle: 'bottom', targetHandle: 'top', data: { type: 'child' } });
      } 
      else if (relationType === 'partner') {
        // EŞLER YATAY BAĞLANIR (RIGHT -> LEFT)
        newEdges.push({ id: `e-${selectedNodeId}-${newNodeId}`, source: selectedNodeId, target: newNodeId, sourceHandle: 'right', targetHandle: 'left', data: { type: 'partner' } });
        const childrenEdges = edges.filter(e => e.source === selectedNodeId && e.data?.type === 'child');
        childrenEdges.forEach(ce => {
          newEdges.push({ id: `e-${newNodeId}-${ce.target}`, source: newNodeId, target: ce.target, sourceHandle: 'bottom', targetHandle: 'top', data: { type: 'child' } });
        });
      }
    }

    set({ nodes: [...nodes, newNode], edges: newEdges, activeModal: null, selectedNodeId: null, relationType: null });
  },
  
  editPerson: (id, data) => {
    set(state => ({ nodes: state.nodes.map(node => node.id === id ? { ...node, data: { ...node.data, ...data } } : node), activeModal: null }));
  },
  
  deletePerson: (id) => {
    set(state => ({ nodes: state.nodes.filter(n => n.id !== id), edges: state.edges.filter(e => e.source !== id && e.target !== id) }));
  },

  handleManualConnect: (connection) => {
    const { edges } = get();
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return;

    let newEdges = [...edges];
    
    // Sağ-Sol noktalarından bağlandıysa "eş", Alt-Üst noktalarından bağlandıysa "çocuk" say
    const isPartner = sourceHandle === 'right' || sourceHandle === 'left' || targetHandle === 'left' || targetHandle === 'right';
    const edgeType = isPartner ? 'partner' : 'child';

    const edgeExists = newEdges.some(e => e.source === source && e.target === target);
    if (!edgeExists) {
      newEdges.push({ ...connection, id: `e-${source}-${target}`, data: { type: edgeType } });
    }

    if (edgeType === 'child') {
      const partners = edges.filter(e => e.data?.type === 'partner' && (e.source === source || e.target === source));
      if (partners.length === 1) {
        const partnerId = partners[0].source === source ? partners[0].target : partners[0].source;
        const partnerEdgeExists = newEdges.some(e => e.source === partnerId && e.target === target);
        if (!partnerEdgeExists) {
          newEdges.push({ id: `e-${partnerId}-${target}`, source: partnerId, target: target, sourceHandle: 'bottom', targetHandle: 'top', data: { type: 'child' } });
        }
      }
    }
    
    set({ edges: newEdges });
  },
  
  loadFromJSON: (data) => set({ nodes: data.nodes || [], edges: data.edges || [], treeName: data.treeName || '', isTreeActive: true }),
  resetTree: () => set({ nodes: [], edges: [], treeName: '', isTreeActive: false })
}));
