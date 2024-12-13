"use server";
import { OperatorAPI } from "@/app/api";
import { getAuth } from "@/app/auth";
import { FormFields } from "@/app/types";

export const createTableAction = async (
  workspaceID: string,
  namespaceName: string,
  data: FormFields
) => {
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  try {
    await operatorAPI.createTailorDBType({
      workspaceID: workspaceID,
      namespaceName: namespaceName,
      typeName: data.name,
      fields: data.fields.map((field) => ({
        name: field.name,
        type: field.type,
        description: field.description,
        required: !!field.required,
        index: !!field.index,
        unique: !!field.unique,
        foreignKey: !!field.foreignKey,
        foreignKeyType: field.foreignKeyType,
        sourceID: field.sourceID,
      })),
    });

    return {
      success: true,
    } as const;
  } catch (e) {
    return {
      success: false,
      result: e as Error,
    } as const;
  }
};

export const deleteTableAction = async (
  workspaceID: string,
  namespaceName: string,
  typeName: string
) => {
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  try {
    await operatorAPI.deleteTailorDBType({
      workspaceID: workspaceID,
      namespaceName: namespaceName,
      typeName: typeName,
    });

    return {
      success: true,
    } as const;
  } catch (e) {
    return {
      success: false,
      result: e as Error,
    } as const;
  }
};
