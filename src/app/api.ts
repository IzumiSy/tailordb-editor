import ky from "ky";
import {
  TailorDBServicesResult,
  TailorDBTypesResult,
  WorkspaceResult,
  WorkspacesResult,
} from "./types";

const tailorAPI = ky.extend({
  prefixUrl: "https://api.dev.tailor.tech/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer tpp_ZcNd1pDwq68I38o2Oh2VE9gLPM75k0Gv`,
  },
});

export const getWorkspaces = async () => {
  return await tailorAPI
    .post<WorkspacesResult>("operator.v1.OperatorService/ListWorkspaces", {
      json: {},
    })
    .json();
};

export const getWorkspaceByID = async (props: { id: string }) => {
  return await tailorAPI
    .post<WorkspaceResult>("operator.v1.OperatorService/GetWorkspace", {
      json: {
        workspace_id: props.id,
      },
    })
    .json();
};

export const getTailorDBServices = async (props: { workspaceID: string }) => {
  return await tailorAPI
    .post<TailorDBServicesResult>(
      "operator.v1.OperatorService/ListTailorDBServices",
      {
        json: {
          workspace_id: props.workspaceID,
        },
      }
    )
    .json();
};

export const getTailorDBTypes = async (props: {
  workspaceID: string;
  namespaceName: string;
}) => {
  return await tailorAPI
    .post<TailorDBTypesResult>(
      "operator.v1.OperatorService/ListTailorDBTypes",
      {
        json: {
          workspace_id: props.workspaceID,
          namespace_name: props.namespaceName,
        },
      }
    )
    .json();
};
