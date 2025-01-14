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

export default function ProjectOverview({
  record,
  isSearchActive,
  preloadedJobs,
  jobsTable,
  notesTable,
}) {
  //this only applies when a record is selected and search is not active
  if (!record || isSearchActive) return null;

  const createDate = jobsTable.getFieldByName("Created Date");

  // Filter pre-loaded jobs based on the current record's linked jobs
  const linkedJobIds = record.getCellValue("Jobs")?.map((job) => job.id) || [];
  const linkedJobs = preloadedJobs
    .filter((job) => linkedJobIds.includes(job.id))
    .sort((a, b) => {
      const dateA = a.getCellValue("Created Date");
      const dateB = b.getCellValue("Created Date");
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    });

  if (!preloadedJobs) return <Loader />;

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
        width="98%"
        margin="0 auto"
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
        <Box>{currentStatus && <ChoiceToken choice={currentStatus} marginRight={1} />}</Box>
      </Box>

      {/* Jobs Section */}
      <Box marginTop={3}>
        <Box width="98%" margin="0 auto">
          <Heading size="small" marginBottom={2}>
            Jobs: ({linkedJobs.length})
          </Heading>
        </Box>
        <Box height="400px" border="thick" borderRadius={3} width="98%" margin="0 auto">
          <RecordCardList
            records={linkedJobs}
            fields={[jobsTable.getFieldByName("Type"), jobsTable.getFieldByName("State")]}
          />
        </Box>
      </Box>

      {/* Notes Section */}
      <Box marginTop={3}>
        <Box width="98%" margin="0 auto">
          <Heading size="small" marginBottom={2}>
            Notes
          </Heading>
        </Box>
        <Box
          border="thick"
          borderRadius={3}
          width="98%"
          margin="0 auto"
          padding={2}
          height="200px"
          overflow="auto"
        >
          <NotesGrid record={record} notesTable={notesTable} />
        </Box>
      </Box>
    </Box>
  );
}

// Notes Grid Component
function NotesGrid({ record, notesTable }) {
  const notes = useRecords(
    record.selectLinkedRecordsFromCell("Notes", {
      sorts: [{ field: notesTable.getFieldByName("Created At"), direction: "desc" }],
    }),
  );

  if (!notes) return <Loader />;
  if (notes.length === 0) return <Text>No notes found</Text>;

  return (
    <Box>
      {notes.map((note) => (
        <Box
          key={note.id}
          backgroundColor="lightGray1"
          padding={2}
          marginBottom={2}
          borderRadius={2}
          display="flex"
          flexDirection="column"
        >
          <Box display="flex" justifyContent="space-between" marginBottom={1}>
            <Text size="small" textColor="light">
              {new Date(note.getCellValue("Created At")).toLocaleDateString()}
            </Text>
            <Text size="small" textColor="light">
              {note.getCellValue("Type")}
            </Text>
          </Box>
          <Text>{note.getCellValue("Custom Comments")}</Text>
        </Box>
      ))}
    </Box>
  );
}
