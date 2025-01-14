import React from "react";
import {
  Box,
  Heading,
  Text,
  useRecords,
  RecordCardList,
  Loader,
  ChoiceToken,
} from "@airtable/blocks/ui";

export default function ProjectOverview({ record, isSearchActive, jobsTable, notesTable }) {
  //All the code below this only applies when a record is selected and search is not active
  if (!record || isSearchActive) {
    return null;
  }

  // get only the linked jobs for this record
  const linkedJobsQuery = React.useMemo(() => {
    return record?.selectLinkedRecordsFromCell("Jobs", {
      sorts: [{ field: jobsTable.getFieldByName("Created Date"), direction: "asc" }],
      fields: [
        jobsTable.getFieldByName("Type"),
        jobsTable.getFieldByName("State"),
        jobsTable.getFieldByName("Created Date"),
        jobsTable.getFieldByName("Date Done"),
        jobsTable.getFieldByName("Assignee"),
      ],
    });
  }, [record, jobsTable]);

  const linkedJobs = useRecords(linkedJobsQuery);

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
        width="98%"
        margin="0 auto"
      >
        <Box>
          <Heading size="large">{record.name}</Heading>
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
            key={record.id} // Add key to force re-render (This fixed job not loading bug)
            records={linkedJobs}
            fields={[
              jobsTable.getFieldByName("Type"),
              jobsTable.getFieldByName("State"),
              jobsTable.getFieldByName("Created Date"),
              jobsTable.getFieldByName("Date Done"),
              jobsTable.getFieldByName("Assignee"),
            ]}
            height="400px"
            width="100%"
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

function NotesGrid({ record, notesTable }) {
  const [page, setPage] = React.useState(1);
  const NOTES_PER_PAGE = 10;

  const notes = useRecords(
    record.selectLinkedRecordsFromCell("Notes", {
      sorts: [{ field: notesTable.getFieldByName("Created At"), direction: "desc" }],
      fields: [
        notesTable.getFieldByName("Created At"),
        notesTable.getFieldByName("Type"),
        notesTable.getFieldByName("Custom Comments"),
        notesTable.getFieldByName("Assignee"),
      ],
    }),
  );

  const visibleNotes = React.useMemo(() => {
    return notes?.slice(0, page * NOTES_PER_PAGE) || [];
  }, [notes, page]);

  if (!notes) return <Loader />;
  if (notes.length === 0) return <Text>No notes found</Text>;

  return (
    <Box>
      {visibleNotes.map((note) => (
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
            <Box display="flex" flexDirection="row" alignItems="center">
              {note.getCellValue("Assignee") && (
                <ChoiceToken choice={note.getCellValue("Assignee")} marginRight={2} />
              )}
              <Text size="small" textColor="light">
                {new Date(note.getCellValue("Created At")).toLocaleDateString()}
              </Text>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              {note.getCellValue("Type") && <ChoiceToken choice={note.getCellValue("Type")} />}
            </Box>
          </Box>
          <Text>{note.getCellValue("Custom Comments")}</Text>
        </Box>
      ))}
      {notes.length > visibleNotes.length && (
        <Box display="flex" justifyContent="center" marginTop={2}>
          <Text
            textColor="light"
            style={{ cursor: "pointer" }}
            onClick={() => setPage((p) => p + 1)}
          ></Text>
        </Box>
      )}
    </Box>
  );
}
