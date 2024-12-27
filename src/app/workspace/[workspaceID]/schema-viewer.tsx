import {
  TailorDBType,
  TailorDBTypesResult,
  WorkspaceResult,
} from "@/app/types";
import { DataListRoot } from "@/components/ui/data-list";
import { Button, Flex, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import Dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeProps,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { memo, useEffect } from "react";

const buildNodes = (props: { types: TailorDBTypesResult["tailordbTypes"] }) => {
  const nodes = props.types.map((type) => {
    return {
      id: type.name,
      type: "table",
      data: {
        type: type,
      },
      position: {
        x: 0,
        y: 0,
      },
      width: 280,
      height: 240,
    };
  });

  const edges = props.types.flatMap((type) => {
    const fields = type.schema.fields;
    return Object.keys(fields).flatMap((key) => {
      const field = fields[key];

      if (!field.foreignKeyType) {
        return [];
      }

      return {
        id: crypto.randomUUID(),
        source: type.name,
        target: field.foreignKeyType,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
    });
  });

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TD" });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => {
    g.setNode(node.id, {
      ...node,
      width: node.width,
      height: node.height,
    });
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = g.node(node.id);
    const position = {
      x: layoutedNode.x - (node.width ?? 0) / 2,
      y: layoutedNode.y - (node.height ?? 0) / 3,
    };

    return {
      ...node,
      position,
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

const TableNode = memo(
  (props: NodeProps & { data: { type: TailorDBType } }) => {
    const { data } = props;
    const fields = Object.keys(data.type.schema.fields);
    const topFourFields = fields.slice(0, 6);
    const restFieldsLength = fields.length - topFourFields.length;

    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={props.isConnectable}
        />
        <Stack
          border="solid 1px #ededed"
          backgroundColor="bg"
          boxShadow="md"
          height="100%"
          gap={0}
          py={0}
        >
          <Heading
            backgroundColor="#ededed"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            fontWeight="normal"
            fontSize="md"
            textAlign={"center"}
            py={1}
            px={2}
          >
            {data.type.name}
          </Heading>
          <Stack py={1} px={2} gap={1}>
            {topFourFields.map((field, index) => {
              const type = data.type.schema.fields[field].type;
              return (
                <Flex key={index} justifyContent={"space-between"}>
                  <Text>{field}</Text>
                  <Text>{type}</Text>
                </Flex>
              );
            })}
          </Stack>
          {restFieldsLength > 0 && (
            <Flex
              pt={1}
              px={2}
              justifyContent={"center"}
              backgroundColor="#ededed"
              color="gray.500"
            >
              <Text>{restFieldsLength} more fields</Text>
            </Flex>
          )}
        </Stack>
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={props.isConnectable}
        />
      </>
    );
  }
);

type SchemaViewerProps = {
  workspace: WorkspaceResult["workspace"];
  types: TailorDBTypesResult["tailordbTypes"];
  onRefresh: () => void;
  onTableClicked: (id: string) => void;
  onInitialized?: () => void;
};

export const SchemaViewer = (props: SchemaViewerProps) => {
  const { nodes: initialNodes, edges: initialEdges } = buildNodes(props);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeColor = (node: { type?: string }) => {
    switch (node.type) {
      case "input":
        return "#6ede87";
      case "output":
        return "#6865A5";
      default:
        return "#ff0072";
    }
  };

  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = buildNodes(props);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [props.types]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={{
        table: TableNode,
      }}
      onInit={() => props.onInitialized?.()}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(e, node) => {
        props.onTableClicked(node.id);

        setNodes((nodes) => {
          return nodes.map((n) => {
            return {
              ...n,
              style: {
                border: n.id === node.id ? "2px solid #ff0072" : "none",
              },
            };
          });
        });
      }}
      fitView
    >
      <Panel>
        <Button
          as={Link}
          size="xs"
          // @ts-ignore
          href={`/workspace/${props.workspace.id}/newTable`}
        >
          New table
        </Button>
        <Button
          marginLeft={2}
          size="xs"
          variant={"outline"}
          onClick={props.onRefresh}
        >
          Refresh
        </Button>
      </Panel>
      <Background />
      <MiniMap pannable zoomable nodeColor={nodeColor} />
      <Controls />
    </ReactFlow>
  );
};
