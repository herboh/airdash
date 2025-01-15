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
} from "@airtable/blocks/ui";
import { cursor } from "@airtable/blocks"; //adding these without a specific use because they seem handy
import { FieldType } from "@airtable/blocks/models"; //adding these without a specific use because they seem handy
import React, { useState, useEffect } from "react";
import ProjectOverview from "./components/ProjectOverview";
import SearchBar from "./components/SearchBar";
import RecentProjects from "./components/RecentProjects";

function App() {
  const base = useBase();
  const table = base.getTableByName("Projects");
  const jobsTable = base.getTableByName("Jobs");
  const notesTable = base.getTableByName("Notes");
  const view = table.getViewByName("All Projects View");
  // Pre-fetch all projects with specific fields and sorting
  const records = useRecords(view, {
    fields: [
      table.getFieldByName("Name"),
      table.getFieldByName("Flight Date"),
      table.getFieldByName("Block"),
      table.getFieldByName("Site"),
      table.getFieldByName("Status"),
      table.getFieldByName("Base Shortcode"),
      table.getFieldByName("Shortcode"),
    ],
    sorts: [{ field: table.getFieldByName("Flight Date"), direction: "desc" }],
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Cursor implementation
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ["selectedRecordIds"]);

  // Watch for selected record in Airtable
  useEffect(() => {
    if (cursor.selectedRecordIds?.length > 0) {
      const selected = records?.find((record) => record.id === cursor.selectedRecordIds[0]);
      setSelectedRecord(selected);
    }
  }, [cursor.selectedRecordIds, records]);

  // Store recent project IDs in state
  const [recentProjectIds, setRecentProjectIds] = React.useState(() => {
    const stored = localStorage.getItem("recentProjectIds");
    return stored ? JSON.parse(stored) : [];
  });

  const handleRecordSelect = (record) => {
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

  return (
    <Box>
      <SearchBar
        records={records}
        table={table}
        onSelectRecord={handleRecordSelect}
        onSearchActiveChange={setIsSearchActive}
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
            <Text
              textColor="light"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(null);
                setIsSearchActive(false);
                // cursor.setSelectedRecordIds([]);
              }}
            >
              Close
            </Text>
          </Box>
          <ProjectOverview
            record={selectedRecord}
            jobsTable={jobsTable}
            notesTable={notesTable}
            isSearchActive={isSearchActive}
          />
        </Box>
      ) : (
        <Box padding={3}>
          <Text marginBottom={3}>Select a project from the table or use the search bar above</Text>
          <RecentProjects
            table={table}
            records={records}
            recentIds={recentProjectIds}
            onSelectRecord={handleRecordSelect}
          />
        </Box>
      )}
    </Box>
  );
}

initializeBlock(() => <App />);
