"use client";
import { TailorDBTypesResult, WorkspaceResult } from "@/app/types";
import { TailorDBTable } from "@/components/table";
import { Box, Button, Flex, Heading, HStack, Stack } from "@chakra-ui/react";
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
          <Heading fontWeight={"bold"}>{workspace.name}</Heading>
          <TypeSelector
            currentType={currentType}
            onChange={setCurrentType}
            types={props.tailorDBTypes}
          />
        </HStack>
        <HStack>
          <Button size="xs" colorPalette="blue">
            Add column
          </Button>
        </HStack>
      </Flex>
      <Box height="calc(50vh - 48px)">
        <SchemaViewer
          types={props.tailorDBTypes}
          onTableClicked={(typeName) => {
            setCurrentType(
              getTailorDBTypeByName(props.tailorDBTypes, typeName)
            );
          }}
        />
      </Box>
      <Box maxHeight="calc(50vh - 48px)">
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
      </Box>
    </Stack>
  );
};
