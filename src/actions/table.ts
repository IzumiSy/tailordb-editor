"use server";
import { FormFields } from "@/app/workspace/[workspaceID]/new-table";

export const createTableAction = async (
  workspaceID: string,
  namespaceName: string,
  data: FormFields
) => {
  // TODO: implement here
  console.log(workspaceID, namespaceName, data);
};
