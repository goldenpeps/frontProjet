'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute, SearchBar } from '@/components';
import { Navbar } from '@/components/Navbar';
import { TerrainType, terrainTypeService } from '@/services';
import styles from '../admin.module.css';
import { TypesTerrainsCards, TypesTerrainsTable } from './TypesTerrainsDisplay';
import {
  emptyTypeTerrainForm,
  filterTypesTerrains,
  toTypeTerrainFormData,
  TypeTerrainFormData,
} from './typesTerrainsUtils';
import { useTypesTerrainsData } from './useTypesTerrainsData';

function TypesTerrainsContent() {
  const {
    typesTerrains,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchTypesTerrains,
    clearMessages,
  } = useTypesTerrainsData();

  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<TerrainType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<TypeTerrainFormData>(emptyTypeTerrainForm);

  const [confirmType, setConfirmType] = useState<TerrainType | null>(null);

  const filteredTypes = useMemo(() => {
    return filterTypesTerrains(typesTerrains, searchTerm);
  }, [typesTerrains, searchTerm]);

  const handleCreate = () => {
    clearMessages();
    setEditingType(null);
    setFormError('');
    setFormData(emptyTypeTerrainForm);
    setShowModal(true);
  };

  const handleEdit = (typeTerrain: TerrainType) => {
    clearMessages();
    setEditingType(typeTerrain);
    setFormError('');
    setFormData(toTypeTerrainFormData(typeTerrain));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!formData.nom.trim()) {
      setFormError('Le nom du type de terrain est obligatoire');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
      };

      if (editingType) {
        await terrainTypeService.update(editingType.id, payload);
        setSuccessMsg('Type de terrain modifié avec succès');
      } else {
        await terrainTypeService.create(payload);
        setSuccessMsg('Type de terrain créé avec succès');
      }

      setShowModal(false);
      await fetchTypesTerrains();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (typeTerrain: TerrainType) => {
    setConfirmType(null);
    try {
      await terrainTypeService.remove(typeTerrain.id);
      setSuccessMsg('Type de terrain supprimé avec succès');
      await fetchTypesTerrains();
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
            <h1 className={styles.title}>Types de terrain</h1>
            <p className={styles.subtitle}>{filteredTypes.length} type{filteredTypes.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouveau type
          </button>
        </div>

        <SearchBar
          label="Rechercher un type"
          placeholder="Nom, description ou ID"
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
            <TypesTerrainsTable
              typesTerrains={filteredTypes}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmType}
            />

            <TypesTerrainsCards
              typesTerrains={filteredTypes}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmType}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingType ? 'Modifier le type de terrain' : 'Nouveau type de terrain'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nom *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formInput}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
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
            <p className={styles.confirmText}>Supprimer le type #{confirmType.id} ({confirmType.nom}) ?</p>
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

export default function TypesTerrainsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <TypesTerrainsContent />
    </ProtectedRoute>
  );
}
