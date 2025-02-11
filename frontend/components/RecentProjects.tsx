import React from "react";
import { Box, Text, RecordCardList } from "@airtable/blocks/ui";
import { AirtableService, Project } from "../airtableService";
import { useAppState } from "../appState";

interface RecentProjectsProps {
  records: Project[];
  recentIds: string[];
  onSelectRecord: (record: Project) => void;
  airtableService: AirtableService;
}
//create default layout on main window, shows recent projects
export default function RecentProjects({
  records,
  recentIds,
  airtableService,
}: RecentProjectsProps) {
  const { handleRecordSelect } = useAppState();
  const recentProjects = React.useMemo(() => {
    //memo does something cool with only retrieving once. May need to add more places
    if (!recentIds || !records) return [];
    return airtableService.getRecentProjects(records, recentIds);
  }, [recentIds, records, airtableService]);

  if (recentProjects.length === 0) return null;

  return (
    <Box width="98%" margin="0 auto">
      <Text size="large" fontWeight={500} marginBottom={2}>
        Pick up where you left off...
      </Text>
      <Box height="665px" border="thick" borderRadius={3}>
        <RecordCardList
          records={recentProjects}
          fields={airtableService.getProjectFields().recent}
          onRecordClick={(record) => {
            if (record) {
              handleRecordSelect(record as Project);
            }
          }}
        />
      </Box>
    </Box>
  );
}
