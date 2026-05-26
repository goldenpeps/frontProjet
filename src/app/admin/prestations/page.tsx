'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { Prestation, prestationService } from '@/services';
import styles from '../admin.module.css';

interface PrestationsFormData {
  nom: string;
  description: string;
  prix_unitaire: string;
}

const emptyForm: PrestationsFormData = {
  nom: '',
  description: '',
  prix_unitaire: '',
};

function PrestationsContent() {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPrestation, setEditingPrestation] = useState<Prestation | null>(null);
  const [formData, setFormData] = useState<PrestationsFormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmPrestation, setConfirmPrestation] = useState<Prestation | null>(null);

  const fetchPrestations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await prestationService.getAll();
      setPrestations(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrestations();
  }, [fetchPrestations]);

  const clearMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleCreate = () => {
    clearMessages();
    setEditingPrestation(null);
    setFormData(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (prestation: Prestation) => {
    clearMessages();
    setEditingPrestation(prestation);
    setFormData({
      nom: prestation.nom,
      description: prestation.description || '',
      prix_unitaire: String(prestation.prix_unitaire ?? ''),
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    const prix = Number(formData.prix_unitaire);

    if (!formData.nom || Number.isNaN(prix) || prix < 0) {
      setFormError('Nom et prix unitaire valide sont obligatoires');
      return;
    }

    const payload = {
      nom: formData.nom,
      description: formData.description,
      prix_unitaire: prix,
    };

    setFormLoading(true);
    try {
      if (editingPrestation) {
        await prestationService.update(editingPrestation.id, payload);
        setSuccessMsg('Prestation modifiée avec succès');
      } else {
        await prestationService.create(payload);
        setSuccessMsg('Prestation créée avec succès');
      }

      setShowModal(false);
      fetchPrestations();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (prestation: Prestation) => {
    setConfirmPrestation(null);
    try {
      await prestationService.remove(prestation.id);
      setSuccessMsg('Prestation supprimée avec succès');
      fetchPrestations();
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
            <h1 className={styles.title}>Types de prestation</h1>
            <p className={styles.subtitle}>{prestations.length} prestation{prestations.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouvelle prestation
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prix unitaire</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prestations.map((prestation) => (
                    <tr key={prestation.id}>
                      <td>{prestation.id}</td>
                      <td><span className={styles.userName}>{prestation.nom}</span></td>
                      <td>{Number(prestation.prix_unitaire).toFixed(2)} €</td>
                      <td>{prestation.description || '—'}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.btnEdit} onClick={() => handleEdit(prestation)}>
                            Modifier
                          </button>
                          <button className={styles.btnDeactivate} onClick={() => setConfirmPrestation(prestation)}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cardList}>
              {prestations.map((prestation) => (
                <div key={prestation.id} className={styles.userCard}>
                  <div className={styles.userCardHeader}>
                    <span className={styles.userName}>{prestation.nom}</span>
                  </div>
                  <p className={styles.userCardEmail}>{Number(prestation.prix_unitaire).toFixed(2)} €</p>
                  <p className={styles.userCardPhone}>{prestation.description || 'Aucune description'}</p>
                  <div className={styles.userCardActions}>
                    <button className={styles.btnEdit} onClick={() => handleEdit(prestation)}>Modifier</button>
                    <button className={styles.btnDeactivate} onClick={() => setConfirmPrestation(prestation)}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingPrestation ? 'Modifier la prestation' : 'Nouvelle prestation'}</h2>

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
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Prix unitaire *</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.01"
                  value={formData.prix_unitaire}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prix_unitaire: e.target.value }))}
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
                {formLoading ? 'Enregistrement...' : editingPrestation ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmPrestation && (
        <div className={styles.overlay} onClick={() => setConfirmPrestation(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Supprimer la prestation "{confirmPrestation.nom}" ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmPrestation(null)}>
                Annuler
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleDelete(confirmPrestation)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PrestationsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <PrestationsContent />
    </ProtectedRoute>
  );
}
