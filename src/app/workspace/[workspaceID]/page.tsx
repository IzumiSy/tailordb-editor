import { OperatorAPI } from "@/app/api";
import { ContentContainer } from "./content";
import { useAuth, withErrorRedirection } from "@/app/auth";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  workspaceID: string;
}>;

const Page = async (props: { params: PageParams }) => {
  const { workspaceID } = await props.params;
  const { patToken } = await useAuth();
  const operatorAPI = new OperatorAPI(patToken);

  return await withErrorRedirection(async () => {
    const ws = await operatorAPI.getWorkspaceByID({
      id: workspaceID,
    });

    const tailordbs = await operatorAPI.getTailorDBServices({
      workspaceID: workspaceID,
    });
    if (tailordbs.tailordbServices.length === 0) {
      return <div>No TailorDB services found</div>;
    }

    const firstNamespace = tailordbs.tailordbServices[0].namespace.name;
    const tailorDBTypes = await operatorAPI.getTailorDBTypes({
      workspaceID: workspaceID,
      namespaceName: firstNamespace,
    });

    if (tailorDBTypes.tailordbTypes.length === 0) {
      return <div>No TailorDB types found</div>;
    }

    return (
      <ContentContainer
        namespaceName={firstNamespace}
        workspace={ws.workspace}
        tailorDBTypes={tailorDBTypes.tailordbTypes}
      />
    );
  });
};

export default Page;
