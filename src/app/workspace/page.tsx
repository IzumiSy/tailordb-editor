import { Content } from "./content";
import { useAuth, withErrorRedirection } from "../auth";
import { OperatorAPI } from "../api";

const Page = async () => {
  const { patToken } = await useAuth();
  const operatorAPI = new OperatorAPI(patToken);

  return await withErrorRedirection(async () => {
    const ws = await operatorAPI.getWorkspaces();

    return <Content ws={ws} />;
  });
};

export default Page;
