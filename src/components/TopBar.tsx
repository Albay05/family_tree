import { useTreeStore } from '../store/treeStore';
import { ChevronLeft, Save, Moon, Sun, Pencil } from 'lucide-react';

export default function TopBar() {
  const { treeName, setTreeName, isDarkTheme, setDarkTheme, resetTree, openModal, nodes } = useTreeStore();

  return (
    <div id="ui-controls">
      {/* Sol Kapsül: Geri Dönüş ve İsim */}
      <div className="control-pill glass-panel">
        <button 
          className="btn-icon" 
          style={{ border: 'none', background: 'transparent' }} 
          onClick={resetTree}
          title="Ana Ekrana Dön"
        >
          <ChevronLeft size={22} />
        </button>
        
        <div style={{ width: '1px', height: '24px', background: 'var(--input-border)' }}></div>
        
        {/* KALEM İKONLU INPUT SARMALAYICI */}
        <div className="tree-name-wrapper">
          <input 
            type="text" 
            className="tree-name" 
            value={treeName} 
            onChange={(e) => setTreeName(e.target.value)} 
            placeholder="Soy Ağacı Adı"
          />
          <Pencil size={14} className="edit-icon-input" />
        </div>
      </div>

      {/* Sağ Kapsül: Tema ve Kaydetme */}
      <div className="control-pill glass-panel">
        <button 
          className="btn-icon" 
          style={{ border: 'none', background: 'transparent' }} 
          onClick={() => setDarkTheme(!isDarkTheme)}
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          className="btn primary" 
          onClick={() => openModal('SAVE')}
          disabled={nodes.length === 0}
          style={{ padding: '8px 16px', borderRadius: '12px' }}
        >
          <Save size={18} /> Ağacı Kaydet
        </button>
      </div>
    </div>
  );
}