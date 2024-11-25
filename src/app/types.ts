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

export type TailorDBTypesResult = {
  tailordbTypes: Array<{
    name: string;
    schema: unknown;
  }>;
};
