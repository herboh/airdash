import { Base, Table, Record, Field, View } from "@airtable/blocks/models";
import { cursor } from "@airtable/blocks";

export interface Project extends Record {
  id: string;
  name: string;
  getCellValue(field: keyof ProjectFields): any;
  selectLinkedRecordsFromCell(field: "Jobs" | "Notes", options?: any): any;
}

export interface Job extends Record {
  id: string;
  getCellValue(field: keyof JobFields): any;
}

export interface Note extends Record {
  id: string;
  getCellValue(field: keyof NoteFields): any;
}

export interface JobFields {
  Type: { name: string; color: string };
  State: { name: string; color: string };
  "Created Date": string;
  "Date Done": string;
  Assignee: { name: string; color: string };
}

export interface NoteFields {
  "Created At": string;
  Type: { name: string; color: string };
  "Custom Comments": string;
  Assignee: { name: string; color: string };
}

export interface ProjectFields {
  Name: string;
  "Flight Date": string;
  Block: string;
  Site: string;
  Status: string;
  "Base Shortcode": Array<{ value: string }>;
  Shortcode: string;
}

export class AirtableService {
  private base: Base;
  private projectsTable: Table;
  private jobsTable: Table;
  private notesTable: Table;
  private projectView: View;

  constructor(base: Base) {
    this.base = base;

    this.projectsTable = base.getTableByName("Projects");
    this.jobsTable = base.getTableByName("Jobs");
    this.notesTable = base.getTableByName("Notes");
    this.projectView = this.projectsTable.getViewByName("All Projects View");
    console.log("AirtableService initialized successfully");
  }

  getRequiredProjectFields(): Field[] {
    return [
      this.projectsTable.getFieldByName("Name"),
      this.projectsTable.getFieldByName("Flight Date"),
      this.projectsTable.getFieldByName("Block"),
      this.projectsTable.getFieldByName("Site"),
      this.projectsTable.getFieldByName("Status"),
      this.projectsTable.getFieldByName("Base Shortcode"),
      this.projectsTable.getFieldByName("Shortcode"),
    ];
  }

  getProjectViewConfig() {
    return {
      fields: this.getRequiredProjectFields(),
      sorts: [
        { field: this.projectsTable.getFieldByName("Flight Date"), direction: "desc" as const },
      ],
    };
  }

  getProjectView() {
    return this.projectView;
  }

  filterProjects(records: Project[], searchTerm: string): Project[] {
    const term = searchTerm.toLowerCase().trim();
    // if (!term) return [];

    return records.filter((record) => {
      const name = String(record.getCellValue("Name") || "").toLowerCase();
      const shortcode = String(record.getCellValue("Shortcode") || "").toLowerCase();

      return name.includes(term) || shortcode.includes(term);
    });
  }
  getJobFields(): Field[] {
    return [
      this.jobsTable.getFieldByName("Type"),
      this.jobsTable.getFieldByName("State"),
      this.jobsTable.getFieldByName("Created Date"),
      this.jobsTable.getFieldByName("Date Done"),
      this.jobsTable.getFieldByName("Assignee"),
    ];
  }

  getNoteFields(): Field[] {
    return [
      this.notesTable.getFieldByName("Created At"),
      this.notesTable.getFieldByName("Type"),
      this.notesTable.getFieldByName("Custom Comments"),
      this.notesTable.getFieldByName("Assignee"),
    ];
  }

  getLinkedJobsQuery(record: Project) {
    return record.selectLinkedRecordsFromCell("Jobs", {
      sorts: [{ field: this.jobsTable.getFieldByName("Created Date"), direction: "asc" as const }],
      fields: this.getJobFields(),
    });
  }

  getLinkedNotesQuery(record: Project) {
    return record.selectLinkedRecordsFromCell("Notes", {
      sorts: [{ field: this.notesTable.getFieldByName("Created At"), direction: "desc" as const }],
      fields: this.getNoteFields(),
    });
  }
  getRecentProjects(records: Project[], recentIds: string[]): Project[] {
    return recentIds
      .map((id) => records.find((record) => record.id === id))
      .filter((record): record is Project => record !== undefined);
  }

  getProjectCardFields(): Field[] {
    return [
      this.projectsTable.getFieldByName("Name"),
      this.projectsTable.getFieldByName("Shortcode"),
      this.projectsTable.getFieldByName("Base Shortcode"),
      this.projectsTable.getFieldByName("Flight Date"),
      this.projectsTable.getFieldByName("Status"),
    ];
  }

  getRecentProjectCardFields(): Field[] {
    //probably don't need both of these?
    return [
      this.projectsTable.getFieldByName("Name"),
      this.projectsTable.getFieldByName("Shortcode"),
      this.projectsTable.getFieldByName("Flight Date"),
      this.projectsTable.getFieldByName("Status"),
    ];
  }
}
