// components/ProjectHeader.jsx
import React from "react";
import { Box, Heading, Text, useBase, useRecords } from "@airtable/blocks/ui";
import JobsList from "./JobsList.jsx";

export default function ProjectHeader({ record }) {
  const base = useBase();
  const linkedTable = base.getTableByName("Jobs");
  const linkedRecords = useRecords(
    record.selectLinkedRecordsFromCell("Jobs", {
      sorts: [{ field: linkedTable.primaryField, direction: "asc" }],
    }),
  );

  return (
    <Box marginY={3}>
      <Heading>{record.name}</Heading>
      <JobsList linkedRecords={linkedRecords} linkedTable={linkedTable} />
    </Box>
  );
}
