import { useEffect } from 'react';
import ReactFlow, { Background, BackgroundVariant, Controls, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { useTreeStore } from './store/treeStore';
import IntroScreen from './components/IntroScreen';
import PersonNodeComponent from './components/PersonNode';
import TopBar from './components/TopBar';
import ModalManager from './components/ModalManager';
import { Plus } from 'lucide-react';

const nodeTypes = { person: PersonNodeComponent };

export default function App() {
  const { isTreeActive, isDarkTheme, nodes, edges, updateNodes, updateEdges, openModal, handleManualConnect, language } = useTreeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const onNodesChange = (changes: any) => updateNodes(applyNodeChanges(changes, nodes));
  const onEdgesChange = (changes: any) => updateEdges(applyEdgeChanges(changes, edges));

  if (!isTreeActive) return <IntroScreen />;
  const isTreeEmpty = nodes.length === 0;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <TopBar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleManualConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        panOnDrag={!isTreeEmpty}
        zoomOnScroll={!isTreeEmpty}
        zoomOnPinch={!isTreeEmpty}
        zoomOnDoubleClick={!isTreeEmpty}
      >
        <Background variant={BackgroundVariant.Dots} color={isDarkTheme ? '#64748b' : '#94a3b8'} gap={24} size={2.5} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {isTreeEmpty && (
        <div className="null-node-card glass-panel" onClick={(e) => { e.stopPropagation(); openModal('ADD', null); }}>
          <div className="null-node-icon"><Plus size={32} /></div>
          <h3>{language === 'tr' ? 'Soy Ağacınızı Başlatın' : 'Start Your Family Tree'}</h3>
          <p>{language === 'tr' ? 'Ağacınıza ilk kişiyi eklemek ve köklerinizi oluşturmak için buraya tıklayın.' : 'Click here to add the first person and build your roots.'}</p>
        </div>
      )}

      <ModalManager />
    </div>
  );
}
