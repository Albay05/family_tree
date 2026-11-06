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
  rfInstance: any;
  
  // ÖĞRETİCİ (TUTORIAL) STATE'LERİ
  isTutorialActive: boolean;
  tutorialStep: number;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  
  setLanguage: (lang: 'tr' | 'en') => void;
  setDarkTheme: (isDark: boolean) => void;
  setTreeName: (name: string) => void;
  setTreeActive: (active: boolean) => void;
  setRfInstance: (instance: any) => void;
  
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
  rfInstance: null,

  isTutorialActive: false,
  tutorialStep: 1,
  startTutorial: () => set({ isTutorialActive: true, tutorialStep: 1 }),
  nextTutorialStep: () => set((state) => ({ tutorialStep: Math.min(state.tutorialStep + 1, 6) })),
  prevTutorialStep: () => set((state) => ({ tutorialStep: Math.max(state.tutorialStep - 1, 1) })),
  skipTutorial: () => set({ isTutorialActive: false }),

  setLanguage: (lang) => set({ language: lang }),
  setDarkTheme: (isDarkTheme) => set({ isDarkTheme }),
  setTreeName: (treeName) => set({ treeName }),
  setTreeActive: (isTreeActive) => set({ isTreeActive }),
  setRfInstance: (instance) => set({ rfInstance: instance }),
  
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
    const { edges, nodes, language } = get();
    const { source, target, sourceHandle, targetHandle } = connection;
    if (!source || !target) return;

    let newEdges = [...edges];
    const isPartner = sourceHandle === 'right' || sourceHandle === 'left' || targetHandle === 'left' || targetHandle === 'right';
    
    if (isPartner) {
      const sNode = nodes.find(n => n.id === source);
      const tNode = nodes.find(n => n.id === target);
      if (sNode && tNode && sNode.data.gender === tNode.data.gender) {
        alert(language === 'tr' ? 'Aynı cinsiyetteki kişiler eş olarak bağlanamaz.' : 'Same-sex persons cannot be linked as partners.');
        return;
      }
    }

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
  resetTree: () => set({ nodes: [], edges: [], treeName: '', isTreeActive: false, isTutorialActive: false })
}));
