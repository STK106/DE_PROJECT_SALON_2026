import { useCallback, useEffect, useState } from 'react';
import { salonService } from '@/services/salonService';

const STORAGE_KEY = 'shopkeeper_selected_salon_id';

function getStoredSalonId() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}

function storeSalonId(id) {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(STORAGE_KEY, id);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useShopkeeperSalons() {
  const [salons, setSalons] = useState([]);
  const [selectedSalonId, setSelectedSalonIdState] = useState(getStoredSalonId);
  const [loadingSalons, setLoadingSalons] = useState(true);

  const setSelectedSalonId = useCallback((id) => {
    setSelectedSalonIdState(id || '');
    storeSalonId(id || '');
  }, []);

  const refreshSalons = useCallback(async (preferredSalonId) => {
    setLoadingSalons(true);
    try {
      const candidateSalonId = preferredSalonId ?? selectedSalonId;
      const res = await salonService.getMySalon(candidateSalonId || undefined);
      const ownerSalons = res.data.salons || (res.data.salon ? [res.data.salon] : []);
      const activeSalon = res.data.salon || ownerSalons[0] || null;
      const nextSalonId = activeSalon?.id || '';

      setSalons(ownerSalons);
      if (nextSalonId !== selectedSalonId) {
        setSelectedSalonId(nextSalonId);
      }
    } catch {
      setSalons([]);
      setSelectedSalonId('');
    } finally {
      setLoadingSalons(false);
    }
  }, [selectedSalonId, setSelectedSalonId]);

  useEffect(() => {
    refreshSalons();
  }, [refreshSalons]);

  return {
    salons,
    selectedSalonId,
    setSelectedSalonId,
    loadingSalons,
    refreshSalons,
  };
}
