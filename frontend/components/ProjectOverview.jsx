import React from "react";
import {
  Box,
  Heading,
  Text,
  useBase,
  useRecords,
  RecordCardList,
  Loader,
  ChoiceToken,
} from "@airtable/blocks/ui";

export default function ProjectOverview({ record }) {
  //this only applies when a record is selected
  if (!record) return null;

  const base = useBase();
  const projectsTable = base.getTableByName("Projects");
  //const projectStatus = projectsTable.getFieldByName("Status"); //Trying to do this on line 35
  //const projectPriority = projectsTable.getFieldByName("Priority");
  const jobsTable = base.getTableByName("Jobs");
  const createDate = jobsTable.getFieldByName("Created Date");
  const jobStatus = jobsTable.getFieldByName("Status");

  // Get linked jobs
  const linkedJobs = useRecords(
    record.selectLinkedRecordsFromCell("Jobs", {
      sorts: [{ field: createDate, direction: "asc" }],
    }),
  );

  if (!linkedJobs) return <Loader />;

  const currentStatus = record.getCellValue("Status");

  return (
    <Box>
      {/* Project Header Section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom={3}
        padding={3}
        border="thick"
        borderRadius={3}
        backgroundColor="lightGray1"
      >
        <Box>
          <Heading size="large">{record.name}</Heading>
          {/* <Text variant="paragraph" size="large" marginTop={2}> */}
          {/*   Shortcode: {record.getCellValue("Shortcode")} */}
          {/* </Text> */}
          <Text variant="paragraph" size="large">
            Base Project: {record.getCellValue("Base Shortcode")?.[0]?.value}
          </Text>
        </Box>
        <Box>
          {currentStatus && (
            <ChoiceToken choice={currentStatus} marginRight={1} />
          )}
        </Box>
      </Box>

      {/* Jobs Section */}
      <Box marginTop={3}>
        <Heading size="small" marginBottom={2}>
          Jobs ({linkedJobs.length})
        </Heading>
        <Box height="400px" border="thick" borderRadius={3}>
          <RecordCardList
            records={linkedJobs}
            fields={[
              jobsTable.getFieldByName("Type"),
              jobsTable.getFieldByName("Status"),
              jobsTable.getFieldByName("State"),
            ]}
          />
        </Box>
      </Box>
    </Box>
  );
}
