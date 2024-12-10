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
  foreignKey?: boolean;
  foreignKeyType?: string;
  sourceId?: string;
};

export type TailorDBSchemaFields = Record<string, TailorDBSchemaField>;

export type TailorDBTypesResult = {
  tailordbTypes: Array<{
    name: string;
    schema: {
      description: string;
      fields: TailorDBSchemaFields;
    };
  }>;
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

type TableField = {
  name: string;
  description: string;
  type: keyof typeof fieldTypes;
  required: false | "on";
  index: false | "on";
  unique: false | "on";
  nested: false | "on";
  array: false | "on";
  foreignKey?: string;
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
