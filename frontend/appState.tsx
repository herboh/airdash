import React from "react";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Base, Table, Record } from "@airtable/blocks/models";
import { cursor } from "@airtable/blocks";
import { useBase, useRecords } from "@airtable/blocks/ui";
import { AirtableService, Project } from "./airtableService";

interface AppState {
  selectedRecord: Project | null;
  isSearchActive: boolean;
  recentProjectIds: string[];
  records: Project[];
  setSelectedRecord: (record: Project | null) => void;
  setIsSearchActive: (active: boolean) => void;
  handleRecordSelect: (record: Project) => void;
  airtableService: AirtableService;
}

const AppStateContext = createContext<AppState>({} as AppState);

interface AppStateProviderProps {
  children: React.ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const base = useBase();
  const [selectedRecord, setSelectedRecord] = useState<Project | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentProjectIds");
    return stored ? JSON.parse(stored) : [];
  });

  const airtableService = useMemo(() => new AirtableService(base), [base]);

  // Get records using the service configuration
  const records = useRecords(airtableService.getProjectView()) as Project[];

  // Watch for selected record in Airtable
  useEffect(() => {
    if (cursor.selectedRecordIds?.length > 0) {
      const selected = records?.find((record) => record.id === cursor.selectedRecordIds[0]);
      setSelectedRecord(selected || null);
    }
  }, [cursor.selectedRecordIds, records]);

  const handleRecordSelect = (record: Project) => {
    setSelectedRecord(record);
    setIsSearchActive(false);

    // Update recent projects
    const newRecentIds = [record.id, ...recentProjectIds.filter((id) => id !== record.id)].slice(
      0,
      5,
    ); // Keep only the 5 most recent

    setRecentProjectIds(newRecentIds);
    localStorage.setItem("recentProjectIds", JSON.stringify(newRecentIds));
  };

  const value: AppState = {
    selectedRecord,
    isSearchActive,
    recentProjectIds,
    records,
    setSelectedRecord,
    setIsSearchActive,
    handleRecordSelect,
    airtableService,
  };

  //needed to change file to .tsx and import React for this to work
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
