import React from "react";
import { Box, Input, RecordCardList } from "@airtable/blocks/ui";
import { AirtableService, Project } from "../airtableService";

interface SearchBarProps {
  records: Project[];
  onSelectRecord: (record: Project) => void;
  onSearchActiveChange: (active: boolean) => void;
  airtableService: AirtableService;
}

export default function SearchBar({
  records,
  onSelectRecord,
  onSearchActiveChange,
  airtableService,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredRecords, setFilteredRecords] = React.useState<Project[]>([]);

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
      />
      {filteredRecords.length > 0 && (
        <Box width="98%" margin="0 auto">
          <RecordCardList
            records={filteredRecords}
            fields={airtableService.getProjectCardFields()}
            width="98%"
            margin="0 auto"
            onRecordClick={(record) => {
              onSelectRecord(record as Project);
              setSearchTerm("");
              setFilteredRecords([]);
            }}
          />
        </Box>
      )}
    </Box>
  );
}
