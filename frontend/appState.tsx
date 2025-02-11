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

// set up type accepted, How you interact with AppState aka decide to render
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

//set and export initial state
export function AppStateProvider({ children }: AppStateProviderProps) {
  const base = useBase();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<Project | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<Project[]>([]);
  const airtableService = useMemo(() => new AirtableService(base), [base]);
  const records = useRecords(airtableService.getProjectView());
  const cursor = useCursor();

  useLoadable(cursor);
  useWatchable(cursor, ["selectedRecordIds", "activeTableId"]);

  //Takes recordID and change the state when a new "project"  is selected. Mainly opens ProjectOverview.tsx
  const handleRecordSelect = useCallback(
    (record: Project) => {
      if (record.id !== selectedRecord?.id) {
        setSelectedRecord(record);
        setIsSearchActive(false);

        //if project is unique, add to memory for "recent Projects"
        setRecentProjectIds((prev) => {
          const updatedList = [
            record.id,
            ...prev.filter((id) => id !== record.id),
          ].slice(0, 7);
          localStorage.setItem("recentProjectIds", JSON.stringify(updatedList));
          return updatedList;
        });
      }
    },
    [selectedRecord],
  );

  useEffect(() => {
    const handleSelectionChange = async () => {
      if (!cursor.selectedRecordIds?.length) return;

      const selectedTable = cursor.activeTableId;
      const [selectedRecordId] = cursor.selectedRecordIds;
      //get selection and run handRecordSelect with the recordID
      try {
        if (selectedTable === airtableService.projectsTable.id) {
          const projectRecord = records.find(
            (record) => record.id === selectedRecordId,
          );
          if (projectRecord) {
            handleRecordSelect(projectRecord);
          }

          //else try to look up the linked project from job recordID
        } else if (selectedTable === airtableService.jobsTable.id) {
          const projectRecord =
            await airtableService.getProjectFromJobId(selectedRecordId);
          if (projectRecord) {
            handleRecordSelect(projectRecord);
          }
        }
      } catch (error) {}
    };

    //the timing here is a little wacky, had to move things to avoid calling before declared. Seems to work.
    handleSelectionChange();
  }, [
    cursor.selectedRecordIds,
    cursor.activeTableId,
    records,
    airtableService,
    handleRecordSelect,
  ]);

  //list of recent projects in memory. odd spot, might should be moved
  const [recentProjectIds, setRecentProjectIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentProjectIds");
    return stored ? JSON.parse(stored) : [];
  });

  //clear button. sort of works and needs to include clearing cursor and searchbar
  //mainly returns to RecentProjects.tsx
  const handleClose = useCallback(() => {
    setSelectedRecord(null);
    setIsSearchActive(false);
    setSearchTerm("");
    setFilteredRecords([]);
  }, []);

  //Search Projects. Clear main window, filter by input, already sorted by date
  //mainly activates SearchBar.tsx
  const handleSearch = useCallback(
    (userInput: string) => {
      setSearchTerm(userInput);
      const trimmedInput = userInput.trim();
      setIsSearchActive(!!trimmedInput);

      const debounceTimer = setTimeout(() => {
        if (trimmedInput) {
          const filtered = airtableService.filterProjects(
            records,
            trimmedInput,
          );
          setFilteredRecords(filtered);
        } else {
          setFilteredRecords([]);
        }
      }, 200);

      return () => clearTimeout(debounceTimer);
    },
    [records, airtableService],
  );

  //this just publishes the state to the other files
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

//this was important many many moons ago, error check could probably be removed. Not touching unless it breaks.
export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
