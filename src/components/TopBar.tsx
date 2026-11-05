import { useTreeStore } from '../store/treeStore';
import { ChevronLeft, Save, Moon, Sun, Pencil, Globe } from 'lucide-react';

export default function TopBar() {
  const { treeName, setTreeName, isDarkTheme, setDarkTheme, resetTree, openModal, nodes, language, setLanguage } = useTreeStore();

  return (
    <div id="ui-controls">
      <div className="control-pill glass-panel">
        <button className="btn-icon" style={{ border: 'none', background: 'transparent' }} onClick={resetTree}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ width: '1px', height: '24px', background: 'var(--input-border)' }}></div>
        <div className="tree-name-wrapper">
          <input 
            type="text" 
            className="tree-name" 
            value={treeName} 
            onChange={(e) => setTreeName(e.target.value)} 
            placeholder={language === 'tr' ? 'Soy Ağacı Adı' : 'Family Tree Name'}
          />
          <Pencil size={14} className="edit-icon-input" />
        </div>
      </div>

      <div className="control-pill glass-panel right-controls">
        <button className="btn-icon" style={{ border: 'none', background: 'transparent' }} onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}>
          <Globe size={18} style={{ marginRight: '4px' }} /> <span className="lang-text">{language.toUpperCase()}</span>
        </button>
        <button className="btn-icon" style={{ border: 'none', background: 'transparent' }} onClick={() => setDarkTheme(!isDarkTheme)}>
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="btn primary" onClick={() => openModal('SAVE')} disabled={nodes.length === 0} style={{ padding: '8px 16px', borderRadius: '12px' }}>
          <Save size={18} /> <span className="save-text">{language === 'tr' ? 'Ağacı Kaydet' : 'Save Tree'}</span>
        </button>
      </div>
    </div>
  );
}
