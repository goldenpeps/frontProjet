'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute, SearchBar } from '@/components';
import { Navbar } from '@/components/Navbar';
import {
  HistoriqueTerrain,
  historiqueTerrainService,
} from '@/services';
import styles from '../admin.module.css';
import { HistoriqueTerrainsTable } from './HistoriqueTerrainsDisplay';
import {
  emptyHistoriqueFormData,
  filterHistoriques,
  formatTerrainLabel,
  HistoriqueFormData,
  toHistoriqueFormData,
} from './historiqueTerrainsUtils';
import { useHistoriqueTerrainsData } from './useHistoriqueTerrainsData';

function HistoriqueTerrainsContent() {
  const {
    historiques,
    terrains,
    loading,
    error,
    successMsg,
    refError,
    terrainById,
    setError,
    setSuccessMsg,
    fetchHistoriques,
    clearMessages,
  } = useHistoriqueTerrainsData();

  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingHistorique, setEditingHistorique] = useState<HistoriqueTerrain | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<HistoriqueFormData>(emptyHistoriqueFormData);

  const [confirmHistorique, setConfirmHistorique] = useState<HistoriqueTerrain | null>(null);

  const filteredHistoriques = useMemo(() => {
    return filterHistoriques(historiques, searchTerm, terrainById);
  }, [historiques, searchTerm, terrainById]);

  const handleCreate = () => {
    clearMessages();
    setEditingHistorique(null);
    setFormError('');
    setFormData(emptyHistoriqueFormData);
    setShowModal(true);
  };

  const handleEdit = (historique: HistoriqueTerrain) => {
    clearMessages();
    setEditingHistorique(historique);
    setFormError('');
    setFormData(toHistoriqueFormData(historique));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formData.dateRamassage) {
      setFormError('La date de ramassage est obligatoire');
      return;
    }

    if (!formData.dateTonte) {
      setFormError('La date de tonte est obligatoire');
      return;
    }

    const terrainId = Number(formData.terrainId);
    if (Number.isNaN(terrainId) || terrainId <= 0) {
      setFormError('Le terrain est obligatoire');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ramassage: formData.ramassage,
        tonte: formData.tonte,
        dateRamassage: formData.dateRamassage,
        dateTonte: formData.dateTonte,
        terrainId,
      };

      if (editingHistorique) {
        await historiqueTerrainService.update(editingHistorique.id, payload);
        setSuccessMsg('Historique mis à jour avec succès');
      } else {
        await historiqueTerrainService.create(payload);
        setSuccessMsg('Historique créé avec succès');
      }

      setShowModal(false);
      await fetchHistoriques();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (historique: HistoriqueTerrain) => {
    setConfirmHistorique(null);
    try {
      await historiqueTerrainService.remove(historique.id);
      setSuccessMsg('Historique supprimé avec succès');
      await fetchHistoriques();
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
            <h1 className={styles.title}>Historique terrains</h1>
            <p className={styles.subtitle}>{filteredHistoriques.length} historique{filteredHistoriques.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouvel historique
          </button>
        </div>

        <SearchBar
          label="Rechercher un historique"
          placeholder="ID, terrain, dates, tonte/ramassage"
          value={searchTerm}
          onChange={setSearchTerm}
          wrapperClassName={styles.formGroup + ' ' + styles.formGroupFull}
          labelClassName={styles.formLabel}
          inputClassName={styles.formInput}
        />

        {error && <div className={styles.alertError}>{error}</div>}
        {refError && <div className={styles.alertWarning}>{refError}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <HistoriqueTerrainsTable
            historiques={filteredHistoriques}
            terrainById={terrainById}
            onEdit={handleEdit}
            onDeleteRequest={setConfirmHistorique}
          />
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingHistorique ? 'Modifier historique' : 'Nouvel historique'}</h2>
            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Terrain *</label>
                <select
                  className={styles.formInput}
                  value={formData.terrainId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, terrainId: e.target.value }))}
                >
                  <option value="">Selectionner un terrain</option>
                  {terrains.map((terrain) => (
                    <option key={terrain.id} value={String(terrain.id)}>
                      {formatTerrainLabel(terrain)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date ramassage *</label>
                <input
                  className={styles.formInput}
                  type="date"
                  value={formData.dateRamassage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateRamassage: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date tonte *</label>
                <input
                  className={styles.formInput}
                  type="date"
                  value={formData.dateTonte}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateTonte: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ramassage</label>
                <select
                  className={styles.formInput}
                  value={formData.ramassage ? 'true' : 'false'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, ramassage: e.target.value === 'true' }))}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tonte</label>
                <select
                  className={styles.formInput}
                  value={formData.tonte ? 'true' : 'false'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tonte: e.target.value === 'true' }))}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingHistorique ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmHistorique && (
        <div className={styles.overlay} onClick={() => setConfirmHistorique(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Supprimer l'historique #{confirmHistorique.id} ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmHistorique(null)}>
                Annuler
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleDelete(confirmHistorique)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HistoriqueTerrainsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <HistoriqueTerrainsContent />
    </ProtectedRoute>
  );
}
