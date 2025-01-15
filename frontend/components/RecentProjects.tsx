import React from "react";
import { Box, Text, RecordCardList } from "@airtable/blocks/ui";
import { Table } from "@airtable/blocks/models";
import { AirtableService, Project } from "../airtableService";

interface RecentProjectsProps {
  records: Project[];
  recentIds: string[];
  onSelectRecord: (record: Project) => void;
  airtableService: AirtableService;
}

export default function RecentProjects({
  records,
  recentIds,
  onSelectRecord,
  airtableService,
}: RecentProjectsProps) {
  const recentProjects = React.useMemo(() => {
    if (!recentIds || !records) return [];
    return airtableService.getRecentProjects(records, recentIds);
  }, [recentIds, records, airtableService]);

  if (recentProjects.length === 0) return null;

  return (
    <Box width="98%" margin="0 auto">
      <Text size="large" fontWeight={500} marginBottom={2}>
        Pick up where you left off...
      </Text>
      <Box height="465px" border="thick" borderRadius={3}>
        <RecordCardList
          records={recentProjects}
          fields={airtableService.getRecentProjectCardFields()}
        />
      </Box>
    </Box>
  );
}
