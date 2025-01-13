// components/JobRow.jsx
import React from "react";
import { Box, Icon, Text, CellRenderer } from "@airtable/blocks/ui";

export default function JobRow({ job, linkedTable }) {
  const isStatus = job.getCellValue("Status");

  return (
    <tr style={{ borderTop: "2px solid #ddd" }}>
      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        <Box
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          width="16px"
          height="16px"
          marginRight={3}
          borderRadius="100%"
          backgroundColor={isStatus ? "green" : "red"}
          textColor="white"
        >
          <Icon name={isStatus ? "check" : "x"} size={12} />
        </Box>
      </td>
      <td style={{ width: "50%" }}>
        <Text marginRight={3}>{job.name}</Text>
      </td>
      <td style={{ width: "50%" }}>
        <CellRenderer record={job} field={linkedTable.getFieldByName("Type")} />
      </td>
    </tr>
  );
}
