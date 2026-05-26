'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { userService, AdminUser, CreateUserData, UpdateUserData } from '@/services';
import styles from '../admin.module.css';
import { UsersCards, UsersTable } from './UsersDisplay';
import { useUsersData } from './useUsersData';
import {
  AVAILABLE_ROLES,
  emptyUserForm,
  toggleRole,
  toFormData,
  UserFormData,
} from './usersUtils';

function UsersContent() {
  const { user: currentUser, logout } = useAuth();
  const {
    users,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchUsers,
    clearMessages,
  } = useUsersData();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyUserForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);

  const handleCreate = () => {
    clearMessages();
    setEditingUser(null);
    setFormData(emptyUserForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (u: AdminUser) => {
    clearMessages();
    setEditingUser(u);
    setFormData(toFormData(u));
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formData.email || !formData.nom || !formData.prenom) {
      setFormError('Email, nom et prénom sont obligatoires');
      return;
    }

    if (!editingUser && !formData.password) {
      setFormError('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }

    setFormLoading(true);
    try {
      if (editingUser) {
        const updateData: UpdateUserData = {
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          roles: formData.roles,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userService.update(editingUser.id, updateData);

        if (currentUser && editingUser.id === currentUser.id) {
          logout();
          window.location.href = '/login';
          return;
        }

        setSuccessMsg('Utilisateur modifié avec succès');
      } else {
        const createData: CreateUserData = {
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          password: formData.password,
          roles: formData.roles,
        };
        await userService.create(createData);
        setSuccessMsg('Utilisateur créé avec succès');
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (u: AdminUser) => {
    clearMessages();
    setConfirmUser(null);
    try {
      if (u.is_active) {
        await userService.deactivate(u.id);
        setSuccessMsg(`${u.prenom} ${u.nom} a été désactivé`);
      } else {
        await userService.activate(u.id);
        setSuccessMsg(`${u.prenom} ${u.nom} a été réactivé`);
      }
      fetchUsers();
     
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({ ...prev, roles: toggleRole(prev.roles, role) }));
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestion des utilisateurs</h1>
            <p className={styles.subtitle}>{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouvel utilisateur
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <UsersTable
              users={users}
              currentUserId={currentUser?.id}
              onEdit={handleEdit}
              onToggleRequest={setConfirmUser}
            />

            <UsersCards
              users={users}
              currentUserId={currentUser?.id}
              onEdit={handleEdit}
              onToggleRequest={setConfirmUser}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>

            {editingUser && currentUser?.id === editingUser.id && (
              <div className={styles.alertWarning}>
                Attention : modifier votre propre compte vous déconnectera.
              </div>
            )}

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Prénom *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData((p) => ({ ...p, prenom: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nom *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Téléphone</label>
                <input
                  className={styles.formInput}
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData((p) => ({ ...p, telephone: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>
                  Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input
                  className={styles.formInput}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Rôles</label>
                <div className={styles.rolesCheckboxes}>
                  {AVAILABLE_ROLES.map((role) => (
                    <label key={role} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        disabled={role === 'ROLE_USER'}
                      />
                      {role.replace('ROLE_', '')}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingUser ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmUser && (
        <div className={styles.overlay} onClick={() => setConfirmUser(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>
              {confirmUser.is_active
                ? `Désactiver ${confirmUser.prenom} ${confirmUser.nom} ? L'utilisateur ne pourra plus se connecter.`
                : `Réactiver ${confirmUser.prenom} ${confirmUser.nom} ?`}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmUser(null)}>
                Annuler
              </button>
              <button
                className={confirmUser.is_active ? styles.btnDeactivate : styles.btnActivate}
                onClick={() => handleToggleActive(confirmUser)}
              >
                {confirmUser.is_active ? 'Désactiver' : 'Réactiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <UsersContent />
    </ProtectedRoute>
  );
}
