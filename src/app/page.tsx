import { Content } from "./content";
import { getWorkspaces } from "./api";

const Page = async () => {
  const ws = await getWorkspaces();

  return <Content ws={ws} />;
};

export default Page;
