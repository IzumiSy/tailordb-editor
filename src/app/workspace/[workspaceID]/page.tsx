import { OperatorAPI } from "@/app/api";
import { ContentContainer } from "./content";
import { getAuth, withErrorRedirection } from "@/app/auth";

export const dynamic = "force-dynamic";

export type PageProps = {
  params: Promise<{
    workspaceID: string;
  }>;
};

const Page = async (props: PageProps) => {
  const { workspaceID } = await props.params;

  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  return await withErrorRedirection(async () => {
    const ws = await operatorAPI.getWorkspaceByID({
      id: workspaceID,
    });

    const { namespace, types: tables } = await getTailorDBTypes(
      operatorAPI,
      workspaceID
    );

    return (
      <ContentContainer
        namespaceName={namespace}
        workspace={ws.workspace}
        tailorDBTypes={tables}
      />
    );
  });
};

export const getTailorDBTypes = async (
  operatorAPI: OperatorAPI,
  workspaceID: string
) => {
  const tailordbs = await operatorAPI.getTailorDBServices({
    workspaceID: workspaceID,
  });
  if (tailordbs.tailordbServices.length === 0) {
    throw new Error("No TailorDB services found");
  }

  const firstNamespace = tailordbs.tailordbServices[0].namespace.name;
  const tailorDBTypes = await operatorAPI.getTailorDBTypes({
    workspaceID: workspaceID,
    namespaceName: firstNamespace,
  });

  if (tailorDBTypes.tailordbTypes.length === 0) {
    throw new Error("No TailorDB types found");
  }

  return {
    namespace: firstNamespace,
    types: tailorDBTypes.tailordbTypes,
  };
};

export default Page;
