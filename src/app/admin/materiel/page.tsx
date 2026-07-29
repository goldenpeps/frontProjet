'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute, SearchBar } from '@/components';
import { Navbar } from '@/components/Navbar';
import { Materiel, materielService } from '@/services';
import styles from '../admin.module.css';
import { MaterielCards, MaterielTable } from './MaterielDisplay';
import {
  emptyMaterielForm,
  filterMateriel,
  MaterielFormData,
  toMaterielFormData,
  toNullableNumber,
} from './materielUtils';
import { useMaterielData } from './useMaterielData';

function MaterielContent() {
  const {
    materiels,
    typeMateriels,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchMateriel,
    clearMessages,
  } = useMaterielData();

  const [showModal, setShowModal] = useState(false);
  const [editingMateriel, setEditingMateriel] = useState<Materiel | null>(null);
  const [formData, setFormData] = useState<MaterielFormData>(emptyMaterielForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmMateriel, setConfirmMateriel] = useState<Materiel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMateriels = useMemo(() => filterMateriel(materiels, searchTerm), [materiels, searchTerm]);

  const handleCreate = () => {
    clearMessages();
    setEditingMateriel(null);
    setFormData(emptyMaterielForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (materiel: Materiel) => {
    clearMessages();
    setEditingMateriel(materiel);
    setFormData(toMaterielFormData(materiel));
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');

    const typeMaterielId = toNullableNumber(formData.type_materiel_id);
    if (typeMaterielId == null || typeMaterielId <= 0) {
      setFormError('Le type de matériel est obligatoire');
      return;
    }

    const payload = {
      disponible: formData.disponible,
      type_materiel_id: typeMaterielId,
    };

    setFormLoading(true);
    try {
      if (editingMateriel) {
        await materielService.update(editingMateriel.id, payload);
        setSuccessMsg('Matériel modifié avec succès');
      } else {
        await materielService.create(payload);
        setSuccessMsg('Matériel créé avec succès');
      }

      setShowModal(false);
      fetchMateriel();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (materiel: Materiel) => {
    setConfirmMateriel(null);
    try {
      await materielService.remove(materiel.id);
      setSuccessMsg('Matériel supprimé avec succès');
      fetchMateriel();
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
            <h1 className={styles.title}>Gestion du matériel</h1>
            <p className={styles.subtitle}>{filteredMateriels.length} élément{filteredMateriels.length > 1 ? 's' : ''} matériel</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouveau matériel
          </button>
        </div>

        <SearchBar
          label="Rechercher un matériel"
          placeholder="Type, disponibilité ou ID"
          value={searchTerm}
          onChange={setSearchTerm}
          wrapperClassName={styles.formGroup + ' ' + styles.formGroupFull}
          labelClassName={styles.formLabel}
          inputClassName={styles.formInput}
        />

        {error && <div className={styles.alertError}>{error}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <MaterielTable
              materiels={filteredMateriels}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmMateriel}
            />

            <MaterielCards
              materiels={filteredMateriels}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmMateriel}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingMateriel ? 'Modifier le matériel' : 'Nouveau matériel'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Disponibilité</label>
                <select
                  className={styles.formInput}
                  value={formData.disponible ? '1' : '0'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, disponible: e.target.value === '1' }))}
                >
                  <option value="1">Disponible</option>
                  <option value="0">Indisponible</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type matériel *</label>
                <select
                  className={styles.formInput}
                  value={formData.type_materiel_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type_materiel_id: e.target.value }))}
                >
                  <option value="">Selectionner un type de matériel</option>
                  {typeMateriels.map((typeMateriel) => (
                    <option key={typeMateriel.id} value={String(typeMateriel.id)}>
                      {typeMateriel.libelle} - transportable: {typeMateriel.transportable ? 'oui' : 'non'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingMateriel ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmMateriel && (
        <div className={styles.overlay} onClick={() => setConfirmMateriel(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Supprimer le matériel #{confirmMateriel.id} ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmMateriel(null)}>
                Annuler
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleDelete(confirmMateriel)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MaterielPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <MaterielContent />
    </ProtectedRoute>
  );
}
