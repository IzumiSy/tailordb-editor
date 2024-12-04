"use client";
import { TailorDBTypesResult, WorkspaceResult } from "@/app/types";
import { TailorDBTable } from "@/components/table";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { SchemaViewer } from "./schema-viewer";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";

type TailorDBTypes = TailorDBTypesResult["tailordbTypes"];
type TailorDBType = TailorDBTypes[number];

const getTailorDBTypeByName = (
  types: TailorDBTypes,
  name: string | undefined
) => types.find((type) => type.name === name) ?? null;

const TypeSelector = (props: {
  currentType: TailorDBType | null;
  types: TailorDBTypesResult["tailordbTypes"];
  onChange: (type: TailorDBType) => void;
}) => {
  const { types } = props;

  return (
    <NativeSelectRoot size="sm" variant="subtle">
      <NativeSelectField
        paddingX={2}
        value={props.currentType?.name}
        onChange={(e) => {
          const selectedType = getTailorDBTypeByName(types, e.target.value);
          if (!selectedType) {
            return;
          }
          props.onChange(selectedType);
        }}
      >
        {types.map((type) => (
          <option key={type.name} value={type.name}>
            {type.name}
          </option>
        ))}
      </NativeSelectField>
    </NativeSelectRoot>
  );
};

type ContentContainerProps = {
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
};

export const ContentContainer = (props: ContentContainerProps) => {
  return (
    <ReactFlowProvider>
      <Content containerProps={props} />
    </ReactFlowProvider>
  );
};

type ContentProps = {
  containerProps: ContentContainerProps;
};

const Content = (props: ContentProps) => {
  const reactFlow = useReactFlow();
  const { workspace, tailorDBTypes } = props.containerProps;
  const initialTailorDBType = tailorDBTypes[0];
  const [currentType, setCurrentType] = useState<TailorDBType | null>(
    getTailorDBTypeByName(tailorDBTypes, initialTailorDBType.name)
  );
  const [isSchemaViewerInitialized, setSchemaViewerInitialized] =
    useState(false);

  return (
    <Stack gap={0} height="100vh">
      <Flex p={2} justifyContent={"space-between"}>
        <HStack>
          <Heading fontWeight={"bold"}>TailorDB Editor</Heading>
          <Badge> {workspace.name}</Badge>
        </HStack>
      </Flex>
      <HStack gap={0} borderTop={"1px solid #e2e2e2"} height="100%">
        <Allotment onChange={() => reactFlow.fitView()}>
          <Allotment.Pane preferredSize={"50%"}>
            <SchemaViewer
              types={tailorDBTypes}
              onInitialized={() => setSchemaViewerInitialized(true)}
              onTableClicked={(typeName) => {
                setCurrentType(getTailorDBTypeByName(tailorDBTypes, typeName));
              }}
            />
          </Allotment.Pane>
          <Allotment.Pane>
            {isSchemaViewerInitialized ? (
              <>
                <Flex p={2} justifyContent={"space-between"}>
                  <Box width="300px" resize="both">
                    <TypeSelector
                      currentType={currentType}
                      onChange={setCurrentType}
                      types={tailorDBTypes}
                    />
                  </Box>
                  <Box>
                    <Button size="xs">Add column</Button>
                  </Box>
                </Flex>
                <Flex>
                  <TailorDBTable
                    data={currentType?.schema.fields || {}}
                    handlers={{
                      onClickSourceType: (typeName) => {
                        setCurrentType(
                          getTailorDBTypeByName(tailorDBTypes, typeName)
                        );
                      },
                    }}
                  />
                </Flex>
              </>
            ) : (
              <Flex p={3}>
                <Text>Initializing...</Text>
              </Flex>
            )}
          </Allotment.Pane>
        </Allotment>
      </HStack>
    </Stack>
  );
};
