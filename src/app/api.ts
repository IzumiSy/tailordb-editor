import ky, { HTTPError } from "ky";
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
      prefixUrl: process.env.NEXT_PUBLIC_API_URL,
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

  async getTailorDBTypes(props: {
    workspaceID: string;
    namespaceName: string;
  }) {
    return await this.request
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

  async createTailorDBType(props: {
    workspaceID: string;
    namespaceName: string;
    typeName: string;
    fields: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
      index: boolean;
      unique: boolean;
      foreignKey: boolean;
      foreignKeyType?: string;
      sourceID?: string;
    }>;
  }) {
    return await this.request
      .post("operator.v1.OperatorService/CreateTailorDBType", {
        json: {
          workspace_id: props.workspaceID,
          namespace_name: props.namespaceName,
          tailordb_type: {
            name: props.typeName,
            schema: {
              description: props.typeName,
              fields: props.fields.reduce((acc, field) => {
                acc[field.name] = {
                  type: field.type,
                  description: field.description,
                  required: field.required,
                  array: false,
                  validate: [],
                  fields: {},
                  index: field.index,
                  unique: field.unique,
                  foreign_key: field.foreignKey,
                  foreign_key_type: field.foreignKeyType,
                  source_id: field.sourceID,
                  allowed_values: [],
                  vector: false,
                };
                return acc;
              }, {} as Record<string, unknown>),
            },
          },
        },
      })
      .json();
  }

  async deleteTailorDBType(props: {
    workspaceID: string;
    namespaceName: string;
    typeName: string;
  }) {
    return await this.request
      .post("operator.v1.OperatorService/DeleteTailorDBType", {
        json: {
          workspace_id: props.workspaceID,
          namespace_name: props.namespaceName,
          tailordb_type_name: props.typeName,
        },
      })
      .json();
  }
}
