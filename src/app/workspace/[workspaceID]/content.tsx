"use client";
import {
  ApplicationResult,
  TailorDBTypesResult,
  WorkspaceResult,
} from "@/app/types";
import { ReadonlyTableViewer } from "@/components/readonly-table";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { SchemaViewer } from "./schema-viewer";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { debounce } from "es-toolkit";
import Link from "next/link";

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
  namespaceName: string;
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
};

export const ContentContainer = (props: ContentContainerProps) => {
  const [tables, setTables] = useState(props.tailorDBTypes);

  const refetchTables = () => {
    // TODO: "any" should be avoided
    fetch(`/workspace/${props.workspace.id}/tables`).then(async (tables) => {
      const tablesJson = await tables.json();
      setTables(tablesJson.tables);
    });
  };

  return (
    <ReactFlowProvider>
      <Content
        containerProps={{
          ...props,
          tailorDBTypes: tables,
        }}
        onRefresh={refetchTables}
      />
    </ReactFlowProvider>
  );
};

type ContentProps = {
  containerProps: ContentContainerProps;
  onRefresh: () => void;
};

const Content = (props: ContentProps) => {
  const { workspace, tailorDBTypes } = props.containerProps;
  const initialTailorDBType = tailorDBTypes[0];
  const [currentType, setCurrentType] = useState<TailorDBType | null>(
    getTailorDBTypeByName(tailorDBTypes, initialTailorDBType.name)
  );
  const {
    schemaViewerPaneWidth,
    setSchemaViewerPaneWidth,
    isSchemaViewerInitialized,
    setSchemaViewerInitialized,
  } = useSchemaViewerResizer();

  return (
    <Allotment
      onChange={([pane1Width]) => setSchemaViewerPaneWidth(pane1Width)}
    >
      <Allotment.Pane preferredSize={"50%"}>
        <Box width={schemaViewerPaneWidth} height={"calc(100vh - 48px)"}>
          <SchemaViewer
            workspace={workspace}
            types={tailorDBTypes}
            onRefresh={props.onRefresh}
            onInitialized={() => setSchemaViewerInitialized(true)}
            onTableClicked={(typeName) => {
              setCurrentType(getTailorDBTypeByName(tailorDBTypes, typeName));
            }}
          />
        </Box>
      </Allotment.Pane>
      <Allotment.Pane>
        {isSchemaViewerInitialized && (
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
                <Button
                  as={Link}
                  // @ts-ignore
                  href={`/workspace/${workspace.id}/tables/${currentType?.name}`}
                  size="xs"
                >
                  Edit table
                </Button>
              </Box>
            </Flex>
            <Flex>
              <ReadonlyTableViewer
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
        )}
      </Allotment.Pane>
    </Allotment>
  );
};

/**
 * A hook to prevent React Flow warning (https://reactflow.dev/error#004)
 *
 * Background of this hook is that ReactFlow requires static width and height for the container element
 * However, we are using Allotment that has dynamic width and height before its children are rendered,
 * so this hook provides a set of functions that helps us update the width of the container element dynamically.
 */
const useSchemaViewerResizer = () => {
  const reactFlow = useReactFlow();

  // "0px" results in React Flow warning (https://reactflow.dev/error#004)
  // so for the initial time, we just set it to static "1px"
  const [schemaViewerPaneWidth, setSchemaViewerPaneWidth] = useState("1px");

  // `TailorDBTable` will be rendered at first with allotment, but it causes flash in rendering the page
  // so we need to wait for the schema viewer to be initialized
  const [isSchemaViewerInitialized, setSchemaViewerInitialized] =
    useState(false);

  // Debounce the resize event to prevent unnecessary re-renders
  // 25ms is the minimum time that looks working nice for the debounce, but ok to increase/decrease it
  const debouncedResize = debounce((value: number | undefined) => {
    if (value) {
      setSchemaViewerPaneWidth(Math.round(value) + "px");
    }
  }, 25);

  // fitView should be called after the schemaViewerPaneWidth has been updated
  // it does not work if called simultaneously with setSchemaViewerPaneWidth
  useEffect(() => {
    reactFlow.fitView();
  }, [schemaViewerPaneWidth]);

  return {
    schemaViewerPaneWidth,
    setSchemaViewerPaneWidth: debouncedResize,
    isSchemaViewerInitialized,
    setSchemaViewerInitialized,
  };
};
