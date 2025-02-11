import React from "react";
import { Box, Input, RecordCardList } from "@airtable/blocks/ui";
import { AirtableService, Project } from "../airtableService";
import { useAppState } from "../appState.tsx";

export default function SearchBar() {
  const { searchTerm, handleSearch } = useAppState();

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
