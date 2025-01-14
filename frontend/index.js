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
import React, { useState, useEffect } from "react";
import ProjectOverview from "./components/ProjectOverview";
import SearchBar from "./components/SearchBar";

function App() {
  const base = useBase();
  const table = base.getTableByName("Projects");
  const jobsTable = base.getTableByName("Jobs");
  const notesTable = base.getTableByName("Notes");
  const view = table.getViewByName("All Projects View");
  // Pre-fetch all projects with specific fields and sorting - Is this necessary?
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

  // Pre-fetch all jobs with specific fields and sorting
  const allJobs = useRecords(jobsTable, {
    fields: [
      jobsTable.getFieldByName("Type"),
      jobsTable.getFieldByName("State"),
      jobsTable.getFieldByName("Status"),
      jobsTable.getFieldByName("Created Date"),
      jobsTable.getFieldByName("Date Done"),
    ],
    sorts: [{ field: jobsTable.getFieldByName("Created Date"), direction: "desc" }],
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

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setIsSearchActive(false); // Ensure ProjectOverview displays when selecting from search
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
                // cursor.setSelectedRecordIds([]);
              }}
            >
              Clear Selection
            </Text>
          </Box>
          <Box width="98%" margin="0 auto" padding={3}>
            <ProjectOverview
              record={selectedRecord}
              preloadedJobs={allJobs}
              jobsTable={jobsTable}
              notesTable={notesTable}
              isSearchActive={isSearchActive}
            />
          </Box>
        </Box>
      ) : (
        <Box padding={3}>
          <Text>Select a project from the table or use the search bar above</Text>
        </Box>
      )}
    </Box>
  );
}

initializeBlock(() => <App />);
