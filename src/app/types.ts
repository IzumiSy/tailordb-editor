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
