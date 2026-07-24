"use client";

import { useState, ReactNode } from "react";

interface DashboardTabsProps {
  monitoringContent: ReactNode;
  progresContent: ReactNode;
}

export default function DashboardTabs({ monitoringContent, progresContent }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"monitoring" | "progres">("monitoring");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("monitoring")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "monitoring"
                  ? "border-institusi text-institusi"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Dashboard Monitoring
          </button>
          <button
            onClick={() => setActiveTab("progres")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "progres"
                  ? "border-institusi text-institusi"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Progres Pengisian
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "monitoring" ? monitoringContent : progresContent}
      </div>
    </div>
  );
}
