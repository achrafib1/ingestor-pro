import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IngestedFile, IngestionHistory } from "@/lib/types";
import { Share2, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GraphProps {
  currentFiles: IngestedFile[];
  history: IngestionHistory[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  size: number;
  type: string;
}

export function Graph({ currentFiles, history }: GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string>("current");

  const files = selectedHistoryId === "current"
    ? currentFiles
    : history.find(h => h.id === selectedHistoryId)?.files || [];

  useEffect(() => {
    if (!svgRef.current || files.length === 0) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes: Node[] = files.map(f => ({
      id: f.path,
      name: f.name,
      size: f.size,
      type: f.name.split('.').pop() || 'unknown'
    }));

    // Create links based on shared directory or similar extensions
    const links: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const path1 = nodes[i].id.split('/');
        const path2 = nodes[j].id.split('/');
        if (path1[0] === path2[0] && path1.length > 1) {
          links.push({ source: nodes[i].id, target: nodes[j].id, value: 1 });
        } else if (nodes[i].type === nodes[j].type) {
          links.push({ source: nodes[i].id, target: nodes[j].id, value: 0.5 });
        }
      }
    }

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => Math.sqrt(d.size) / 10 + 10));

    const g = svg.append("g");

    const link = g.append("g")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value));

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => Math.sqrt(d.size) / 10 + 5)
      .attr("fill", (d: any) => colorScale(d.type))
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1.5)
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("title")
      .text(d => `${d.name} (${d.type})\nSize: ${d.size} bytes`);

    const labels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.name)
      .attr("font-size", "10px")
      .attr("fill", "rgba(255, 255, 255, 0.6)")
      .attr("dx", 12)
      .attr("dy", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
      zoomRef.current = null;
    };
  }, [files]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy as any, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy as any, 0.8);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.transform as any, d3.zoomIdentity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-black/20">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="text-orange-500" size={20} />
              Knowledge Graph
            </CardTitle>
            <CardDescription>Visualizing file relationships and size distribution.</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedHistoryId}
              onChange={(e) => setSelectedHistoryId(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="current">Current Workspace ({currentFiles.length} files)</option>
              {history.map(item => (
                <option key={item.id} value={item.id}>
                  {item.source} ({item.files.length} files) - {new Date(item.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                <ZoomIn size={14} />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                <ZoomOut size={14} />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset}>
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-[#050505] relative">
          {files.length === 0 ? (
            <div className="h-[600px] flex items-center justify-center text-white/20 italic">
              Ingest files to see the knowledge graph
            </div>
          ) : (
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox="0 0 800 600"
              className="cursor-move"
            />
          )}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-4 text-[10px] text-white/40 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Node Size = File Size</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Color = File Type</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-[1px] bg-white/20" />
              <span>Link = Shared Directory</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
