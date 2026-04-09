import toposort from "toposort";
import { Connection, Node } from "@/generated/prisma/client";

export function topologicalSort(
  nodes: Node[],
  connections: Connection[]
): Node[] {
  // If no connections, return nodes as-is (they're all independent)
  if (connections.length === 0) {
    return nodes;
  }

  // Create edges array for toposort: [from, to]
  const edges: Array<[string, string]> = connections.map((connection) => [
    connection.sourceNodeId,
    connection.targetNodeId,
  ]);

  const connectedNodeIds = new Set<string>();

  for (const connection of connections) {
    connectedNodeIds.add(connection.sourceNodeId);
    connectedNodeIds.add(connection.targetNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodeIds;

  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (e) {
    if (e instanceof Error && e.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw e;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  return sortedNodeIds.map((id) => nodeMap.get(id) as Node).filter(Boolean);
}
