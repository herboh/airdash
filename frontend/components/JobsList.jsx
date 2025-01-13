// components/JobsList.jsx
import React from "react";
import { Box, Heading, Icon, Text } from "@airtable/blocks/ui";
import JobRow from "./JobRow.jsx";

export default function JobsList({ linkedRecords, linkedTable }) {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <td style={{ whiteSpace: "nowrap", verticalAlign: "bottom" }}>
            <Heading
              variant="caps"
              size="xsmall"
              marginRight={3}
              marginBottom={0}
            >
              Status
            </Heading>
          </td>
          <td style={{ width: "50%", verticalAlign: "bottom" }}>
            <Heading
              variant="caps"
              size="xsmall"
              marginRight={3}
              marginBottom={0}
            >
              Job Name
            </Heading>
          </td>
          <td style={{ width: "50%", verticalAlign: "bottom" }}>
            <Heading variant="caps" size="xsmall" marginBottom={0}>
              Type
            </Heading>
          </td>
        </tr>
      </thead>
      <tbody>
        {linkedRecords.map((job) => (
          <JobRow key={job.id} job={job} linkedTable={linkedTable} />
        ))}
      </tbody>
    </table>
  );
}
