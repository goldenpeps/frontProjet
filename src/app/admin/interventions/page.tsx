"use client";

import { useMemo, useState } from "react";
import { ProtectedRoute, SearchBar } from "@/components";
import { Navbar } from "@/components/Navbar";
import {
  Intervention,
  historiqueTerrainService,
  interventionService,
  materielUtiliseService,
  weatherService,
} from "@/services";
import styles from "../admin.module.css";
import {
  InterventionCard,
  InterventionTableRowCells,
} from "./InterventionsDisplay";
import {
  MIN_DAYS_BETWEEN_MOWING,
  buildCommentWithMeta,
  daysBetween,
  emptyInterventionForm,
  extractDatePart,
  extractGpsCoordinates,
  extractLastMowingDate,
  extractTimePart,
  filterInterventions,
  formatClientLabel,
  formatEquipeLabel,
  formatTerrainLabel,
  getTerrainNameAndAddress,
  getWeatherEmoji,
  logWeatherError,
  parsePlanningMeta,
  showAlertifyConfirmation,
  stripPlanningMeta,
  toDateTimeLocalInput,
  toNullableNumber,
  type InterventionFormData,
  type GpsCoordinates,
} from "./interventionsUtils";
import { useInterventionsData } from "./useInterventionsData";

function InterventionsContent() {
  const [formData, setFormData] = useState<InterventionFormData>(
    emptyInterventionForm,
  );
  const [showModal, setShowModal] = useState(false);
  const [editingIntervention, setEditingIntervention] =
    useState<Intervention | null>(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [confirmIntervention, setConfirmIntervention] =
    useState<Intervention | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    interventions,
    prestations,
    terrains,
    clients,
    equipes,
    materiels,
    loading,
    error,
    successMsg,
    setError,
    setSuccessMsg,
    clientById,
    equipeById,
    materielById,
    materielUtiliseById,
    filteredTerrains,
    fetchInterventions,
    clearMessages,
  } = useInterventionsData(formData.client_id);

  const filteredInterventions = useMemo(
    () => filterInterventions(interventions, searchTerm, clientById, terrains),
    [interventions, searchTerm, clientById, terrains],
  );

  const handleCreate = () => {
    clearMessages();
    setEditingIntervention(null);
    setFormData(emptyInterventionForm);
    setFormError("");
    setShowModal(true);
  };

  const handleEdit = (intervention: Intervention) => {
    clearMessages();
    setEditingIntervention(intervention);
    const planningMeta = parsePlanningMeta(intervention.commentaire || "");
    const linkedMaterielUtilise =
      intervention.materiel_utilise_id == null
        ? null
        : materielUtiliseById.get(intervention.materiel_utilise_id) ?? null;

    setFormData({
      date_prevue: toDateTimeLocalInput(intervention.date_prevue),
      heure_prevue:
        planningMeta?.heurePrevue ?? extractTimePart(intervention.date_prevue),
      date_realisation: toDateTimeLocalInput(intervention.date_realisation),
      commentaire: stripPlanningMeta(intervention.commentaire || ""),
      materiel_utilise_id:
        intervention.materiel_utilise_id == null
          ? ""
          : String(intervention.materiel_utilise_id),
      materiel_ids: linkedMaterielUtilise
        ? linkedMaterielUtilise.materiels.map((m) => String(m.id))
        : [],
      equipe_intervention_id:
        intervention.equipe_intervention_id == null
          ? ""
          : String(intervention.equipe_intervention_id),
      client_id:
        planningMeta?.clientId == null ? "" : String(planningMeta.clientId),
      terrain_id: planningMeta ? String(planningMeta.terrainId) : "",
      // On récupère l'ID de prestation depuis l'intervention (si présent) ou via le nom dans les meta
      type_prestation_id: intervention.type_prestation_id
        ? String(intervention.type_prestation_id)
        : "",
      type_intervention: planningMeta?.type ?? "autre",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setFormError("");
    if (
      !formData.date_prevue ||
      !formData.date_realisation ||
      !formData.client_id ||
      !formData.terrain_id
    ) {
      setFormError(
        "Les dates début/fin, le client et le terrain sont obligatoires",
      );
      return;
    }
    const selectedPrestation = prestations.find(
      (p) => String(p.id) === formData.type_prestation_id,
    );
    if (!selectedPrestation) {
      setFormError("Type de prestation invalide");
      return;
    }

    // Déte
    const startDate = new Date(formData.date_prevue);
    const endDate = new Date(formData.date_realisation);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setFormError("Dates/horaires invalides");
      return;
    }

    if (endDate <= startDate) {
      setFormError(
        "La date/heure de fin doit être strictement après la date/heure de début",
      );
      return;
    }

    const clientId = Number(formData.client_id);
    if (Number.isNaN(clientId) || clientId <= 0) {
      setFormError("Client invalide");
      return;
    }

    const terrainId = Number(formData.terrain_id);
    if (Number.isNaN(terrainId) || terrainId <= 0) {
      setFormError("Terrain invalide");
      return;
    }

    // const prestationNames = new Set(
    //   prestations
    //     .map((prestation) => prestation.nom.trim().toLowerCase())
    //     .filter(Boolean)
    // );
    // const hasTonte = prestationNames.has('tonte');
    // const hasRamassage = prestationNames.has('ramassage');
    const nomNorm = selectedPrestation.nom.toLowerCase();
    const isTonte = nomNorm.includes("tonte");
    const isRamassage = nomNorm.includes("ramassage");
    const typeIntervention = isTonte
      ? "tonte"
      : isRamassage
      ? "ramassage"
      : "autre";

    // if (!hasTonte || !hasRamassage) {
    //   setFormError('Les types de prestation "Tonte" et "Ramassage" doivent exister avant de planifier une intervention');
    //   return;
    // }

    // if (formData.type_intervention === 'tonte' && !hasTonte) {
    //   setFormError('Le type de prestation "Tonte" est introuvable');
    //   return;
    // }

    // if (formData.type_intervention === 'ramassage' && !hasRamassage) {
    //   setFormError('Le type de prestation "Ramassage" est introuvable');
    //   return;
    // }

    const selectedMaterielIds = formData.materiel_ids
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id) && id > 0);

    if (selectedMaterielIds.length === 0) {
      setFormError("Vous devez sélectionner au moins un matériel utilisé");
      return;
    }

    const terrain = terrains.find((item) => item.id === terrainId);
    if (!terrain) {
      setFormError("Terrain introuvable");
      return;
    }

    const selectedDate = new Date(formData.date_prevue);
    if (Number.isNaN(selectedDate.getTime())) {
      setFormError("Date prevue invalide");
      return;
    }

    const weatherDate = extractDatePart(formData.date_prevue);
    const historiqueDate = extractDatePart(formData.date_prevue);
    const heurePrevue =
      extractTimePart(formData.date_prevue) || formData.heure_prevue;

    if (formData.type_intervention === "tonte") {
      const gpsCoordinates = extractGpsCoordinates(terrain.coordonnees_gps);
      if (!gpsCoordinates) {
        setFormError(
          "Ce terrain ne contient pas de coordonnees GPS exploitables pour verifier la meteo",
        );
        return;
      }

      const lastMowingDate = extractLastMowingDate(
        interventions,
        terrainId,
        formData.date_prevue,
        editingIntervention?.id ?? null,
      );

      if (lastMowingDate) {
        const deltaDays = daysBetween(lastMowingDate, selectedDate);
        if (deltaDays < MIN_DAYS_BETWEEN_MOWING) {
          setFormError(
            `Tonte impossible: la derniere tonte date du ${lastMowingDate.toLocaleDateString(
              "fr-FR",
            )} (${deltaDays} jours). Minimum ${MIN_DAYS_BETWEEN_MOWING} jours.`,
          );
          return;
        }
      }

      try {
        const weather = await weatherService.checkDailyWeather(
          gpsCoordinates.latitude,
          gpsCoordinates.longitude,
          weatherDate,
        );

        if (weather.hasRainOrSnow) {
          const { name: terrainName, address: terrainAddress } =
            getTerrainNameAndAddress(terrain);
          const acceptRainRisk = await showAlertifyConfirmation({
            title: "Alerte meteo - risque pluie/neige",
            weatherDescription: weather.description,
            dateLabel: new Date(formData.date_prevue).toLocaleDateString(
              "fr-FR",
            ),
            terrainName,
            terrainAddress,
            gps: gpsCoordinates,
            emoji: getWeatherEmoji(weather.weatherCode),
            okLabel: "Maintenir la tonte",
          });

          if (!acceptRainRisk) {
            setFormError(
              "Intervention annulee: tonte refusee en raison du risque de pluie",
            );
            return;
          }
        }
      } catch (weatherError) {
        const weatherMessage =
          weatherError instanceof Error ? weatherError.message : "";

        logWeatherError({
          message: weatherMessage || "Erreur inconnue lors de la verification meteo",
          terrainId,
          clientId,
          date: formData.date_prevue,
          gps: gpsCoordinates,
        });

        const noForecastData =
          /donnees meteo indisponibles|impossible de recuperer la meteo/i.test(
            weatherMessage,
          );

        if (noForecastData) {
          const { name: terrainName, address: terrainAddress } =
            getTerrainNameAndAddress(terrain);
          const continueWithoutForecast = await showAlertifyConfirmation({
            title: "Meteo indisponible",
            weatherDescription:
              "L'API meteo n'a pas encore de prevision pour cette date",
            dateLabel: new Date(formData.date_prevue).toLocaleDateString(
              "fr-FR",
            ),
            terrainName,
            terrainAddress,
            gps: gpsCoordinates,
            emoji: "❔",
            okLabel: "Continuer sans verification",
          });

          if (!continueWithoutForecast) {
            setFormError(
              "Intervention annulee: verification meteo indisponible pour cette date",
            );
            return;
          }
        } else {
          setFormError(
            weatherMessage || "Erreur lors de la verification meteo",
          );
          return;
        }
      }
    }

    setFormLoading(true);
    try {
      const createdMaterielUtilise = await materielUtiliseService.create({
        durree: historiqueDate,
        materielIds: selectedMaterielIds,
      });

      const payload = {
        date_prevue: formData.date_prevue,
        date_realisation: formData.date_realisation,
        commentaire: buildCommentWithMeta(
          formData.commentaire,
          formData.type_intervention,
          clientId,
          terrainId,
          heurePrevue,
        ),
        materiel_utilise_id: createdMaterielUtilise.id,
        equipe_intervention_id: toNullableNumber(
          formData.equipe_intervention_id,
        ),
      };

      if (editingIntervention) {
        await interventionService.update(editingIntervention.id, payload);
        setSuccessMsg("Intervention modifiee avec succes");
      } else {
        await interventionService.create(payload);

        if (
          formData.type_intervention === "tonte" ||
          formData.type_intervention === "ramassage"
        ) {
          await historiqueTerrainService.create({
            terrainId,
            ramassage: formData.type_intervention === "ramassage",
            tonte: formData.type_intervention === "tonte",
            dateRamassage:
              formData.type_intervention === "ramassage"
                ? historiqueDate
                : null,
            dateTonte:
              formData.type_intervention === "tonte" ? historiqueDate : null,
          });
        }

        setSuccessMsg("Intervention creee avec succes");
      }

      setShowModal(false);
      fetchInterventions();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (intervention: Intervention) => {
    setConfirmIntervention(null);
    try {
      await interventionService.remove(intervention.id);
      setSuccessMsg("Intervention supprimée avec succès");
      fetchInterventions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestion des interventions</h1>
            <p className={styles.subtitle}>
              {filteredInterventions.length} intervention
              {filteredInterventions.length > 1 ? "s" : ""}
            </p>
          </div>
          <button className={styles.btnCreate} onClick={handleCreate}>
            + Nouvelle intervention
          </button>
        </div>

        <SearchBar
          label="Rechercher une intervention"
          placeholder="Client, terrain, type, commentaire, date ou ID"
          value={searchTerm}
          onChange={setSearchTerm}
          wrapperClassName={styles.formGroup + " " + styles.formGroupFull}
          labelClassName={styles.formLabel}
          inputClassName={styles.formInput}
        />

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
                    <th>Date prévue</th>
                    <th>Heure</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Terrain</th>
                    <th>Date réalisation</th>
                    <th>Équipe</th>
                    <th>Matériels utilisés</th>
                    <th>Commentaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterventions.map((intervention) => (
                    <tr key={intervention.id}>
                      <InterventionTableRowCells
                        intervention={intervention}
                        terrains={terrains}
                        clientById={clientById}
                        equipeById={equipeById}
                        materielById={materielById}
                        materielUtiliseById={materielUtiliseById}
                        onEdit={handleEdit}
                        onDelete={setConfirmIntervention}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cardList}>
              {filteredInterventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  terrains={terrains}
                  clientById={clientById}
                  equipeById={equipeById}
                  materielById={materielById}
                  materielUtiliseById={materielUtiliseById}
                  onEdit={handleEdit}
                  onDelete={setConfirmIntervention}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingIntervention
                ? "Modifier l'intervention"
                : "Nouvelle intervention"}
            </h2>

            {formError && <div className={styles.alertError}>{formError}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date prévue *</label>
                <input
                  className={styles.formInput}
                  type="datetime-local"
                  value={formData.date_prevue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_prevue: e.target.value,
                      heure_prevue: extractTimePart(e.target.value),
                    }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Heure prévue</label>
                <input
                  className={styles.formInput}
                  type="time"
                  value={formData.heure_prevue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heure_prevue: e.target.value,
                    }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date réalisation *</label>
                <input
                  className={styles.formInput}
                  type="datetime-local"
                  value={formData.date_realisation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date_realisation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type d'intervention</label>
                <select
                  className={styles.formInput}
                  value={formData.type_prestation_id}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const pObj = prestations.find((p) => String(p.id) === pId);
                    const nom = pObj?.nom.toLowerCase() || "";

                    setFormData((prev) => ({
                      ...prev,
                      type_prestation_id: pId,
                      // On met à jour le type interne pour la logique UI si besoin
                      type_intervention: nom.includes("tonte")
                        ? "tonte"
                        : nom.includes("ramassage")
                        ? "ramassage"
                        : "autre",
                    }));
                  }}
                >
                  <option value="">Sélectionner une prestation</option>
                  {prestations.map((prestation) => (
                    <option key={prestation.id} value={String(prestation.id)}>
                      {prestation.nom} (
                      {Number(prestation.prix_unitaire).toFixed(2)} €)
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Client *</label>
                <select
                  className={styles.formInput}
                  value={formData.client_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      client_id: e.target.value,
                      terrain_id: "",
                    }))
                  }
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
                <label className={styles.formLabel}>Terrain *</label>
                <select
                  className={styles.formInput}
                  value={formData.terrain_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      terrain_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Selectionner un terrain</option>
                  {filteredTerrains.map((terrain) => (
                    <option key={terrain.id} value={terrain.id}>
                      {formatTerrainLabel(
                        terrain,
                        clientById.get(terrain.client_id),
                      )}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Équipe d'intervention
                </label>
                <select
                  className={styles.formInput}
                  value={formData.equipe_intervention_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      equipe_intervention_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Aucune équipe</option>
                  {equipes.map((equipe) => (
                    <option key={equipe.id} value={String(equipe.id)}>
                      {formatEquipeLabel(equipe)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup + " " + styles.formGroupFull}>
                <label className={styles.formLabel}>
                  Matériels utilisés (1 à plusieurs) *
                </label>
                <select
                  className={styles.formInput}
                  multiple
                  value={formData.materiel_ids}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map(
                      (option) => option.value,
                    );
                    setFormData((prev) => ({ ...prev, materiel_ids: values }));
                  }}
                >
                  {materiels.map((materiel) => (
                    <option key={materiel.id} value={String(materiel.id)}>
                      #{materiel.id} -{" "}
                      {materiel.type_materiel_libelle ||
                        `Type #${materiel.type_materiel_id ?? "—"}`}{" "}
                      ({materiel.disponible ? "disponible" : "indisponible"})
                    </option>
                  ))}
                </select>
                <p className={styles.formHint}>
                  Maintenez Ctrl (Windows) pour sélectionner plusieurs
                  matériels.
                </p>
              </div>
              <div className={styles.formGroup + " " + styles.formGroupFull}>
                <label className={styles.formLabel}>Commentaire</label>
                <textarea
                  className={styles.formInput}
                  value={formData.commentaire}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commentaire: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
                disabled={formLoading}
              >
                Annuler
              </button>
              <button
                className={styles.btnSave}
                onClick={handleSubmit}
                disabled={formLoading}
              >
                {formLoading
                  ? "Enregistrement..."
                  : editingIntervention
                  ? "Enregistrer"
                  : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmIntervention && (
        <div
          className={styles.overlay}
          onClick={() => setConfirmIntervention(null)}
        >
          <div
            className={styles.modal + " " + styles.modalSmall}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>Confirmation</h2>
            <p className={styles.confirmText}>
              Supprimer l'intervention #{confirmIntervention.id} ?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnCancel}
                onClick={() => setConfirmIntervention(null)}
              >
                Annuler
              </button>
              <button
                className={styles.btnDeactivate}
                onClick={() => handleDelete(confirmIntervention)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function InterventionsPage() {
  return (
    <ProtectedRoute requiredRoles={["ROLE_ADMIN"]}>
      <InterventionsContent />
    </ProtectedRoute>
  );
}
