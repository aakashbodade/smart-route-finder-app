import React, { useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const NetworkVisualization = ({
                                  hubs,
                                  highlightedPath = [],
                                  onNodeClick,
                              }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Generate nodes from hubs
    const generateNodes = useCallback((hubList) => {
        return hubList.map((hub, index) => {
            const isHighlighted = highlightedPath.includes(hub.id);
            const isPathStart = highlightedPath[0] === hub.id;
            const isPathEnd = highlightedPath[highlightedPath.length - 1] === hub.id;

            // Auto-layout in a circle if no position is set
            const angle = (index / hubList.length) * 2 * Math.PI;
            const radius = Math.max(200, hubList.length * 30);
            const defaultX = Math.cos(angle) * radius + 400;
            const defaultY = Math.sin(angle) * radius + 300;

            return {
                id: hub.id,
                position: hub.position || { x: defaultX, y: defaultY },
                data: {
                    label: hub.name,
                    hubId: hub.id,
                    connections: hub.connectedHubs.length
                },
                type: 'custom',
                className: `hub-node ${isHighlighted ? 'highlighted' : ''} ${isPathStart ? 'path-start' : ''} ${isPathEnd ? 'path-end' : ''}`,
            };
        });
    }, [highlightedPath]);

    const generateEdges = useCallback((hubList) => {
        const edgeSet = new Set();
        const edgeList = [];

        hubList.forEach(hub => {
            hub.connectedHubs.forEach(connectedHubId => {
                const edgeId = [hub.id, connectedHubId].sort().join('-');
                if (!edgeSet.has(edgeId)) {
                    edgeSet.add(edgeId);

                    const isHighlighted = highlightedPath.includes(hub.id) &&
                        highlightedPath.includes(connectedHubId) &&
                        Math.abs(highlightedPath.indexOf(hub.id) - highlightedPath.indexOf(connectedHubId)) === 1;

                    edgeList.push({
                        id: edgeId,
                        source: hub.id,
                        target: connectedHubId,
                        type: 'smoothstep',
                        className: isHighlighted ? 'highlighted-edge' : '',
                        style: {
                            stroke: isHighlighted ? 'hsl(var(--path-highlight))' : 'hsl(var(--hub-secondary))',
                            strokeWidth: isHighlighted ? 4 : 2,
                        },
                        animated: isHighlighted,
                    });
                }
            });
        });

        return edgeList;
    }, [highlightedPath]);

    useEffect(() => {
        setNodes(generateNodes(hubs));
        setEdges(generateEdges(hubs));
    }, [hubs, generateNodes, generateEdges]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClicked = useCallback((event, node) => {
        if (onNodeClick) {
            onNodeClick(node.data.hubId);
        }
    }, [onNodeClick]);

    const customNodeTypes = useMemo(() => ({
        custom: ({ data }) => (
            <div className="hub-node-content">
                <div className="hub-node-inner">
                    <div className="hub-name">{data.label}</div>
                    <div className="hub-connections">{data.connections} connections</div>
                </div>
            </div>
        ),
    }), []);

    return (
        <div className="network-visualization">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClicked}
                nodeTypes={customNodeTypes}
                fitView
                className="react-flow-network"
            >
                <Controls className="react-flow-controls" />
                <MiniMap
                    className="react-flow-minimap"
                    nodeColor="hsl(var(--hub-primary))"
                    maskColor="hsl(var(--muted) / 0.1)"
                />
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="hsl(var(--muted-foreground) / 0.3)"
                />
            </ReactFlow>

            <style>{`
        .network-visualization {
          width: 100%;
          height: 100%;
          background: hsl(var(--network-bg));
        }
        
        .hub-node-content {
          background: white;
          border: 2px solid hsl(var(--hub-primary));
          border-radius: 12px;
          padding: 12px 16px;
          min-width: 120px;
          text-align: center;
          box-shadow: var(--shadow-hub);
          transition: all 0.2s ease;
        }
        
        .hub-node-content:hover {
          border-color: hsl(var(--hub-secondary));
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -8px hsl(var(--hub-primary) / 0.4);
        }
        
        .hub-node.highlighted .hub-node-content {
          background: hsl(var(--hub-accent) / 0.1);
          border-color: hsl(var(--hub-accent));
          box-shadow: 0 0 20px hsl(var(--hub-accent) / 0.5);
        }
        
        .hub-node.path-start .hub-node-content {
          background: hsl(var(--hub-secondary) / 0.1);
          border-color: hsl(var(--hub-secondary));
        }
        
        .hub-node.path-end .hub-node-content {
          background: hsl(var(--hub-accent) / 0.1);
          border-color: hsl(var(--hub-accent));
        }
        
        .hub-name {
          font-weight: 600;
          color: hsl(var(--hub-primary));
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .hub-connections {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
        }
        
        .react-flow-network {
          background: hsl(var(--network-bg));
        }
        
        .react-flow-controls {
          button {
            background: white;
            border-color: hsl(var(--border));
            color: hsl(var(--hub-primary));
          }
          
          button:hover {
            background: hsl(var(--hub-primary));
            color: white;
          }
        }
        
        .react-flow-minimap {
          background: white;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
        }
      `}</style>
        </div>
    );
};

export default NetworkVisualization;
