import { TopBar } from "@/components/layout/TopBar";
import { ArchitectureDiagram } from "@/components/architecture/ArchitectureDiagram";

export default function ArchitecturePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar
        title="Streaming System Architecture"
        subtitle="Confluent Cloud Kafka, Apache Flink, Connectors, and AI/ML topology map"
      />

      <div className="p-8 space-y-6 max-w-7xl">
        <ArchitectureDiagram />
      </div>
    </div>
  );
}
