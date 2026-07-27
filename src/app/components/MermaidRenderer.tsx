import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidRendererProps {
  chart: string;
}

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#6366f1",
    primaryTextColor: "#fff",
    primaryBorderColor: "#4f46e5",
    lineColor: "#94a3b8",
    secondaryColor: "#8b5cf6",
    tertiaryColor: "#ec4899",
  },
});

export function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderDiagram = async () => {
      try {
        console.log("🎨 Rendering Mermaid diagram:", chart.substring(0, 50) + "...");
        
        // Clear previous content
        containerRef.current!.innerHTML = "";
        
        // Render the mermaid diagram
        const { svg } = await mermaid.render(idRef.current, chart);
        containerRef.current!.innerHTML = svg;
        
        console.log("✅ Mermaid diagram rendered successfully!");
      } catch (error) {
        console.error("❌ Mermaid rendering error:", error);
        containerRef.current!.innerHTML = `
          <div class="text-sm text-destructive p-2 rounded border border-destructive/50">
            Failed to render diagram. Please check the syntax.
          </div>
        `;
      }
    };

    renderDiagram();
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="mermaid-container overflow-auto rounded-lg bg-muted/50 p-4 my-2"
    />
  );
}
