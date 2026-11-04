import { Handle, Position } from 'reactflow';
import { useTreeStore } from '../store/treeStore';
import type { PersonData } from '../types/tree';
import { Pencil, Trash2, Info, Plus } from 'lucide-react';

export default function PersonNodeComponent({ id, data }: { id: string; data: PersonData }) {
  const { openModal, deletePerson } = useTreeStore();

  const birthYear = data.birthDate ? data.birthDate.split('-')[0] : '?';
  const deathYear = data.deathDate ? data.deathDate.split('-')[0] : '';
  const dateText = (data.birthDate || data.deathDate) ? `${birthYear} - ${deathYear}` : '';

  return (
    <div className="person-card glass-panel" style={{ position: 'relative' }}>
      {/* React Flow Bağlantı Noktaları */}
      <Handle type="target" position={Position.Top} style={{ background: 'var(--btn-primary-from)', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--btn-primary-from)', width: 8, height: 8 }} />
      {/* Partner connection handles */}
      <Handle type="target" position={Position.Left} id="partner-target" style={{ background: 'var(--btn-primary-from)', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} id="partner-source" style={{ background: 'var(--btn-primary-from)', width: 8, height: 8 }} />

      {/* ARTI (+) MENÜSÜ - PURE CSS HOVER (JavaScript gecikmesi yok) */}
      <div className="node-plus-menu">
        <div className="plus-btn">
          <Plus size={18} />
        </div>
        
        {/* KÖPRÜ GÖREVİ GÖREN KAPSAYICI (Boşluğu doldurur) */}
        <div className="plus-options">
          {/* ASIL GÖRÜNEN KUTU */}
          <div className="plus-options-inner glass-panel">
            <button onClick={() => openModal('ADD', id, 'parent')}>Ebeveyn Ekle</button>
            <button onClick={() => openModal('ADD', id, 'partner')}>Eş Ekle</button>
            <button onClick={() => openModal('ADD', id, 'child')}>Çocuk Ekle</button>
          </div>
        </div>
      </div>

      <div className="card-header">
        {data.note ? (
          <div className="info-wrapper">
            <Info size={14} />
            <div className="note-tooltip">{data.note}</div>
          </div>
        ) : <div />}
        <div className="header-actions">
          <button className="action-btn edit" onClick={() => openModal('EDIT', id)} title="Düzenle">
            <Pencil size={14} />
          </button>
          <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); deletePerson(id); }} title="Sil">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3>
        <span className={`gender-indicator gender-${data.gender}`} />
        {data.firstName} {data.lastName}
      </h3>
      {dateText && <p className="card-date">{dateText}</p>}
      {data.birthPlace && <p className="card-place"><i>{data.birthPlace}</i></p>}
    </div>
  );
}