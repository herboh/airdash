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
    setSelectedRecord,
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
      {/* main 'window' area */}
      {isSearchActive ? (
        // Search results view
        <Box padding={3}>
          {searchTerm.trim() === "" ? (
            <Text>Start typing to search...</Text>
          ) : filteredRecords.length > 0 ? (
            <RecordCardList
              records={filteredRecords}
              fields={airtableService.getProjectCardFields()}
              width="98%"
              margin="0 auto"
              onRecordClick={(record) => {
                handleRecordSelect(record as Project);
                setIsSearchActive(false); // Close search view after selection
              }}
            />
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
