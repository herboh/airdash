// components/ProjectOverview.jsx
import React from "react";
import ProjectHeader from "./ProjectHeader";
import { useRecords, Box, Heading } from "@airtable/blocks/ui";

export default function ProjectOverview({ view }) {
  const records = useRecords(view);

  if (!view) {
    return <div>Pick a view</div>;
  }

  return (
    <Box>
      {records.map((record) => (
        <ProjectHeader key={record.id} record={record} />
      ))}
    </Box>
  );
}
