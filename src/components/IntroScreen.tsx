import { useTreeStore } from '../store/treeStore';
import { Plus, FolderOpen, Moon, Sun, Globe } from 'lucide-react';

export default function IntroScreen() {
  const { setTreeActive, startTutorial, isDarkTheme, setDarkTheme, loadFromJSON, language, setLanguage } = useTreeStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = (event.target?.result as string || '').replace(/^\uFEFF/, '');
        loadFromJSON(JSON.parse(rawText));
      } catch (err) {
        alert(language === 'tr' ? 'JSON dosyası okunamadı.' : 'Failed to read JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="intro-screen">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-pattern"></div>

      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, display: 'flex', gap: '10px' }}>
        <button 
          className="btn-icon glass-panel" 
          style={{ width: 'auto', padding: '0 16px', fontWeight: 600 }}
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
        >
          <Globe size={18} style={{ marginRight: '6px' }} /> {language.toUpperCase()}
        </button>
        <button className="btn-icon glass-panel" onClick={() => setDarkTheme(!isDarkTheme)}>
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="intro-card glass-panel">
        <h1>{language === 'tr' ? 'Ailenizin Mirası' : 'Family Legacy'}</h1>
        <p>
          {language === 'tr' 
            ? 'Köklerinizi keşfedin, geçmişten geleceğe uzanan hikayenizi modern bir düzlemde tasarlayıp cihazınızda saklayın.'
            : 'Discover your roots, design your story from past to future on a modern canvas, and save it to your device.'}
        </p>
        <div className="buttons">
          <button 
            className="btn primary" 
            onClick={() => { setTreeActive(true); startTutorial(); }}
          >
            <Plus size={18} /> {language === 'tr' ? 'Yeni Ağaç Oluştur' : 'Create New Tree'}
          </button>
          <label className="btn secondary" style={{ cursor: 'pointer', margin: 0 }}>
            <FolderOpen size={18} /> {language === 'tr' ? 'Mevcut Ağacı Yükle' : 'Load Existing Tree'}
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      
      <div className="footer-credit">
        {language === 'tr' ? (
          <>
            <a href="https://github.com/Albay05" target="_blank" rel="noopener noreferrer">albay05</a> tarafından geliştirildi
          </>
        ) : (
          <>
            developed by <a href="https://github.com/Albay05" target="_blank" rel="noopener noreferrer">albay05</a>
          </>
        )}
      </div>
    </div>
  );
}
