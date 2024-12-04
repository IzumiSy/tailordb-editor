"use client";
import { setTokenAction } from "@/actions/token";
import { Alert } from "@/components/ui/alert";
import { Center, Box, Stack, Button, Input } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>("");
  const isUnauthorized = !!searchParams.get("unauthorized");

  return (
    <Center backgroundColor="gray.100" height="100vh">
      <Box
        width="550px"
        p={5}
        backgroundColor="white"
        borderRadius="sm"
        boxShadow="xs"
      >
        <Stack>
          {isUnauthorized && (
            <Alert status="error" title="Unauthorized">
              The token you provided is invalid. Please try again with a valid
              token.
            </Alert>
          )}
          <Input
            type="password"
            placeholder="Enter your PAT token"
            onChange={(e) => setToken(e.target.value)}
            value={token}
          />
          <Button onClick={() => setTokenAction(token)}>Set token</Button>
        </Stack>
      </Box>
    </Center>
  );
};

export default Page;
