'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components';
import { Navbar } from '@/components/Navbar';
import { Terrain, terrainService } from '@/services';
import styles from '../admin.module.css';
import { TerrainsCards, TerrainsTable } from './TerrainsDisplay';
import {
  emptyTerrainForm,
  extractGpsCoordinates,
  formatClientLabel,
  formatInterventionLabel,
  formatTerrainTypeLabel,
  gpsToString,
  parseGpsInput,
  TerrainFormData,
  toNullableNumber,
} from './terrainsUtils';
import { useTerrainsData } from './useTerrainsData';

const GpsPickerMap = dynamic(() => import('@/components/GpsPickerMap'), {
  ssr: false,
});

function TerrainsContent() {
  const {
    terrains,
    clients,
    interventions,
    terrainTypes,
    loading,
    error,
    refError,
    successMsg,
    clientById,
    terrainTypeById,
    setError,
    setSuccessMsg,
    fetchTerrains,
    clearMessages,
  } = useTerrainsData();

  const [showModal, setShowModal] = useState(false);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const [editingTerrain, setEditingTerrain] = useState<Terrain | null>(null);
  const [formData, setFormData] = useState<TerrainFormData>(emptyTerrainForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmTerrain, setConfirmTerrain] = useState<Terrain | null>(null);

  const selectedCoordinates = useMemo(() => extractGpsCoordinates(formData.coordonnees_gps), [formData.coordonnees_gps]);

  const handleCreate = () => {
    clearMessages();
    setEditingTerrain(null);
    setFormData(emptyTerrainForm);
    setMapRenderKey((prev) => prev + 1);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (terrain: Terrain) => {
    clearMessages();
    setEditingTerrain(terrain);
    const adresseObj = (terrain.adresse as Record<string, unknown>) || {};
    setFormData({
      superficie: String(terrain.superficie ?? ''),
      commentaire: terrain.commentaire || '',
      client_id: String(terrain.client_id ?? ''),
      type_terrain_id: terrain.type_terrain_id == null ? '' : String(terrain.type_terrain_id),
      intervention_id: terrain.intervention_id == null ? '' : String(terrain.intervention_id),
      adresse: {
        nom: typeof adresseObj.nom === 'string' ? adresseObj.nom : '',
        cp: typeof adresseObj.cp === 'string' ? adresseObj.cp : '',
        adresse: typeof adresseObj.adresse === 'string' ? adresseObj.adresse : '',
      },
      coordonnees_gps: gpsToString(terrain.coordonnees_gps),
    });
    setMapRenderKey((prev) => prev + 1);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError('');

    const superficie = Number(formData.superficie);
    const clientId = Number(formData.client_id);
    const typeTerrainId = Number(formData.type_terrain_id);

    if (Number.isNaN(clientId) || clientId <= 0) {
      setFormError('Le client est obligatoire pour creer un terrain');
      return;
    }

    if (Number.isNaN(superficie) || superficie <= 0) {
      setFormError('La superficie est obligatoire et doit etre superieure a 0');
      return;
    }

    if (Number.isNaN(typeTerrainId) || typeTerrainId <= 0) {
      setFormError('Le type de terrain est obligatoire');
      return;
    }

    const adressePayload = 
      formData.adresse.nom.trim() || formData.adresse.cp.trim() || formData.adresse.adresse.trim()
        ? {
            nom: formData.adresse.nom.trim(),
            cp: formData.adresse.cp.trim(),
            adresse: formData.adresse.adresse.trim(),
          }
        : null;

    const payload = {
      superficie,
      commentaire: formData.commentaire,
      client_id: clientId,
      type_terrain_id: typeTerrainId,
      intervention_id: toNullableNumber(formData.intervention_id),
      adresse: adressePayload,
      coordonnees_gps: parseGpsInput(formData.coordonnees_gps),
    };

    setFormLoading(true);
    try {
      if (editingTerrain) {
        await terrainService.update(editingTerrain.id, payload);
        setSuccessMsg('Terrain modifié avec succès');
      } else {
        await terrainService.create(payload);
        setSuccessMsg('Terrain créé avec succès');
      }

      setShowModal(false);
      await fetchTerrains();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (terrain: Terrain) => {
    setConfirmTerrain(null);
    try {
      await terrainService.remove(terrain.id);
      setSuccessMsg('Terrain supprimé avec succès');
      fetchTerrains();
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
            <h1 className={styles.title}>Gestion des terrains</h1>
            <p className={styles.subtitle}>{terrains.length} terrain{terrains.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouveau terrain
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}
        {refError && <div className={styles.alertWarning}>{refError}</div>}
        {successMsg && <div className={styles.alertSuccess}>{successMsg}</div>}

        {loading ? (
          <div className={styles.loader}>Chargement...</div>
        ) : (
          <>
            <TerrainsTable
              terrains={terrains}
              clientById={clientById}
              terrainTypeById={terrainTypeById}
              onEdit={handleEdit}
              onDelete={setConfirmTerrain}
            />

            <TerrainsCards
              terrains={terrains}
              clientById={clientById}
              terrainTypeById={terrainTypeById}
              onEdit={handleEdit}
              onDelete={setConfirmTerrain}
            />
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editingTerrain ? 'Modifier le terrain' : 'Nouveau terrain'}</h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Client *</label>
                <select
                  className={styles.formInput}
                  value={formData.client_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client_id: e.target.value }))}
                >
                  <option value="">Selectionner un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={String(client.id)}>
                      {formatClientLabel(client)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Superficie *</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.01"
                  value={formData.superficie}
                  onChange={(e) => setFormData((prev) => ({ ...prev, superficie: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type de terrain *</label>
                <select
                  className={styles.formInput}
                  value={formData.type_terrain_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type_terrain_id: e.target.value }))}
                >
                  <option value="">Selectionner un type</option>
                  {terrainTypes.map((terrainType) => (
                    <option key={terrainType.id} value={String(terrainType.id)}>
                      {formatTerrainTypeLabel(terrainType)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Intervention (optionnelle)</label>
                <select
                  className={styles.formInput}
                  value={formData.intervention_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, intervention_id: e.target.value }))}
                >
                  <option value="">Aucune intervention</option>
                  {interventions.map((intervention) => (
                    <option key={intervention.id} value={String(intervention.id)}>
                      {formatInterventionLabel(intervention)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Adresse - Nom</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="Ex: Maison"
                  value={formData.adresse.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adresse: { ...prev.adresse, nom: e.target.value } }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Adresse - Code postal</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="Ex: 75001"
                  value={formData.adresse.cp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adresse: { ...prev.adresse, cp: e.target.value } }))}
                />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Adresse - Rue</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="Ex: 123 Rue de la Paix"
                  value={formData.adresse.adresse}
                  onChange={(e) => setFormData((prev) => ({ ...prev, adresse: { ...prev.adresse, adresse: e.target.value } }))}
                />
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Coordonnées GPS</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder='Ex: {"latitude":48.85,"longitude":2.35} ou 48.85,2.35'
                  value={formData.coordonnees_gps}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coordonnees_gps: e.target.value }))}
                />
                <p className={styles.formHint}>Cliquez sur la carte pour remplir automatiquement latitude et longitude.</p>
                <div className={styles.mapWrapper}>
                  <GpsPickerMap
                    key={mapRenderKey}
                    selectedCoordinates={selectedCoordinates}
                    onSelect={(coords) =>
                      setFormData((prev) => ({
                        ...prev,
                        coordonnees_gps: `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`,
                      }))
                    }
                  />
                </div>
                {selectedCoordinates && (
                  <p className={styles.formHint}>
                    Position selectionnee: {selectedCoordinates.latitude.toFixed(6)}, {selectedCoordinates.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              <div className={styles.formGroup + ' ' + styles.formGroupFull}>
                <label className={styles.formLabel}>Commentaire</label>
                <textarea
                  className={styles.formInput}
                  value={formData.commentaire}
                  onChange={(e) => setFormData((prev) => ({ ...prev, commentaire: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)} disabled={formLoading}>
                Annuler
              </button>
              <button className={styles.btnSave} onClick={handleSubmit} disabled={formLoading}>
                {formLoading ? 'Enregistrement...' : editingTerrain ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmTerrain && (
        <div className={styles.overlay} onClick={() => setConfirmTerrain(null)}>
          <div className={styles.modal + ' ' + styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>Supprimer le terrain #{confirmTerrain.id} ?</p>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setConfirmTerrain(null)}>
                Annuler
              </button>
              <button className={styles.btnDeactivate} onClick={() => handleDelete(confirmTerrain)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TerrainsPage() {
  return (
    <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
      <TerrainsContent />
    </ProtectedRoute>
  );
}
