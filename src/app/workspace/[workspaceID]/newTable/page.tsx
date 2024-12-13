import { OperatorAPI } from "@/app/api";
import { getAuth } from "@/app/auth";
import { Content } from "./content";

type PageProps = {
  params: Promise<{
    workspaceID: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  const tailordbs = await operatorAPI.getTailorDBServices({
    workspaceID: params.workspaceID,
  });
  if (tailordbs.tailordbServices.length === 0) {
    throw new Error("No TailorDB services found");
  }

  const namespace = tailordbs.tailordbServices[0].namespace.name;
  return <Content workspaceID={params.workspaceID} namespaceName={namespace} />;
};

export default Page;
