import React from "react";
import { Box, Input, RecordCardList } from "@airtable/blocks/ui";
import { AirtableService, Project } from "../airtableService";
import { useAppState } from "../appState.tsx";

interface SearchBarProps {
  records: Project[];
  onSelectRecord: (record: Project) => void;
  onSearchActiveChange: (active: boolean) => void;
  airtableService: AirtableService;
}

export default function SearchBar() {
  const { searchTerm, handleSearch, filteredRecords, handleRecordSelect, airtableService } =
    useAppState();

  return (
    <Box>
      <Input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search projects..."
        width="98%"
        marginBottom={2}
        marginTop={2}
      />
    </Box>
  );
}
