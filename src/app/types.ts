import { unique } from "next/dist/build/utils";

export type ApplicationResult = {
  name: string;
  url: string;
};

export type ApplicationsResult = {
  applications: Array<ApplicationResult>;
};

export type WorkspacesResult = {
  workspaces: Array<{
    id: string;
    name: string;
  }>;
};

export type WorkspaceResult = {
  workspace: WorkspacesResult["workspaces"][0];
};

export type TailorDBServicesResult = {
  tailordbServices: Array<{
    namespace: {
      name: string;
    };
  }>;
};

export type TailorDBSchemaField = {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  index?: boolean;
  unique?: boolean;
  array?: boolean;
  foreignKey?: boolean;
  foreignKeyType?: string;
  sourceId?: string;
  allowedValues?: Array<{
    value: string;
    description: string;
  }>;
};

export type TailorDBSchemaFields = Record<string, TailorDBSchemaField>;

export type TailorDBType = {
  name: string;
  schema: {
    description: string;
    fields: TailorDBSchemaFields;
  };
};
export type TailorDBTypesResult = {
  tailordbTypes: Array<TailorDBType>;
};

export const fieldTypes = {
  string: {
    label: "String",
  },
  uuid: {
    label: "UUID",
  },
  number: {
    label: "Number",
  },
  boolean: {
    label: "Boolean",
  },
  enum: {
    label: "Enum",
  },
  date: {
    label: "Date",
  },
  time: {
    label: "Time",
  },
  dateTime: {
    label: "DateTime",
  },
} as const;

export type TableField = {
  name: string;
  description: string;
  type: keyof typeof fieldTypes;
  required: false | "on";
  index: false | "on";
  unique: false | "on";
  nested: false | "on";
  array: false | "on";
  foreignKey?: false | "on";
  foreignKeyType?: string;
  sourceID?: string;
  hasSource?: boolean;
  allowedValues?: Array<{
    value: string;
    description: string;
  }>;
};

export type FormFields = {
  name: string;
  fields: Array<TableField>;
};
