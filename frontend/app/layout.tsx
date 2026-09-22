import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { DemoToolbar } from "@/components/layout/DemoToolbar";

export const metadata = {
  title: "PulseRecover AI | Real-Time Experience Rescue & Revenue Protection",
  description: "Enterprise customer experience rescue platform powered by Confluent Cloud, Apache Flink, and real-time AI/ML stream analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 font-sans">
        <DemoToolbar />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
