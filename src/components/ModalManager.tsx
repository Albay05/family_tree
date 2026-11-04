import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useTreeStore } from '../store/treeStore';
import type { Gender } from '../types/tree';
import { User, Calendar, MapPin, FileText, Check, X } from 'lucide-react';

export default function ModalManager() {
  const {
    activeModal,
    closeModal,
    selectedNodeId,
    nodes,
    treeName,
    addPerson,
    editPerson,
    openModal,
    previewImageUrl,
    setPreviewImageUrl,
  } = useTreeStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [note, setNote] = useState('');
  const [gender, setGender] = useState<Gender>('F');

  useEffect(() => {
    if (activeModal === 'EDIT' && selectedNodeId) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node) {
        setFirstName(node.data.firstName || '');
        setLastName(node.data.lastName || '');
        setBirthDate(node.data.birthDate || '');
        setDeathDate(node.data.deathDate || '');
        setBirthPlace(node.data.birthPlace || '');
        setNote(node.data.note || '');
        setGender(node.data.gender || 'M');
      }
    } else if (activeModal === 'ADD') {
      setFirstName('');
      setLastName('');
      setBirthDate('');
      setDeathDate('');
      setBirthPlace('');
      setNote('');
      setGender('M');
    }
  }, [activeModal, selectedNodeId, nodes]);

  if (!activeModal) return null;

  const handleSaveModal = () => {
    if (!firstName.trim()) return;

    if (activeModal === 'EDIT' && selectedNodeId) {
      editPerson(selectedNodeId, {
        firstName,
        lastName,
        birthDate,
        deathDate,
        birthPlace,
        note,
        gender,
      });
    } else if (activeModal === 'ADD') {
      addPerson({
        firstName,
        lastName,
        birthDate,
        deathDate,
        birthPlace,
        note,
        gender,
      });
    }
    closeModal();
  };

  const handleExportJSON = () => {
    const exportData = {
      treeName,
      nodes: nodes.map((n) => ({
        ...n.data,
        x: n.position.x,
        y: n.position.y,
      })),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${treeName || 'soy_agaci'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    closeModal();
  };

  const handleExportImage = async () => {
    closeModal();
    const reactFlowEl = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowEl) return;

    const uiPanels = document.querySelectorAll('.react-flow__panel');
    uiPanels.forEach(panel => ((panel as HTMLElement).style.visibility = 'hidden'));

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const canvas = await html2canvas(reactFlowEl, {
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      scale: 2,
    });

    uiPanels.forEach(panel => ((panel as HTMLElement).style.visibility = 'visible'));

    const dataUrl = canvas.toDataURL('image/png');
    setPreviewImageUrl(dataUrl);
    openModal('PREVIEW');
  };

  return (
    <>
      {/* KİŞİ EKLE / DÜZENLE MODAL */}
      {(activeModal === 'ADD' || activeModal === 'EDIT') && (
        <div className="modal">
          <div className="modal-content glass-panel">
            <h2>{activeModal === 'EDIT' ? 'Kişiyi Düzenle' : 'Kişi Bilgileri'}</h2>

            {/* CİNSİYET SEÇİMİ (MODERN SEKMELER) */}
            <div className="gender-toggle">
              <button
                type="button"
                className={`gender-btn ${gender === 'M' ? 'active male' : ''}`}
                onClick={() => setGender('M')}
              >
                Erkek
              </button>
              <button
                type="button"
                className={`gender-btn ${gender === 'F' ? 'active female' : ''}`}
                onClick={() => setGender('F')}
              >
                Kadın
              </button>
            </div>

            {/* İSİM VE SOYİSİM */}
            <div className="form-row">
              <div className="input-field">
                <label>İsim *</label>
                <input
                  type="text"
                  placeholder="Ahmet"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="input-field">
                <label>Soyisim</label>
                <input
                  type="text"
                  placeholder="Yılmaz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* DOĞUM VE VEFAT */}
            <div className="form-row">
              <div className="input-field">
                <label>Doğum Tarihi</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="input-field">
                <label>Vefat Tarihi</label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                />
              </div>
            </div>

            {/* DOĞUM YERİ */}
            <div className="input-field">
              <label>Doğum Yeri</label>
              <input
                type="text"
                placeholder="İstanbul"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
              />
            </div>

            {/* EK NOTLAR */}
            <div className="input-field">
              <label>Ek Notlar</label>
              <textarea
                placeholder="Aile geçmişi, unvan veya notlar..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* EYLEM BUTONLARI */}
            <div className="modal-actions">
              <button className="btn secondary" onClick={closeModal}>
                <X size={16} /> İptal
              </button>
              <button className="btn success" onClick={handleSaveModal}>
                <Check size={16} /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KAYDETME MODAL */}
      {activeModal === 'SAVE' && (
        <div className="modal">
          <div className="modal-content glass-panel" style={{ textAlign: 'center' }}>
            <h2>Ağacı Kaydet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Projenizi düzenlemeye devam etmek için JSON formatında veya görsel olarak cihazınıza indirebilirsiniz.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <button className="btn primary" onClick={handleExportJSON}>
                JSON Olarak Kaydet (.json)
              </button>
              <button className="btn success" onClick={handleExportImage}>
                Fotoğraf Olarak İndir (.png)
              </button>
              <button className="btn secondary" onClick={closeModal}>
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÖNİZLEME MODAL */}
      {activeModal === 'PREVIEW' && (
        <div className="modal">
          <div className="modal-content glass-panel" style={{ maxWidth: '700px' }}>
            <h2>Görsel Önizleme</h2>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--input-border)', maxHeight: '60vh' }}>
              <img src={previewImageUrl} alt="Önizleme" style={{ width: '100%', display: 'block' }} />
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '12px' }}>
              <button
                className="btn success"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewImageUrl;
                  a.download = `${treeName || 'soy_agaci'}.png`;
                  a.click();
                }}
              >
                Cihaza Kaydet
              </button>
              <button className="btn danger" onClick={closeModal}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}