import React from "react";
import { Box, Input } from "@airtable/blocks/ui";
import { useAppState } from "../appState.tsx";

//draws a search bar
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
