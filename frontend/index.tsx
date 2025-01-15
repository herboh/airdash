import {
  initializeBlock,
  useBase,
  useLoadable,
  useWatchable,
  useCursor,
  useRecords,
  Box,
  Text,
  Heading,
  Button,
} from "@airtable/blocks/ui";
import { cursor } from "@airtable/blocks";
import { FieldType } from "@airtable/blocks/models";
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

  function AppContent() {
    const {
      selectedRecord,
      isSearchActive,
      records,
      recentProjectIds,
      setSelectedRecord,
      setIsSearchActive,
      handleRecordSelect,
      airtableService,
    } = useAppState();

    const base = useBase();
    const jobsTable = base.getTableByName("Jobs");
    const notesTable = base.getTableByName("Notes");

    return (
      <Box>
        <SearchBar
          records={records}
          onSelectRecord={handleRecordSelect}
          onSearchActiveChange={setIsSearchActive}
          airtableService={airtableService}
        />

        {selectedRecord ? (
          <Box>
            <Box
              marginBottom={2}
              display="flex"
              justifyContent="space-between"
              width="98%"
              margin="0 auto"
            >
              <Heading>
                {isSearchActive ? "Pick a Project from the List" : "Project Overview"}
              </Heading>
              <Button
                variant="default"
                onClick={() => {
                  setSelectedRecord(null);
                  setIsSearchActive(false);
                }}
              >
                Close
              </Button>
            </Box>
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
            <Text marginBottom={3}>
              Select a project from the table or use the search bar above
            </Text>
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
}
