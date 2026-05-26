'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { Devis, devisService } from '@/services';
import styles from '../admin.module.css';
import { DevisCards, DevisTable } from './DevisDisplay';
import {
  DevisFormData,
  emptyDevisForm,
  STATUS_OPTIONS,
  toDevisFormData,
  toNullableNumber,
} from './devisUtils';
import { useDevisData } from './useDevisData';

function DevisContent() {
  const {
    devis,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchDevis,
    clearMessages,
  } = useDevisData();

  const [showModal, setShowModal] = useState(false);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [formData, setFormData] = useState<DevisFormData>(emptyDevisForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmCancel, setConfirmCancel] = useState<Devis | null>(null);

  const handleCreate = () => {
    clearMessages();
    setEditingDevis(null);
    setFormData(emptyDevisForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (item: Devis) => {
    clearMessages();
    setEditingDevis(item);
    setFormData(toDevisFormData(item));
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');

    const montantTotal = Number(formData.montant_total);
    const clientId = Number(formData.client_id);

    if (!formData.date_creation || Number.isNaN(montantTotal) || montantTotal < 0 || Number.isNaN(clientId) || clientId <= 0) {
      setFormError('Date, montant total et identifiant client sont obligatoires');
      return;
    }

    const payload = {
      date_creation: formData.date_creation,
      montant_total: montantTotal,
      status: formData.status,
      client_id: clientId,
      intervention_id: toNullableNumber(formData.intervention_id),
    };

    setFormLoading(true);
    try {
      if (editingDevis) {
        await devisService.update(editingDevis.id, payload);
        setSuccessMsg('Devis modifié avec succès');
      } else {
        await devisService.create(payload);
        setSuccessMsg('Devis créé avec succès');
      }

      setShowModal(false);
      fetchDevis();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (item: Devis) => {
    setConfirmCancel(null);
    try {
      await devisService.cancel(item.id);
      setSuccessMsg(`Devis #${item.id} annulé`);
      fetchDevis();
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
            <h1 className={styles.title}>Gestion des devis</h1>
            <p className={styles.subtitle}>{devis.length} devis</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouveau devis
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <DevisTable devis={devis} onEdit={handleEdit} onCancelRequest={setConfirmCancel} />

            <DevisCards devis={devis} onEdit={handleEdit} onCancelRequest={setConfirmCancel} />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingDevis ? 'Modifier le devis' : 'Nouveau devis'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date de création *</label>
                <input
                  className={styles.formInput}
                  type="date"
                  value={formData.date_creation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date_creation: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Montant total *</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.01"
                  value={formData.montant_total}
                  onChange={(e) => setFormData((prev) => ({ ...prev, montant_total: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Client ID *</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={formData.client_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client_id: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Intervention ID</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={formData.intervention_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, intervention_id: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Statut</label>
                <select
                  className={styles.formInput}
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingDevis ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className={styles.overlay} onClick={() => setConfirmCancel(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Annuler le devis #{confirmCancel.id} ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmCancel(null)}>
                Retour
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleCancel(confirmCancel)}>
                Annuler le devis
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DevisPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <DevisContent />
    </ProtectedRoute>
  );
}
