import { OperatorAPI } from "@/app/api";
import { getAuth, withErrorRedirection } from "@/app/auth";
import { getTailorDBTypes } from "../../page";
import { Content } from "./content";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    workspaceID: string;
    tableName: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  return await withErrorRedirection(async () => {
    const { types, namespace } = await getTailorDBTypes(
      operatorAPI,
      params.workspaceID
    );
    const currentTypes = types.find((table) => table.name === params.tableName);

    if (!currentTypes) {
      redirect(`/workspace/${params.workspaceID}`);
    }

    return (
      currentTypes && (
        <Content
          workspaceID={params.workspaceID}
          namespaceName={namespace}
          currentType={currentTypes}
        />
      )
    );
  });
};

export default Page;
