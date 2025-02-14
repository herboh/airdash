import React from "react";
import { AirtableService, Project } from "../airtableService";
import {
  Box,
  Heading,
  Text,
  useRecords,
  RecordCardList,
  Loader,
  ChoiceToken,
} from "@airtable/blocks/ui";
import { Table } from "@airtable/blocks/models";

interface ProjectOverviewProps {
  record: Project;
  isSearchActive: boolean;
  jobsTable: Table;
  notesTable: Table;
  airtableService: AirtableService;
}

//define what goes on the main layout when a record is selected
export default function ProjectOverview({
  record,
  jobsTable,
  notesTable,
  airtableService,
}: ProjectOverviewProps) {
  console.log("Rendering ProjectOverview", { record });
  const linkedJobsQuery = React.useMemo(() => {
    return airtableService.getLinkedJobsQuery(record);
  }, [record, airtableService]);
  const linkedNotesQuery = React.useMemo(() => {
    return airtableService.getLinkedNotesQuery(record);
  }, [record, airtableService]);
  const linkedJobs = useRecords(linkedJobsQuery) || [];
  const linkedNotes = useRecords(linkedNotesQuery) || [];

  const currentStatus = record.getCellValue("Status");
  const RECORD_CARD_HEIGHT = 94;
  const jobHeight = linkedJobs.length * RECORD_CARD_HEIGHT;
  const notesHeight = linkedNotes.length * RECORD_CARD_HEIGHT;

  //TODO - fix. everthing below hasnt been cared for, particularly the Notes
  return (
    <Box margin={1}>
      {/* Project Header Section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding={3}
        paddingBottom={1}
        border="thick"
        borderRadius="large"
        backgroundColor="lightGray1"
        width="100%"
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        borderColor="Gray2"
      >
        <Box display="flex" flexDirection="column" justifyContent="flex-start">
          <Heading
            size="large"
            marginBottom={1}
            style={{ textOverflow: "ellipsis" }}
            maxWidth="800px"
          >
            {record.name}
          </Heading>

          <Box display="flex" flexDirection="column" style={{ gap: "0.1rem" }}>
            <Box display="flex" alignItems="center">
              <Text
                variant="paragraph"
                size="default"
                textColor="gray"
                marginRight={1}
              >
                Shortcode:
              </Text>
              <Text variant="paragraph" size="default" fontWeight={500}>
                {record.getCellValue("Shortcode") || "-"}
              </Text>
            </Box>
            <Box display="flex" alignItems="center">
              <Text
                variant="paragraph"
                size="default"
                textColor="gray"
                marginRight={1}
              >
                Base Project:
              </Text>
              <Text variant="paragraph" size="default" fontWeight={500}>
                {record.getCellValue("Base Shortcode")?.[0]?.value || "-"}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box>
          {currentStatus && (
            <ChoiceToken choice={currentStatus} marginLeft={2} />
          )}
        </Box>
      </Box>

      {/* Jobs Section */}
      <Box marginTop={3}>
        <Box width="98%" margin="0 auto">
          <Heading size="small" marginBottom={2}>
            Jobs: ({linkedJobs?.length || 0})
          </Heading>
        </Box>
        <Box
          border="thick"
          borderRadius={3}
          width="98%"
          margin="0 auto"
          style={{ height: jobHeight, overflow: "visible" }}
        >
          <RecordCardList
            key={record.id}
            records={linkedJobs}
            fields={[
              jobsTable.getFieldByName("Type"),
              jobsTable.getFieldByName("State"),
              jobsTable.getFieldByName("Created Date"),
              jobsTable.getFieldByName("Date Done"),
              jobsTable.getFieldByName("Assignee"),
            ]}
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
          style={{ height: notesHeight, overflow: "visible" }}
        >
          <RecordCardList
            records={linkedNotes}
            fields={[
              notesTable.getFieldByName("Type"),
              notesTable.getFieldByName("Assignee"),
              notesTable.getFieldByName("Comments"),
              notesTable.getFieldByName("Created"),
            ]}
            width="100%"
          />
        </Box>
      </Box>
    </Box>
  );
}

// interface NotesGridProps {
//   record: Project;
//   notesTable: Table;
//   airtableService: AirtableService;
// }
//
// function NotesGrid({ record, notesTable, airtableService }: NotesGridProps) {
//   const [page, setPage] = React.useState(1);
//   const NOTES_PER_PAGE = 10;
//
//   const notes = useRecords(airtableService.getLinkedNotesQuery(record)) || [];
//   console.log("Fetched Notes:", notes);
//
//   const visibleNotes = React.useMemo(() => {
//     return notes.slice(0, page * NOTES_PER_PAGE);
//   }, [notes, page]);
//
//   if (notes.length === 0) {
//     return (
//       <Box padding={2} display="flex" justifyContent="center">
//         <Text>No notes found</Text>
//       </Box>
//     );
//   }
//
//   const renderNote = (note: any) => {
//     const assignee = note.getCellValue("Assignee") || "Unknown";
//     const type = note.getCellValue("Type") || "Unknown";
//     const comments = note.getCellValue("Comments") || "No comments";
//
//     return (
//       <Box
//         key={note.id}
//         backgroundColor="lightGray1"
//         padding={2}
//         marginBottom={2}
//         borderRadius={2}
//         display="flex"
//         flexDirection="column"
//         borderColor="transparent"
//       >
//         <Box display="flex" justifyContent="space-between" marginBottom={1}>
//           <Box display="flex" flexDirection="row" alignItems="center">
//             {assignee && <ChoiceToken choice={assignee} marginRight={2} />}
//             <Text size="small" textColor="light"></Text>
//           </Box>
//           <Box display="flex" flexDirection="column" alignItems="flex-end">
//             {type && <ChoiceToken choice={type} />}
//           </Box>
//         </Box>
//         <Text variant="paragraph">{comments || "No comments"}</Text>
//       </Box>
//     );
//   };
//
//   return (
//     <Box padding={1}>
//       {visibleNotes.map(renderNote)}
//       {notes.length > visibleNotes.length && (
//         <Box
//           display="flex"
//           justifyContent="center"
//           marginTop={2}
//           padding={2}
//           backgroundColor="lightGray1"
//           borderRadius={2}
//           style={{ cursor: "pointer" }}
//           onClick={() => setPage((p) => p + 1)}
//         >
//           <Text textColor="light">
//             Load more ({notes.length - visibleNotes.length} remaining)
//           </Text>
//         </Box>
//       )}
//     </Box>
//   );
// }
