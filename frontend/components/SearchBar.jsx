import React from "react";
import { Box, Input, RecordCardList } from "@airtable/blocks/ui";

export default function SearchBar({ records, table, onSelectRecord, onSearchActiveChange }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredRecords, setFilteredRecords] = React.useState([]);

  const handleSearch = (event) => {
    const userInput = event.target.value;
    const searchTerm = userInput.toLowerCase();
    setSearchTerm(userInput); // Store original user input with case preserved
    onSearchActiveChange(!!userInput);

    if (searchTerm) {
      const filtered = records.filter((record) => {
        const name = record.name.toLowerCase();
        const shortcode = record.getCellValue("Shortcode")?.toLowerCase() || "";
        const baseShortcode =
          record.getCellValue("Base Shortcode")?.[0]?.value?.toLowerCase() || "";

        return (
          name.includes(searchTerm) ||
          shortcode.includes(searchTerm) ||
          baseShortcode.includes(searchTerm)
        );
      });
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
            fields={[
              table.getFieldByName("Name"),
              table.getFieldByName("Shortcode"),
              table.getFieldByName("Base Shortcode"),
              table.getFieldByName("Flight Date"),
              table.getFieldByName("Status"),
            ]}
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
