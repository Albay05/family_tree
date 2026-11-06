import { useTreeStore } from '../store/treeStore';
import { UserPlus, GitMerge, Pencil, Settings, Save, Search, ChevronRight, X } from 'lucide-react';

export default function Tutorial() {
  const { isTutorialActive, tutorialStep, nextTutorialStep, prevTutorialStep, skipTutorial, language } = useTreeStore();

  if (!isTutorialActive) return null;

  const steps = [
    {
      icon: <UserPlus size={32} style={{ color: 'var(--btn-primary-from)' }}/>,
      titleTr: 'Kişi Ekleme',
      descTr: 'Ağacınıza ilk kişiyi eklemek için ekranın ortasındaki veya sağ alt köşedeki "+" butonunu kullanabilirsiniz.',
      titleEn: 'Adding People',
      descEn: 'Use the "+" button in the center or bottom right to add people to your tree.'
    },
    {
      icon: <GitMerge size={32} style={{ color: 'var(--btn-primary-from)' }}/>,
      titleTr: 'Bağlantı Kurma',
      descTr: 'Kişileri birbirine bağlamak için kartlardaki renkli noktalardan basılı tutup diğerine sürükleyin. (Pembe = Eş, Mavi = Çocuk/Ebeveyn)',
      titleEn: 'Connecting',
      descEn: 'Drag and drop from the colored dots on the cards to connect people. (Pink = Partner, Blue = Child/Parent)'
    },
    {
      icon: <Pencil size={32} style={{ color: 'var(--btn-primary-from)' }}/>,
      titleTr: 'Ağacı İsimlendirme',
      descTr: 'Sol üst köşedeki metin kutusuna tıklayarak soy ağacınıza özel bir isim verebilirsiniz.',
      titleEn: 'Naming the Tree',
      descEn: 'Click the text box in the top left corner to give your family tree a custom name.'
    },
    {
      icon: <Settings size={32} style={{ color: 'var(--btn-primary-from)' }}/>,
      titleTr: 'Dil ve Tema',
      descTr: 'Sağ üst köşedeki butonlarla arayüz dilini (Türkçe/İngilizce) ve karanlık/aydınlık temayı değiştirebilirsiniz.',
      titleEn: 'Language & Theme',
      descEn: 'Use the top right buttons to change the interface language and toggle dark/light theme.'
    },
    {
      icon: <Save size={32} style={{ color: 'var(--btn-primary-from)' }}/>,
      titleTr: 'Kaydetme ve Dışa Aktarma',
      descTr: 'Ağacınızı yüksek çözünürlüklü bir fotoğraf (.png) veya veri dosyası (.json) olarak cihazınıza kaydedebilirsiniz.',
      titleEn: 'Saving & Exporting',
      descEn: 'Save your tree as a high-resolution image (.png) or a data file (.json) to your device.'
    },
    {
      icon: <Search size={32} style={{ color: 'var(--btn-primary-from)' }}/>,
      titleTr: 'Yakınlaştırma ve Gezinme',
      descTr: 'Ağacınız büyüdüğünde sol alttaki yakınlaştırma araçlarını veya farenizin tekerleğini kullanarak ekranda gezinebilirsiniz.',
      titleEn: 'Zooming & Panning',
      descEn: 'When your tree grows, use the bottom left tools or your mouse wheel to navigate the canvas.'
    }
  ];

  const current = steps[tutorialStep - 1];
  const totalSteps = steps.length;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card glass-panel">
        <button className="tutorial-close" onClick={skipTutorial} title={language === 'tr' ? 'Öğreticiyi Kapat' : 'Close Tutorial'}>
          <X size={18} />
        </button>
        <div className="tutorial-icon-wrapper">
          {current.icon}
        </div>
        <h3>{language === 'tr' ? current.titleTr : current.titleEn}</h3>
        <p>{language === 'tr' ? current.descTr : current.descEn}</p>

        <div className="tutorial-footer">
          <span className="tutorial-step">{tutorialStep} / {totalSteps}</span>
          <div className="tutorial-actions">
            <button className="btn secondary" onClick={tutorialStep === 1 ? skipTutorial : prevTutorialStep} style={{ padding: '6px 12px' }}>
              {tutorialStep === 1 ? (language === 'tr' ? 'Atla' : 'Skip') : (language === 'tr' ? 'Geri' : 'Back')}
            </button>
            <button className="btn primary" onClick={tutorialStep === totalSteps ? skipTutorial : nextTutorialStep} style={{ padding: '6px 12px' }}>
              {tutorialStep === totalSteps ? (language === 'tr' ? 'Bitir' : 'Finish') : <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
