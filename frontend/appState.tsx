import React from "react";
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useBase, useLoadable, useWatchable, useCursor, useRecords } from "@airtable/blocks/ui";
import { AirtableService, Project } from "./airtableService";

// set up type accepted by methods and props that will interact with AppState aka change when to render
interface AppState {
  selectedRecord: Project | null;
  isSearchActive: boolean;
  recentProjectIds: string[];
  filteredRecords: Project[];
  records: Project[];
  searchTerm: string;
  handleSearch: (searchTerm: string) => void;
  setSearchTerm: (term: string) => void;
  setSelectedRecord: (record: Project | null) => void;
  setIsSearchActive: (active: boolean) => void;
  setFilteredRecords: (records: Project[]) => void;
  handleRecordSelect: (record: Project) => void;
  handleClose: () => void;
  airtableService: AirtableService;
}

const AppStateContext = createContext<AppState>({} as AppState);

interface AppStateProviderProps {
  children: React.ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const base = useBase();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<Project | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<Project[]>([]);
  const airtableService = useMemo(() => new AirtableService(base), [base]);
  const records = useRecords(airtableService.getProjectView());
  //removing for now//const jobRecords = useRecords(airtableService.)

  // Watch for cursor data and selected record in Airtable
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ["selectedRecordIds"]);

  //old functional project lookup by mouse click
  // useEffect(() => {
  //     if (cursor.selectedRecordIds?.length > 0) {
  //       const selected = records?.find(
  //         (record) => record.id === cursor.selectedRecordIds[0],
  //       );
  //       if (selected && selected.id !== selectedRecord?.id) {
  //         handleRecordSelect(selected);
  //       }
  //     }
  //   }, [cursor.selectedRecordIds, records, selectedRecord?.id]);
  // // When selecting a job, find :width: ,its linked project
  // const cellValue = selectedRecordIds.(
  //     (record) => record.id === selectedRecordId
  // );
  // const linkedProject =
  //   airtableService.getLinkedProjectFromJob(jobRecord);

  //trying to do both projects and jobs table
  useEffect(() => {
    if (cursor.selectedRecordIds?.length > 0) {
      const selectedTable = cursor.activeTableId; // Get the current table ID
      const [selectedRecordId] = cursor.selectedRecordIds;

      if (selectedTable === airtableService.projectsTable.id) {
        // When selecting a project, set the selected record directly
        const projectRecord = records.find((record) => record.id === selectedRecordId);
        if (projectRecord) {
          setSelectedRecord(projectRecord); //needs to call handle record select
        }
      } else if (selectedTable === airtableService.jobsTable.id) {
        const jobRecord = selectedTable.getRecordByIdIfExists(selectedRecordId);
        if (jobRecord) {
          const linkedProjects = jobRecord.selectLinkedRecordsFromCell("Projects");
          const projectRecord = linkedProjects.records[0];
          setSelectedRecord(projectRecord || null);
        }
      }
    }
  }, [cursor.selectedRecordIds, cursor.activeTableId, records, airtableService]);

  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentProjectIds");
    return stored ? JSON.parse(stored) : [];
  });

  const handleRecordSelect = useCallback(
    (record: Project) => {
      if (record.id !== selectedRecord?.id) {
        setSelectedRecord(record);
        setIsSearchActive(false);

        setRecentProjectIds((prev) => {
          const updatedList = [record.id, ...prev.filter((id) => id !== record.id)].slice(0, 8);
          localStorage.setItem("recentProjectIds", JSON.stringify(updatedList));
          return updatedList;
        });
      }
    },
    [selectedRecord],
  );

  const handleClose = useCallback(() => {
    setSelectedRecord(null);
    setIsSearchActive(false);
    setSearchTerm("");
    setFilteredRecords([]);
  }, []);

  const handleSearch = useCallback(
    (userInput: string) => {
      setSearchTerm(userInput);
      const trimmedInput = userInput.trim();
      setIsSearchActive(!!trimmedInput);

      if (trimmedInput) {
        const filtered = airtableService.filterProjects(records, trimmedInput);
        setFilteredRecords(filtered);
      } else {
        setFilteredRecords([]);
      }
    },
    [records, airtableService],
  );

  const value: AppState = {
    selectedRecord,
    isSearchActive,
    recentProjectIds,
    records,
    searchTerm,
    setSearchTerm,
    setSelectedRecord,
    setIsSearchActive,
    setFilteredRecords,
    handleRecordSelect,
    handleClose,
    handleSearch,
    filteredRecords,
    airtableService,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
