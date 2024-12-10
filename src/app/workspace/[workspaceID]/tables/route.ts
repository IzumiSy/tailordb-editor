import { OperatorAPI } from "@/app/api";
import { getAuth } from "@/app/auth";
import { NextRequest, NextResponse } from "next/server";

type PageParams = Promise<{
  workspaceID: string;
}>;

export const GET = async (_: NextRequest, props: { params: PageParams }) => {
  const { workspaceID } = await props.params;
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  const tailordbs = await operatorAPI.getTailorDBServices({
    workspaceID: workspaceID,
  });
  if (tailordbs.tailordbServices.length === 0) {
    return NextResponse.json({ tables: [] });
  }

  const firstNamespace = tailordbs.tailordbServices[0].namespace.name;
  const tailorDBTypes = await operatorAPI.getTailorDBTypes({
    workspaceID: workspaceID,
    namespaceName: firstNamespace,
  });

  if (tailorDBTypes.tailordbTypes.length === 0) {
    return NextResponse.json({ tables: [] });
  }

  return NextResponse.json({
    tables: tailorDBTypes.tailordbTypes,
  });
};
