import {
  RecordCardList,
  initializeBlock,
  useBase,
  Box,
  Text,
  Heading,
  Button,
} from "@airtable/blocks/ui";
import React, { useState, useEffect } from "react";
import ProjectOverview from "./components/ProjectOverview";
import SearchBar from "./components/SearchBar";
import RecentProjects from "./components/RecentProjects";
import { AirtableService, Project } from "./airtableService";
import { AppStateProvider, useAppState } from "./appState";
import CloseButton from "./components/CloseButton.tsx";

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

function AppContent() {
  const {
    selectedRecord,
    isSearchActive,
    filteredRecords,
    searchTerm,
    records,
    recentProjectIds,
    setIsSearchActive,
    handleRecordSelect,
    handleClose,
    airtableService,
  } = useAppState();

  const base = useBase();
  const jobsTable = base.getTableByName("Jobs");
  const notesTable = base.getTableByName("Notes");

  return (
    <Box>
      {/* always on top*/}
      <SearchBar />
      <CloseButton onClose={handleClose} />
      {/* main 'window' area */}
      {isSearchActive ? (
        // Search results view
        <Box padding={3}>
          {searchTerm.trim() === "" ? (
            <Text>Start typing to search...</Text>
          ) : filteredRecords.length > 0 ? (
            <Box height="calc(100vh - 120px)" overflow="auto">
              <RecordCardList
                records={filteredRecords}
                fields={airtableService.getProjectCardFields()}
                width="98%"
                margin="0 auto"
                onRecordClick={(record) => {
                  // Type guard to ensure record matches Project interface
                  if (
                    "id" in record &&
                    typeof record.getCellValue === "function"
                  ) {
                    handleRecordSelect(record as Project);
                    setIsSearchActive(false);
                  } else {
                    console.error(
                      "[RecordCardList] Invalid record structure:",
                      record,
                    );
                  }
                }}
              />
            </Box>
          ) : (
            <Text>No matching projects found</Text>
          )}
        </Box>
      ) : selectedRecord ? (
        // Project details view
        <Box>
          <ProjectOverview
            record={selectedRecord}
            jobsTable={jobsTable}
            notesTable={notesTable}
            isSearchActive={isSearchActive}
            airtableService={airtableService}
          />
        </Box>
      ) : (
        <Box padding={3}>
          <Text marginBottom={3}>Select a project...</Text>
          <RecentProjects
            records={records}
            recentIds={recentProjectIds}
            onSelectRecord={handleRecordSelect}
            airtableService={airtableService}
          />
        </Box>
      )}
    </Box>
  );
}

console.log("Initializing Airtable block...");
initializeBlock(() => <App />);
