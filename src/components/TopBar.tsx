import { useTreeStore } from '../store/treeStore';
import { ChevronLeft, Save, Moon, Sun, Pencil, Globe } from 'lucide-react';

export default function TopBar() {
  const { treeName, setTreeName, isDarkTheme, setDarkTheme, resetTree, openModal, nodes, language, setLanguage } = useTreeStore();

  const handleReturnHome = () => {
    if (nodes.length > 0) {
      const confirm = window.confirm(
        language === 'tr' 
          ? "Ağacınız kaydedilmediyse kaybolabilir. Ana menüye dönmek istediğinize emin misiniz?" 
          : "Your tree might be lost if not saved. Are you sure you want to return to the main menu?"
      );
      if (!confirm) return;
    }
    resetTree();
  };

  return (
    <div id="ui-controls">
      {/* 1. SOL KAPSÜL (İsimlendirme ve Geri Dönüş) */}
      <div className="control-pill glass-panel pill-name">
        <button 
          className="btn-icon" 
          style={{ border: 'none', background: 'transparent' }} 
          onClick={handleReturnHome}
          title={language === 'tr' ? 'Ana Ekrana Dön' : 'Back to Home'}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="divider" style={{ width: '1px', height: '24px', background: 'var(--input-border)' }}></div>
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

      {/* 2. SAĞ KAPSÜL (Dil, Tema, Kaydet - Eski Düzen) */}
      <div className="control-pill glass-panel pill-actions">
        <button 
          className="btn-icon" 
          style={{ border: 'none', background: 'transparent', width: 'auto', padding: '0 12px' }} 
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
        >
          <Globe size={18} /> 
          <span className="lang-text" style={{ fontWeight: 600, marginLeft: '6px' }}>{language.toUpperCase()}</span>
        </button>

        <button 
          className="btn-icon" 
          style={{ border: 'none', background: 'transparent' }} 
          onClick={() => setDarkTheme(!isDarkTheme)}
          title={language === 'tr' ? 'Tema Değiştir' : 'Toggle Theme'}
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          className="btn primary save-btn" 
          onClick={() => openModal('SAVE')} 
          disabled={nodes.length === 0} 
        >
          <Save size={18} /> 
          <span className="save-text" style={{ marginLeft: '6px' }}>{language === 'tr' ? 'Ağacı Kaydet' : 'Save Tree'}</span>
        </button>
      </div>
    </div>
  );
}
