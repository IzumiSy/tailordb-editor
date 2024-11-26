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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { SchemaViewer } from "./schema-viewer";

type TailorDBTypes = TailorDBTypesResult["tailordbTypes"];
type TailorDBType = TailorDBTypes[number];

const getTailorDBTypeByName = (
  types: TailorDBTypes,
  name: string | undefined
) => {
  return types.find((type) => type.name === name) ?? null;
};

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

type ContentProps = {
  initialTypeName?: string;
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
};

export const Content = (props: ContentProps) => {
  const { workspace } = props;
  const initialType = getTailorDBTypeByName(
    props.tailorDBTypes,
    props.initialTypeName
  );
  const [currentType, setCurrentType] = useState<TailorDBType | null>(
    initialType
  );

  useEffect(() => {
    if (!currentType && props.tailorDBTypes.length > 0) {
      setCurrentType(props.tailorDBTypes[0]);
    }
  }, []);

  return (
    <Stack gap={0} height="100vh">
      <Flex p={2} justifyContent={"space-between"}>
        <HStack>
          <Heading fontWeight={"bold"}>TailorDB Editor</Heading>
          <Badge> {workspace.name}</Badge>
        </HStack>
      </Flex>
      <HStack gap={0} borderTop={"1px solid #e2e2e2"}>
        <Box
          width="55vw"
          height="calc(100vh - 48px)"
          borderRight={"1px solid #e2e2e2"}
        >
          <SchemaViewer
            types={props.tailorDBTypes}
            onTableClicked={(typeName) => {
              setCurrentType(
                getTailorDBTypeByName(props.tailorDBTypes, typeName)
              );
            }}
          />
        </Box>
        <Flex alignSelf="flex-start" flex={1}>
          <Stack width="100%" gap={0}>
            <Flex p={2} justifyContent={"space-between"}>
              <Box width="300px">
                <TypeSelector
                  currentType={currentType}
                  onChange={setCurrentType}
                  types={props.tailorDBTypes}
                />
              </Box>
              <Box>
                <Button size="xs" colorPalette="blue">
                  Add column
                </Button>
              </Box>
            </Flex>
            <Flex>
              <TailorDBTable
                data={currentType?.schema.fields || {}}
                handlers={{
                  onClickSourceType: (typeName) => {
                    setCurrentType(
                      getTailorDBTypeByName(props.tailorDBTypes, typeName)
                    );
                  },
                }}
              />
            </Flex>
          </Stack>
        </Flex>
      </HStack>
    </Stack>
  );
};
