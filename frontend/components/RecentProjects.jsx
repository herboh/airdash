import React from "react";
import { Box, Text, RecordCardList } from "@airtable/blocks/ui";

export default function RecentProjects({ table, records, recentIds, onSelectRecord }) {
  const recentProjects = React.useMemo(() => {
    if (!recentIds || !records) return [];
    return recentIds
      .map((id) => records.find((record) => record.id === id))
      .filter((record) => record !== null);
  }, [recentIds, records]);

  if (recentProjects.length === 0) return null;

  return (
    <Box width="98%" margin="0 auto">
      <Text size="large" fontWeight={500} marginBottom={2}>
        Pick up where you left off...
      </Text>
      <Box height="465px" border="thick" borderRadius={3}>
        <RecordCardList
          records={recentProjects}
          fields={[
            table.getFieldByName("Name"),
            table.getFieldByName("Shortcode"),
            table.getFieldByName("Flight Date"),
            table.getFieldByName("Status"),
          ]}
          onRecordClick={onSelectRecord}
        />
      </Box>
    </Box>
  );
}
