import { Base, Table, Record, Field, View } from "@airtable/blocks/models";

//determine what and how other files can interact with
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

//make the airtable lookup function available
export class AirtableService {
  public readonly base: Base;
  public readonly projectsTable: Table;
  public readonly jobsTable: Table;
  public readonly notesTable: Table;
  public readonly projectView: View; //ideally this should always be 'All Projects'
  //skip for now//public readonly jobView: View; //heavy testing,

  constructor(base: Base) {
    this.base = base;

    //build the structure in into mem
    this.projectsTable = base.getTableByName("Projects");
    this.jobsTable = base.getTableByName("Jobs");
    this.notesTable = base.getTableByName("Notes");
    this.projectView = this.projectsTable.getViewByName("All Projects View");
    //going to try to do this wihtout loading//this.jobView = this.jobsTable.getViewByName("All Jobs View");//could limit this by year to reduce memory
    console.log("AirtableService initialized successfully");
  }

  //get important values and nothing else
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
        {
          //sort once to avoid doing it on every search
          field: this.projectsTable.getFieldByName("Flight Date"),
          direction: "desc" as const,
        },
      ],
    };
  }

  //give other functions the ability to see this
  getProjectView() {
    return this.projectView;
  }

  //filter the list of projects loaded in memory to support search function
  filterProjects(records: Project[], searchTerm: string): Project[] {
    const term = searchTerm.toLowerCase().trim();

    const filtered = records.filter((record) => {
      if (!record || typeof record.getCellValue !== "function") {
        console.warn(
          "[AirtableService.filterProjects] Invalid record:",
          record,
        );
        return false;
      }

      //search by shortcode too, should add base here
      const name = String(record.getCellValue("Name") || "").toLowerCase();
      const shortcode = String(
        record.getCellValue("Shortcode") || "",
      ).toLowerCase();

      return name.includes(term) || shortcode.includes(term);
    });

    return filtered;
  }

  //fields to populate job RecordCard
  getJobFields(): Field[] {
    return [
      this.jobsTable.getFieldByName("Type"),
      this.jobsTable.getFieldByName("State"),
      this.jobsTable.getFieldByName("Created Date"),
      this.jobsTable.getFieldByName("Date Done"),
      this.jobsTable.getFieldByName("Assignee"),
      this.jobsTable.getFieldByName("Projects"),
    ];
  }

  //untested, try and make the extension work on jobs table too
  getLinkedProjectFromJob(job: Job): Project | null {
    const linkedProjects = job.selectLinkedRecordsFromCell("Projects", {
      fields: this.getProjectCardFields(),
    });

    if (linkedProjects.records.length > 0) {
      // Assuming a Job is only linked to one Project; take the first one
      return linkedProjects.records[0] as Project;
    }

    return null;
  }

  getNoteFields(): Field[] {
    return [
      this.notesTable.getFieldByName("Created At"),
      this.notesTable.getFieldByName("Type"),
      this.notesTable.getFieldByName("Custom Comments"),
      this.notesTable.getFieldByName("Assignee"),
    ];
  }

  //gets list of jobs associated with project
  getLinkedJobsQuery(record: Project) {
    return record.selectLinkedRecordsFromCell("Jobs", {
      sorts: [
        {
          field: this.jobsTable.getFieldByName("Created Date"),
          direction: "asc" as const, //why is this ascending?
        },
      ],
      fields: this.getJobFields(),
    });
  }

  getLinkedNotesQuery(record: Project) {
    return record.selectLinkedRecordsFromCell("Notes", {
      sorts: [
        {
          field: this.notesTable.getFieldByName("Created At"),
          direction: "desc" as const,
        },
      ],
      fields: this.getNoteFields(),
    });
  }

  //get list of recent jobs in memory. this used to have weird json stuff but it seems like i fixed that
  getRecentProjects(records: Project[], recentIds: string[]): Project[] {
    return recentIds
      .map((id) => records.find((record) => record.id === id))
      .filter((record): record is Project => record !== undefined);
  }

  //get cards for top box of project overview
  getProjectCardFields(): Field[] {
    return [
      this.projectsTable.getFieldByName("Name"),
      this.projectsTable.getFieldByName("Shortcode"),
      this.projectsTable.getFieldByName("Base Shortcode"),
      this.projectsTable.getFieldByName("Flight Date"),
      this.projectsTable.getFieldByName("Status"),
    ];
  }

  //get cards for recent projects
  getRecentProjectCardFields(): Field[] {
    //probably don't need both of these? nope we definitely do
    return [
      this.projectsTable.getFieldByName("Name"),
      this.projectsTable.getFieldByName("Shortcode"),
      this.projectsTable.getFieldByName("Flight Date"),
      this.projectsTable.getFieldByName("Status"),
    ];
  }
}
