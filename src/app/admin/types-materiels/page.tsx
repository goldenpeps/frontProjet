'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { TypeMateriel, typeMaterielService } from '@/services';
import styles from '../admin.module.css';
import { TypesMaterielsCards, TypesMaterielsTable } from './TypesMaterielsDisplay';
import {
  emptyTypeMaterielForm,
  filterTypeMateriels,
  toTypeMaterielFormData,
  TypeMaterielFormData,
} from './typesMaterielsUtils';
import { useTypesMaterielsData } from './useTypesMaterielsData';

function TypesMaterielsContent() {
  const {
    typesMateriels,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchTypesMateriels,
    clearMessages,
  } = useTypesMaterielsData();

  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<TypeMateriel | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<TypeMaterielFormData>(emptyTypeMaterielForm);

  const [confirmType, setConfirmType] = useState<TypeMateriel | null>(null);

  const filteredTypes = useMemo(() => {
    return filterTypeMateriels(typesMateriels, searchTerm);
  }, [typesMateriels, searchTerm]);

  const handleCreate = () => {
    clearMessages();
    setEditingType(null);
    setFormError('');
    setFormData(emptyTypeMaterielForm);
    setShowModal(true);
  };

  const handleEdit = (typeMateriel: TypeMateriel) => {
    clearMessages();
    setEditingType(typeMateriel);
    setFormError('');
    setFormData(toTypeMaterielFormData(typeMateriel));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!formData.libelle.trim()) {
      setFormError('Le libellé est obligatoire');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        libelle: formData.libelle.trim(),
        transportable: formData.transportable,
      };

      if (editingType) {
        await typeMaterielService.update(editingType.id, payload);
        setSuccessMsg('Type de matériel modifié avec succès');
      } else {
        await typeMaterielService.create(payload);
        setSuccessMsg('Type de matériel créé avec succès');
      }

      setShowModal(false);
      await fetchTypesMateriels();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (typeMateriel: TypeMateriel) => {
    setConfirmType(null);
    try {
      await typeMaterielService.remove(typeMateriel.id);
      setSuccessMsg('Type de matériel supprimé avec succès');
      await fetchTypesMateriels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Types de matériel</h1>
            <p className={styles.subtitle}>{filteredTypes.length} type{filteredTypes.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouveau type
          </button>
        </div>

        <div className={styles.formGroup + ' ' + styles.formGroupFull} style={{ marginBottom: '16px' }}>
          <label className={styles.formLabel}>Rechercher un type</label>
          <input
            className={styles.formInput}
            type="text"
            placeholder="Libellé, transportable ou ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <TypesMaterielsTable
              typesMateriels={filteredTypes}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmType}
            />

            <TypesMaterielsCards
              typesMateriels={filteredTypes}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmType}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingType ? 'Modifier le type de matériel' : 'Nouveau type de matériel'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Libellé *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.libelle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, libelle: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Transportable *</label>
                <select
                  className={styles.formInput}
                  value={formData.transportable ? '1' : '0'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, transportable: e.target.value === '1' }))}
                >
                  <option value="1">Oui (petit)</option>
                  <option value="0">Non (grand)</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingType ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmType && (
        <div className={styles.overlay} onClick={() => setConfirmType(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Supprimer le type #{confirmType.id} ({confirmType.libelle}) ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmType(null)}>
                Annuler
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleDelete(confirmType)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TypesMaterielsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <TypesMaterielsContent />
    </ProtectedRoute>
  );
}
