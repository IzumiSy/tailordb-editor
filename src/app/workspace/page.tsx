import { Content } from "./content";
import { getAuth, withErrorRedirection } from "../auth";
import { OperatorAPI } from "../api";

const Page = async () => {
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  return await withErrorRedirection(async () => {
    const ws = await operatorAPI.getWorkspaces();

    return <Content ws={ws} />;
  });
};

export default Page;
