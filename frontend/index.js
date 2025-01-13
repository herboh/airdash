// App.jsx
import {
  initializeBlock,
  useBase,
  useGlobalConfig,
  Box,
  ViewPickerSynced,
  Button,
} from "@airtable/blocks/ui";
import React from "react";
import ProjectOverview from "./components/ProjectOverview";

const GlobalConfigKeys = {
  VIEW_ID: "viewId",
};

function App() {
  const base = useBase();
  const globalConfig = useGlobalConfig();
  const table = base.getTableByName("Projects");
  const viewId = globalConfig.get(GlobalConfigKeys.VIEW_ID);
  const view = table.getViewByIdIfExists(viewId);

  return (
    <div>
      <Toolbar table={table} />
      <Box margin={3}>
        <ProjectOverview view={view} />
      </Box>
    </div>
  );
}

function Toolbar({ table }) {
  return (
    <Box padding={2} borderBottom="thick" display="flex">
      <ViewPickerSynced
        table={table}
        globalConfigKey={GlobalConfigKeys.VIEW_ID}
      />
    </Box>
  );
}

initializeBlock(() => <App />);
