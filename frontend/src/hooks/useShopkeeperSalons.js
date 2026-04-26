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

  const refreshSalons = useCallback(async () => {
    setLoadingSalons(true);
    try {
      const res = await salonService.getMySalon();
      const ownerSalons = res.data.salons || (res.data.salon ? [res.data.salon] : []);
      setSalons(ownerSalons);

      // Determine which salon to select
      const stored = selectedSalonId;
      const salonExists = ownerSalons.some(s => s.id === stored);
      const nextSalonId = (salonExists ? stored : ownerSalons[0]?.id) || '';

      if (nextSalonId && nextSalonId !== selectedSalonId) {
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
