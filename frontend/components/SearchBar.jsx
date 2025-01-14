// components/SearchBar.jsx
import React from "react";
import { Box, Input, RecordCardList } from "@airtable/blocks/ui";

export default function SearchBar({ records, onSelectRecord, onSearchActiveChange }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredRecords, setFilteredRecords] = React.useState([]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    onSearchActiveChange(!!term); // Notify parent if search is active

    if (term) {
      const filtered = records.filter(
        (record) =>
          record.name.toLowerCase().includes(term) ||
          record.getCellValue("Shortcode")?.toLowerCase().includes(term),
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  };

  return (
    <Box>
      <Input
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search projects..."
        width="98%"
        marginBottom={2}
        marginTop={2}
        marginX={2}
      />
      {searchTerm && (
        <Box
          height="calc(100vh - 120px)"
          border="thick"
          backgroundColor="lightGray1"
          width="98%"
          margin="0 auto"
        >
          <RecordCardList
            records={filteredRecords}
            onRecordClick={(record) => {
              onSelectRecord(record);
              setSearchTerm("");
              setFilteredRecords([]);
            }}
          />
        </Box>
      )}
    </Box>
  );
}
