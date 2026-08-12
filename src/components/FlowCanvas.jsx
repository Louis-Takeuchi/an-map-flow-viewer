import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import QuestionNode from './QuestionNode';
import OutcomeNode from './OutcomeNode';

const nodeTypes = {
  question: QuestionNode,
  outcome: OutcomeNode,
};

export default function FlowCanvas({
  nodes, edges, onNodeClick, onPaneClick, onNodeMouseEnter, onNodeMouseLeave,
}) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ddd" />
      <Controls />
      <MiniMap
        nodeColor={(n) => {
          if (n.type === 'outcome') return '#f59e0b';
          return '#3b82f6';
        }}
        maskColor="rgba(0,0,0,0.08)"
      />
    </ReactFlow>
  );
}
