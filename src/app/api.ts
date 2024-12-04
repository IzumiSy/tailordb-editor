import ky, { HTTPError, NormalizedOptions } from "ky";
import {
  TailorDBServicesResult,
  TailorDBTypesResult,
  WorkspaceResult,
  WorkspacesResult,
} from "./types";

export class UnauthorizedError extends HTTPError {
  constructor(baseError: HTTPError) {
    super(baseError.response, baseError.request, baseError.options);
    this.name = "UnauthorizedError";
  }
}

export class OperatorAPI {
  private request: typeof ky;

  constructor(token: string) {
    this.request = ky.extend({
      prefixUrl: process.env.API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      hooks: {
        beforeError: [
          (error) => {
            const { response } = error;
            switch (response.status) {
              case 401:
                return new UnauthorizedError(error);
              default:
                return error;
            }
          },
        ],
      },
    });
  }

  async getWorkspaces() {
    return await this.request
      .post<WorkspacesResult>("operator.v1.OperatorService/ListWorkspaces", {
        json: {},
      })
      .json();
  }

  async getWorkspaceByID(props: { id: string }) {
    return await this.request
      .post<WorkspaceResult>("operator.v1.OperatorService/GetWorkspace", {
        json: {
          workspace_id: props.id,
        },
      })
      .json();
  }

  async getTailorDBServices(props: { workspaceID: string }) {
    return await this.request
      .post<TailorDBServicesResult>(
        "operator.v1.OperatorService/ListTailorDBServices",
        {
          json: {
            workspace_id: props.workspaceID,
          },
        }
      )
      .json();
  }

  getTailorDBTypes(props: { workspaceID: string; namespaceName: string }) {
    return this.request
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
  }
}
