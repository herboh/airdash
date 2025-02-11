import React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  useBase,
  useLoadable,
  useWatchable,
  useCursor,
  useRecords,
} from "@airtable/blocks/ui";
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

  // Watch for cursor data and selected record in Airtable
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ["selectedRecordIds"]);

  useEffect(() => {
    if (cursor.selectedRecordIds?.length > 0) {
      const selected = records?.find(
        (record) => record.id === cursor.selectedRecordIds[0],
      );
      if (selected && selected.id !== selectedRecord?.id) {
        handleRecordSelect(selected);
      }
    }
  }, [cursor.selectedRecordIds, records, selectedRecord?.id]);

  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentProjectIds");
    return stored ? JSON.parse(stored) : [];
  });

  const handleRecordSelect = useCallback(
    (record: Project) => {
      if (record.id !== selectedRecord?.id) {
        setSelectedRecord(record);
        setIsSearchActive(false);
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

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
