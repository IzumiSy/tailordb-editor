import { TailorDBTypesResult } from "@/app/types";
import { Box, Button } from "@chakra-ui/react";
import Dagre from "@dagrejs/dagre";
import {
  Background,
  BuiltInNode,
  Controls,
  MarkerType,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const buildNodes = (props: { types: TailorDBTypesResult["tailordbTypes"] }) => {
  const nodes: Array<BuiltInNode> = props.types.map((type, index) => {
    return {
      id: type.name,
      data: {
        label: type.name,
      },
      position: {
        x: 0,
        y: 0,
      },
      width: 200,
      height: 40,
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
    return {
      ...node,
      position: {
        x: layoutedNode.x - (node.width ?? 0) / 2,
        y: layoutedNode.y - (node.height ?? 0) / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

type SchemaViewerProps = {
  types: TailorDBTypesResult["tailordbTypes"];
  onTableClicked: (id: string) => void;
  onInitialized?: () => void;
};

export const SchemaViewer = (props: SchemaViewerProps) => {
  const { nodes: initialNodes, edges: initialEdges } = buildNodes(props);
  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, __, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onInit={() => props.onInitialized?.()}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(e, node) => {
        props.onTableClicked(node.id);
      }}
      fitView
    >
      <Panel>
        <Button size="xs">New table</Button>
      </Panel>
      <Background />
      <Controls />
    </ReactFlow>
  );
};
