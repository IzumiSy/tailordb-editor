import {
  getTailorDBServices,
  getTailorDBTypes,
  getWorkspaceByID,
} from "@/app/api";
import { Content } from "./content";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  workspaceID: string;
}>;

const Page = async (props: { params: PageParams }) => {
  const { workspaceID } = await props.params;

  console.log(workspaceID);
  const ws = await getWorkspaceByID({
    id: workspaceID,
  });

  const tailordbs = await getTailorDBServices({
    workspaceID: workspaceID,
  });
  if (tailordbs.tailordbServices.length === 0) {
    return <div>No TailorDB services found</div>;
  }

  const firstNamespace = tailordbs.tailordbServices[0].namespace.name;
  const tailorDBTypes = await getTailorDBTypes({
    workspaceID: workspaceID,
    namespaceName: firstNamespace,
  });

  return (
    <Content
      workspace={ws.workspace}
      tailorDBTypes={tailorDBTypes.tailordbTypes}
    />
  );
};

export default Page;
