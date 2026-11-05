import { Handle, Position } from 'reactflow';
import { useTreeStore } from '../store/treeStore';
import type { PersonData } from '../types/tree';
import { Pencil, Trash2, Info, Plus } from 'lucide-react';

export default function PersonNodeComponent({ id, data }: { id: string; data: PersonData }) {
  const { openModal, deletePerson, language } = useTreeStore();
  const birthYear = data.birthDate ? data.birthDate.split('-')[0] : '?';
  const deathYear = data.deathDate ? data.deathDate.split('-')[0] : '';
  const dateText = (data.birthDate || data.deathDate) ? `${birthYear} - ${deathYear}` : '';

  return (
    <div className="person-card glass-panel" style={{ position: 'relative' }}>
      {/* EBEVEYN - ÇOCUK BAĞLANTILARI İÇİN DİKEY NOKTALAR */}
      <Handle type="target" position={Position.Top} id="top" style={{ background: 'var(--btn-primary-from)', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: 'var(--btn-primary-from)', width: 8, height: 8 }} />
      
      {/* EŞ BAĞLANTILARI İÇİN YATAY NOKTALAR (PEMBE RENKTE) */}
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#ec4899', width: 8, height: 8, borderRadius: '4px' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#ec4899', width: 8, height: 8, borderRadius: '4px' }} />

      <div className="node-plus-menu">
        <div className="plus-btn"><Plus size={18} /></div>
        <div className="plus-options">
          <div className="plus-options-inner glass-panel">
            <button onClick={() => openModal('ADD', id, 'parent')}>{language === 'tr' ? 'Ebeveyn Ekle' : 'Add Parent'}</button>
            <button onClick={() => openModal('ADD', id, 'partner')}>{language === 'tr' ? 'Eş Ekle' : 'Add Partner'}</button>
            <button onClick={() => openModal('ADD', id, 'child')}>{language === 'tr' ? 'Çocuk Ekle' : 'Add Child'}</button>
          </div>
        </div>
      </div>

      <div className="card-header">
        {data.note ? <div className="info-wrapper"><Info size={14} /><div className="note-tooltip">{data.note}</div></div> : <div />}
        <div className="header-actions">
          <button className="action-btn edit" onClick={() => openModal('EDIT', id)} title={language === 'tr' ? 'Düzenle' : 'Edit'}><Pencil size={14} /></button>
          <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); deletePerson(id); }} title={language === 'tr' ? 'Sil' : 'Delete'}><Trash2 size={14} /></button>
        </div>
      </div>

      <h3><span className={`gender-indicator gender-${data.gender}`} />{data.firstName} {data.lastName}</h3>
      {dateText && <p className="card-date">{dateText}</p>}
      {data.birthPlace && <p className="card-place"><i>{data.birthPlace}</i></p>}
    </div>
  );
}
