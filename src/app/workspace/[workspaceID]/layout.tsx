import { Badge, Flex, Heading, HStack, Link, Stack } from "@chakra-ui/react";
import { PageProps } from "./page";
import { OperatorAPI } from "@/app/api";
import { getAuth } from "@/app/auth";

const Layout = async (props: React.PropsWithChildren<PageProps>) => {
  const { workspaceID } = await props.params;
  const { patToken } = await getAuth();
  const operatorAPI = new OperatorAPI(patToken);

  const wr = await operatorAPI.getWorkspaceByID({
    id: workspaceID,
  });

  return (
    <Stack gap={0} height="100vh">
      <Flex p={2} justifyContent={"space-between"}>
        <HStack>
          <Heading fontWeight={"bold"}>TailorDB Editor</Heading>
          <Badge>
            <Link href="/workspace">{wr.workspace.name}</Link>
          </Badge>
        </HStack>
      </Flex>
      <Stack
        gap={0}
        borderTop={"1px solid #e2e2e2"}
        height="100%"
        alignItems="start"
      >
        {props.children}
      </Stack>
    </Stack>
  );
};

export default Layout;
