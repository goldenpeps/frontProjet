import { HistoriqueTerrain, Terrain } from '@/services';

export interface HistoriqueFormData {
  ramassage: boolean;
  tonte: boolean;
  dateRamassage: string;
  dateTonte: string;
  terrainId: string;
}

export const emptyHistoriqueFormData: HistoriqueFormData = {
  ramassage: false,
  tonte: false,
  dateRamassage: '',
  dateTonte: '',
  terrainId: '',
};

export function formatTerrainLabel(terrain: Terrain): string {
  return `Terrain #${terrain.id} - superficie ${terrain.superficie}`;
}

export function toHistoriqueFormData(historique: HistoriqueTerrain): HistoriqueFormData {
  return {
    ramassage: historique.ramassage,
    tonte: historique.tonte,
    dateRamassage: historique.dateRamassage || '',
    dateTonte: historique.dateTonte || '',
    terrainId: historique.terrainId == null ? '' : String(historique.terrainId),
  };
}

export function filterHistoriques(
  historiques: HistoriqueTerrain[],
  searchTerm: string,
  terrainById: Map<number, Terrain>
): HistoriqueTerrain[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return historiques;

  return historiques.filter((historique) => {
    const terrain = historique.terrainId == null ? undefined : terrainById.get(historique.terrainId);
    return (
      String(historique.id).includes(query)
      || String(historique.terrainId ?? '').includes(query)
      || (historique.dateRamassage || '').toLowerCase().includes(query)
      || (historique.dateTonte || '').toLowerCase().includes(query)
      || (historique.ramassage ? 'oui' : 'non').includes(query)
      || (historique.tonte ? 'oui' : 'non').includes(query)
      || (terrain ? formatTerrainLabel(terrain).toLowerCase().includes(query) : false)
    );
  });
}
