import { useTreeStore } from '../store/treeStore';
import { Plus, FolderOpen, Moon, Sun } from 'lucide-react';

export default function IntroScreen() {
  const { setTreeActive, isDarkTheme, setDarkTheme, loadFromJSON } = useTreeStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = (event.target?.result as string || '').replace(/^\uFEFF/, '');
        const data = JSON.parse(rawText);
        loadFromJSON(data);
      } catch (err) {
        alert('JSON dosyası okunamadı. Lütfen geçerli bir soy ağacı dosyası seçin.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="intro-screen">
      {/* ARKA PLAN EFEKTLERİ */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-pattern"></div>

      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <button 
          className="btn-icon glass-panel" 
          onClick={() => setDarkTheme(!isDarkTheme)}
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="intro-card glass-panel">
        <h1>Ailenizin Mirası</h1>
        <p>
          Köklerinizi keşfedin, geçmişten geleceğe uzanan hikayenizi modern bir düzlemde tasarlayıp cihazınızda saklayın.
        </p>
        
        <div className="buttons">
          <button className="btn primary" onClick={() => setTreeActive(true)}>
            <Plus size={18} /> Yeni Ağaç Oluştur
          </button>
          
          <label className="btn secondary" style={{ cursor: 'pointer', margin: 0 }}>
            <FolderOpen size={18} /> Mevcut Ağacı Yükle
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
      
      {/* BAĞIMSIZ VE TIKLANABİLİR FOOTER */}
      <div className="footer-credit">
        developed by <a href="https://github.com/Albay05" target="_blank" rel="noopener noreferrer">albay05</a>
      </div>
    </div>
  );
}