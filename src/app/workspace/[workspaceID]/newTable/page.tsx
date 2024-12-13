import { Stack, Flex, HStack, Button, Input } from "@chakra-ui/react";
import Link from "next/link";

type PageProps = {
  params: Promise<{
    workspaceID: string;
  }>;
};

const Page = async (props: PageProps) => {
  const params = await props.params;

  return (
    <Stack width={"100%"} gap={0}>
      <Flex p={2} justifyContent={"space-between"} width={"100%"} gap={2}>
        <Input placeholder="Table name" size="xs" />
        <HStack>
          <Button size="xs">Save changes</Button>
          <Button
            as={Link}
            // @ts-ignore
            href={`/workspace/${params.workspaceID}`}
            size="xs"
            variant="ghost"
          >
            Close
          </Button>
        </HStack>
      </Flex>
    </Stack>
  );
};

export default Page;
