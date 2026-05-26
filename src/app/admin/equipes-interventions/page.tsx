'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { AdminUser, EquipeIntervention, equipeInterventionService, userService } from '@/services';
import styles from '../admin.module.css';
import { EquipesCards, EquipesTable } from './EquipesInterventionsDisplay';
import {
  emptyEquipeForm,
  EquipeFormData,
  formatUserLabel,
  toEquipeFormData,
  toggleUserSelection,
} from './equipesInterventionsUtils';
import { useEquipesInterventionsData } from './useEquipesInterventionsData';

function EquipesInterventionsContent() {
  const {
    equipes,
    users,
    usersById,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchData,
    clearMessages,
  } = useEquipesInterventionsData();

  const [showModal, setShowModal] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<EquipeIntervention | null>(null);
  const [formData, setFormData] = useState<EquipeFormData>(emptyEquipeForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmEquipe, setConfirmEquipe] = useState<EquipeIntervention | null>(null);

  const handleCreate = () => {
    clearMessages();
    setEditingEquipe(null);
    setFormData(emptyEquipeForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (equipe: EquipeIntervention) => {
    clearMessages();
    setEditingEquipe(equipe);
    setFormData(toEquipeFormData(equipe));
    setFormError('');
    setShowModal(true);
  };

  const handleToggleUserSelection = (userId: number) => {
    setFormData((prev) => ({ ...prev, utilisateur_ids: toggleUserSelection(prev.utilisateur_ids, userId) }));
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formData.commentaire.trim()) {
      setFormError('Le commentaire est obligatoire');
      return;
    }

    setFormLoading(true);
    try {
      if (editingEquipe) {
        await equipeInterventionService.update(editingEquipe.id, {
          commentaire: formData.commentaire.trim(),
          utilisateur_ids: formData.utilisateur_ids,
        });
      } else {
        await equipeInterventionService.create({
          commentaire: formData.commentaire.trim(),
          utilisateur_ids: formData.utilisateur_ids,
        });
      }

      setSuccessMsg(editingEquipe ? 'Équipe modifiée avec succès' : 'Équipe créée avec succès');
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (equipe: EquipeIntervention) => {
    setConfirmEquipe(null);
    try {
      await equipeInterventionService.remove(equipe.id);
      setSuccessMsg('Équipe supprimée avec succès');
      await fetchData();
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
            <h1 className={styles.title}>Équipes d&apos;intervention</h1>
            <p className={styles.subtitle}>{equipes.length} équipe{equipes.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouvelle équipe
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <EquipesTable
              equipes={equipes}
              usersById={usersById}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmEquipe}
            />

            <EquipesCards
              equipes={equipes}
              usersById={usersById}
              onEdit={handleEdit}
              onDeleteRequest={setConfirmEquipe}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingEquipe ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Commentaire *</label>
                <textarea
                  className={styles.formInput}
                  value={formData.commentaire}
                  onChange={(e) => setFormData((prev) => ({ ...prev, commentaire: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Sélection des utilisateurs</label>
                <div className={styles.rolesCheckboxes}>
                  {users.map((user) => {
                    const checked = formData.utilisateur_ids.includes(user.id);
                    return (
                      <label key={user.id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={checked}
                            onChange={() => handleToggleUserSelection(user.id)}
                        />
                        {formatUserLabel(user)} ({user.email})
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingEquipe ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmEquipe && (
        <div className={styles.overlay} onClick={() => setConfirmEquipe(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Supprimer l&apos;équipe #{confirmEquipe.id} ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmEquipe(null)}>
                Annuler
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleDelete(confirmEquipe)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function EquipesInterventionsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <EquipesInterventionsContent />
    </ProtectedRoute>
  );
}
