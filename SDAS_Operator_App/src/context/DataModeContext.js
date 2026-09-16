import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA_MODE_KEY = '@sdas_operator_data_mode';

const DataModeContext = createContext();

export function DataModeProvider({ children }) {
  // Production default is LIVE hardware; simulation is strictly opt-in
  const [dataMode, setDataModeState] = useState('LIVE');

  useEffect(() => {
    AsyncStorage.getItem(DATA_MODE_KEY).then((saved) => {
      if (saved === 'LIVE' || saved === 'SIMULATION') {
        setDataModeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setDataMode = async (mode) => {
    setDataModeState(mode);
    try {
      await AsyncStorage.setItem(DATA_MODE_KEY, mode);
    } catch (e) {
      console.warn('Failed to save data mode:', e);
    }
  };

  const isLiveMode = dataMode === 'LIVE';
  const isSimulationMode = dataMode === 'SIMULATION';

  return (
    <DataModeContext.Provider value={{ dataMode, setDataMode, isLiveMode, isSimulationMode }}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (!context) {
    return {
      dataMode: 'LIVE',
      setDataMode: () => {},
      isLiveMode: true,
      isSimulationMode: false,
    };
  }
  return context;
}
