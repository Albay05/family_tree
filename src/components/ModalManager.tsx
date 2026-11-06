import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useTreeStore } from '../store/treeStore';
import type { Gender } from '../types/tree';
import { Check, X } from 'lucide-react';

export default function ModalManager() {
  const { activeModal, closeModal, selectedNodeId, relationType, nodes, treeName, addPerson, editPerson, openModal, previewImageUrl, setPreviewImageUrl, language, rfInstance } = useTreeStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [note, setNote] = useState('');
  const [gender, setGender] = useState<Gender>('M');

  useEffect(() => {
    if (activeModal === 'EDIT' && selectedNodeId) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node) {
        setFirstName(node.data.firstName || ''); setLastName(node.data.lastName || '');
        setBirthDate(node.data.birthDate || ''); setDeathDate(node.data.deathDate || '');
        setBirthPlace(node.data.birthPlace || ''); setNote(node.data.note || '');
        setGender(node.data.gender || 'M');
      }
    } else if (activeModal === 'ADD') {
      setFirstName(''); setLastName(''); setBirthDate(''); setDeathDate('');
      setBirthPlace(''); setNote(''); 
      let defaultGender: Gender = 'M';
      if (relationType === 'partner' && selectedNodeId) {
        const parentNode = nodes.find(n => n.id === selectedNodeId);
        if (parentNode) defaultGender = parentNode.data.gender === 'M' ? 'F' : 'M';
      }
      setGender(defaultGender);
    }
  }, [activeModal, selectedNodeId, relationType, nodes]);

  if (!activeModal) return null;

  const handleSaveModal = () => {
    if (!firstName.trim()) return;
    
    // TARİH KONTROLÜ
    if (birthDate && deathDate && new Date(deathDate) < new Date(birthDate)) {
      alert(language === 'tr' ? 'Ölüm tarihi, doğum tarihinden önce olamaz!' : 'Death date cannot be earlier than birth date!');
      return;
    }

    const payload = { firstName, lastName, birthDate, deathDate, birthPlace, note, gender };
    if (activeModal === 'EDIT' && selectedNodeId) editPerson(selectedNodeId, payload);
    else if (activeModal === 'ADD') addPerson(payload);
    closeModal();
  };

  const getDefaultFileName = () => treeName || (language === 'tr' ? 'soy_agaci' : 'family_tree');

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ treeName, nodes, edges: useTreeStore.getState().edges }, null, 2));
    const a = document.createElement('a'); 
    a.href = dataStr; 
    a.download = `${getDefaultFileName()}.json`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    closeModal();
  };

  const handleExportImage = () => {
    closeModal();
    
    // FOTOĞRAF ÇEKMEDEN ÖNCE İDEAL ZOOM (FIT VIEW) YAP
    if (rfInstance) {
      rfInstance.fitView({ padding: 0.15, duration: 250 });
    }

    // Animasyonun bitmesini bekleyip çizgilerin netleşmesini sağlayarak çekim yap
    setTimeout(async () => {
      const reactFlowEl = document.querySelector('.react-flow') as HTMLElement;
      const uiPanels = document.querySelectorAll('.react-flow__panel');
      uiPanels.forEach(p => ((p as HTMLElement).style.visibility = 'hidden'));
      
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const canvas = await html2canvas(reactFlowEl, { 
        backgroundColor: isDark ? '#0f172a' : '#f8fafc', 
        scale: 2,
        useCORS: true // Çizgilerin (SVG) çizim hatasını önler
      });
      
      uiPanels.forEach(p => ((p as HTMLElement).style.visibility = 'visible'));
      setPreviewImageUrl(canvas.toDataURL('image/png'));
      openModal('PREVIEW');
    }, 400); 
  };

  const getPlaceholderName = () => gender === 'M' ? (language === 'tr' ? 'Ahmet' : 'John') : (language === 'tr' ? 'Ayşe' : 'Jane');
  const getPlaceholderLast = () => language === 'tr' ? 'Yılmaz' : 'Doe';
  const getPlaceholderNote = () => language === 'tr' ? 'Aile geçmişi, unvan veya notlar...' : 'Family history, titles, or notes...';
  const getPlaceholderPlace = () => language === 'tr' ? 'İstanbul' : 'London';

  return (
    <>
      {(activeModal === 'ADD' || activeModal === 'EDIT') && (
        <div className="modal">
          <div className="modal-content glass-panel">
            <h2>{activeModal === 'EDIT' ? (language === 'tr' ? 'Kişiyi Düzenle' : 'Edit Person') : (language === 'tr' ? 'Kişi Bilgileri' : 'Person Details')}</h2>
            <div className="gender-toggle">
              <button type="button" className={`gender-btn ${gender === 'M' ? 'active male' : ''}`} onClick={() => setGender('M')}>{language === 'tr' ? 'Erkek' : 'Male'}</button>
              <button type="button" className={`gender-btn ${gender === 'F' ? 'active female' : ''}`} onClick={() => setGender('F')}>{language === 'tr' ? 'Kadın' : 'Female'}</button>
            </div>
            
            <div className="form-row">
              <div className="input-field"><label>{language === 'tr' ? 'İsim' : 'First Name'} *</label><input type="text" placeholder={getPlaceholderName()} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus /></div>
              <div className="input-field"><label>{language === 'tr' ? 'Soyisim' : 'Last Name'}</label><input type="text" placeholder={getPlaceholderLast()} value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
            
            <div className="form-row">
              <div className="input-field"><label>{language === 'tr' ? 'Doğum Tarihi' : 'Birth Date'}</label><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></div>
              <div className="input-field"><label>{language === 'tr' ? 'Vefat Tarihi' : 'Death Date'}</label><input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} /></div>
            </div>
            
            <div className="input-field"><label>{language === 'tr' ? 'Doğum Yeri' : 'Birth Place'}</label><input type="text" placeholder={getPlaceholderPlace()} value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} /></div>
            <div className="input-field"><label>{language === 'tr' ? 'Ek Notlar' : 'Notes'}</label><textarea placeholder={getPlaceholderNote()} rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
            
            <div className="modal-actions">
              <button className="btn secondary" onClick={closeModal}><X size={16} /> {language === 'tr' ? 'İptal' : 'Cancel'}</button>
              <button className="btn success" onClick={handleSaveModal}><Check size={16} /> {language === 'tr' ? 'Kaydet' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'SAVE' && (
        <div className="modal">
          <div className="modal-content glass-panel" style={{ textAlign: 'center' }}>
            <h2>{language === 'tr' ? 'Ağacı Kaydet' : 'Save Tree'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <button className="btn primary" onClick={handleExportJSON}>{language === 'tr' ? 'JSON Olarak Kaydet (.json)' : 'Save as JSON (.json)'}</button>
              <button className="btn success" onClick={handleExportImage}>{language === 'tr' ? 'Fotoğraf Olarak İndir (.png)' : 'Download as Image (.png)'}</button>
              <button className="btn secondary" onClick={closeModal}>{language === 'tr' ? 'Vazgeç' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'PREVIEW' && (
        <div className="modal">
          <div className="modal-content glass-panel" style={{ maxWidth: '700px' }}>
            <h2>{language === 'tr' ? 'Görsel Önizleme' : 'Image Preview'}</h2>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--input-border)', maxHeight: '60vh' }}>
              <img src={previewImageUrl} alt="Preview" style={{ width: '100%', display: 'block' }} />
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '12px' }}>
              <button className="btn success" onClick={() => {
                const a = document.createElement('a'); 
                a.href = previewImageUrl; 
                a.download = `${getDefaultFileName()}.png`; 
                a.click();
              }}>{language === 'tr' ? 'Cihaza Kaydet' : 'Save to Device'}</button>
              <button className="btn danger" onClick={closeModal}>{language === 'tr' ? 'Kapat' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
