import {
  initializeBlock,
  useBase,
  useGlobalConfig,
  useLoadable,
  useWatchable,
  useCursor,
  useRecords,
  Box,
  ViewPickerSynced,
  Input,
  Text,
  Heading,
  RecordCardList,
} from "@airtable/blocks/ui";
import React, { useState, useEffect } from "react";
import ProjectOverview from "./components/ProjectOverview";

function App() {
  const base = useBase();
  const table = base.getTableByName("Projects");
  const view = table.getViewByName("All Projects View");
  const records = useRecords(view);

  // State for search and selected record
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Proper cursor implementation
  const cursor = useCursor();
  useLoadable(cursor);
  useWatchable(cursor, ["selectedRecordIds"]);

  // Watch for selected record in Airtable
  useEffect(() => {
    if (cursor.selectedRecordIds?.length > 0) {
      const selected = records?.find(
        (record) => record.id === cursor.selectedRecordIds[0],
      );
      setSelectedRecord(selected);
    }
  }, [cursor.selectedRecordIds, records]);

  const handleSearch = (event) => {
    setSelectedRecord(null);
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const filtered =
        records?.filter(
          (record) =>
            record.name.toLowerCase().includes(term) ||
            record.getCellValue("Shortcode")?.toLowerCase().includes(term),
        ) || [];
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  };

  // Handle record selection from search
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setSearchTerm("");
    setFilteredRecords([]);
  };

  return (
    <Box>
      <Box padding={2} borderBottom="thick" display="flex" alignItems="center">
        <Box flex="1">
          <Input
            value={searchTerm}
            placeholder="Search projects..."
            width="100%"
            onChange={handleSearch}
          />
        </Box>
      </Box>

      {filteredRecords.length > 0 && (
        <Box
          height="300px"
          border="thick"
          backgroundColor="lightGray1"
          marginBottom={3}
        >
          <RecordCardList
            records={filteredRecords}
            onRecordClick={handleRecordSelect}
          />
        </Box>
      )}

      {selectedRecord ? (
        <Box>
          <Box marginBottom={2} display="flex" justifyContent="space-between">
            <Heading>Selected Project</Heading>
            <Text
              textColor="light"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedRecord(null);
                cursor.setSelectedRecordIds([]);
              }}
            >
              Clear Selection
            </Text>
          </Box>
          <ProjectOverview record={selectedRecord} />
        </Box>
      ) : (
        <Box padding={3}>
          <Text>
            Select a project from the table or use the search bar above
          </Text>
        </Box>
      )}
    </Box>
  );
}

initializeBlock(() => <App />);
