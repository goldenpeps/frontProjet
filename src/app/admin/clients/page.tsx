'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute, SearchBar } from '@/components';
import { Navbar } from '@/components/Navbar';
import { Client, clientService } from '@/services';
import styles from '../admin.module.css';
import { ClientsCards, ClientsTable } from './ClientsDisplay';
import { ClientFormData, emptyClientForm, filterClients, toClientFormData } from './clientsUtils';
import { useClientsData } from './useClientsData';

function ClientsContent() {
  const {
    clients,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    fetchClients,
    clearMessages,
  } = useClientsData();

  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<ClientFormData>(emptyClientForm);

  const filteredClients = useMemo(() => filterClients(clients, searchTerm), [clients, searchTerm]);

  const handleCreate = () => {
    clearMessages();
    setEditingClient(null);
    setFormError('');
    setFormData(emptyClientForm);
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    clearMessages();
    setEditingClient(client);
    setFormError('');
    setFormData(toClientFormData(client));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!formData.nom || !formData.prenom || !formData.email) {
      setFormError('Nom, prénom et email sont obligatoires');
      return;
    }

    setFormLoading(true);
    try {
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
        setSuccessMsg('Client modifié avec succès');
      } else {
        await clientService.create(formData);
        setSuccessMsg('Client créé avec succès');
      }

      setShowModal(false);
      fetchClients();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestion des clients</h1>
            <p className={styles.subtitle}>{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouveau client
          </button>
        </div>

        <SearchBar
          label="Rechercher un client"
          placeholder="Nom, prénom, email, téléphone ou ID"
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
            <ClientsTable clients={filteredClients} onEdit={handleEdit} />

            <ClientsCards clients={filteredClients} onEdit={handleEdit} />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingClient ? 'Modifier le client' : 'Nouveau client'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Prénom *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prenom: e.target.value }))}
                />
              </div>
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
                <label className={styles.formLabel}>Email *</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Téléphone</label>
                <input
                  className={styles.formInput}
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telephone: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingClient ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ClientsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <ClientsContent />
    </ProtectedRoute>
  );
}
