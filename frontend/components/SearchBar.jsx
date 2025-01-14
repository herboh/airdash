// components/SearchBar.jsx
import React from "react";
import { Box, Input, RecordCardList } from "@airtable/blocks/ui";

export default function SearchBar({ records, onSelectRecord }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredRecords, setFilteredRecords] = React.useState([]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

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
        width="100%"
        marginBottom={2}
      />
      {searchTerm && (
        <Box height="300px" border="thick" backgroundColor="lightGray1">
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
