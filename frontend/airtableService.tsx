import { Base, Table, Record, Field, View } from "@airtable/blocks/models";

// Type Definitions
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
  Type: { name: string; color: string };
  Comments: string;
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

//Only way to talk to airtable db
export class AirtableService {
  public readonly base: Base;
  public readonly projectsTable: Table;
  public readonly jobsTable: Table;
  public readonly notesTable: Table;
  public readonly projectView: View;

  //sets up airtable values. Could be done with IDs instead of names
  constructor(base: Base) {
    this.base = base;
    this.projectsTable = base.getTableByName("Projects");
    this.jobsTable = base.getTableByName("Jobs");
    this.notesTable = base.getTableByName("Notes");
    this.projectView = this.projectsTable.getViewByName("All Projects View");
    console.log("AirtableService initialized successfully");
  }

  //concise way to request Project information from airtable
  getProjectFields(): { [key: string]: Field[] } {
    return {
      required: [
        this.projectsTable.getFieldByName("Name"),
        this.projectsTable.getFieldByName("Flight Date"),
        this.projectsTable.getFieldByName("Block"),
        this.projectsTable.getFieldByName("Site"),
        this.projectsTable.getFieldByName("Status"),
        this.projectsTable.getFieldByName("Base Shortcode"),
        this.projectsTable.getFieldByName("Shortcode"),
      ],
      // Fields needed for project cards
      card: [
        this.projectsTable.getFieldByName("Name"),
        this.projectsTable.getFieldByName("Shortcode"),
        this.projectsTable.getFieldByName("Base Shortcode"),
        this.projectsTable.getFieldByName("Flight Date"),
        this.projectsTable.getFieldByName("Status"),
      ],
      // Fields for recent project cards
      recent: [
        this.projectsTable.getFieldByName("Name"),
        this.projectsTable.getFieldByName("Shortcode"),
        this.projectsTable.getFieldByName("Flight Date"),
        this.projectsTable.getFieldByName("Status"),
      ],
    };
  }

  // Sort once
  getProjectViewConfig() {
    return {
      fields: this.getProjectFields().required,
      sorts: [
        {
          field: this.projectsTable.getFieldByName("Flight Date"),
          direction: "desc" as const,
        },
      ],
    };
  }

  //could be wrong but i think this is actually the step that loads the DB into memory
  //I think it only loads once and then is accessed in mem every time after that (except for jobs)
  getProjectView() {
    return this.projectView;
  }

  getJobFields(): { [key: string]: Field[] } {
    return {
      // Builds the job card in ProjectOverview.tsx
      full: [
        this.jobsTable.getFieldByName("Type"),
        this.jobsTable.getFieldByName("State"),
        this.jobsTable.getFieldByName("Created Date"),
        this.jobsTable.getFieldByName("Date Done"),
        this.jobsTable.getFieldByName("Assignee"),
        this.jobsTable.getFieldByName("Projects"),
      ],
      // Returns an array of records, only way I could figure out how to get linked projects efficiently
      lookup: [this.jobsTable.getFieldByName("Projects")],
    };
  }

  //select record that matches
  async getProjectFromJobId(jobId: string): Promise<Project | null> {
    const queryResult = this.jobsTable.selectRecords({
      fields: this.getJobFields().lookup,
    });

    // Make sure the query has loaded its data.
    await queryResult.loadDataAsync();

    const jobRecord = queryResult.getRecordByIdIfExists(jobId);
    if (!jobRecord) {
      return null;
    }

    //finally associate it with projectID and return projectRecord to use in handleRecordSelect
    const linkedProjects = jobRecord.selectLinkedRecordsFromCell("Projects");
    await linkedProjects.loadDataAsync();

    const projectRecord = (linkedProjects.records[0] as Project) || null;
    return projectRecord;
  }

  // Note fields - haven't looked at this in forever - surprise it was broken
  // getNoteFields(): Field[] {
  //   return [
  //     this.notesTable.getFieldByName("Type"),
  //     this.notesTable.getFieldByName("Comments"),
  //     this.notesTable.getFieldByName("Assignee"),
  //   ];
  // }

  // This seems janky, should I debounce here or in appState. appState seems more related to frontend, leaving it there
  filterProjects(records: Project[], searchTerm: string): Project[] {
    const term = searchTerm.toLowerCase().trim();

    return records.filter((record) => {
      if (!record || typeof record.getCellValue !== "function") {
        console.warn("[AirtableService.filterProjects] Invalid record:", record);
        return false;
      }

      const name = String(record.getCellValue("Name") || "").toLowerCase();
      const shortcode = String(record.getCellValue("Shortcode") || "").toLowerCase();

      return name.includes(term) || shortcode.includes(term); //need to re-add base project lookup as well.
      //base project is tricky because it's stored as an array
    });
  }

  // This populates the jobs in ProjectOVerview.tsx.
  getLinkedJobsQuery(record: Project) {
    return record.selectLinkedRecordsFromCell("Jobs", {
      sorts: [
        {
          field: this.jobsTable.getFieldByName("Created Date"),
          direction: "asc" as const, //Not sure if I made this ascending for a reason or not
        },
      ],
      fields: this.getJobFields().full,
    });
  }

  // getLinkedNotesQuery(record: Project) {
  //   return record.selectLinkedRecordsFromCell("Notes", {
  //     sorts: [
  //       {
  //         direction: "desc" as const,
  //       },
  //     ],
  //     fields: this.getNoteFields(),
  //   });
  // }

  // Recent projects handling // similar to search. This is old and janky and weird but it works. Leaving it
  getRecentProjects(records: Project[], recentIds: string[]): Project[] {
    const recordMap = new Map(records.map((r) => [r.id, r]));
    return recentIds.map((id) => recordMap.get(id)).filter(Boolean) as Project[];
  }
}
