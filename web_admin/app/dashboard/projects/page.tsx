"use client";

import { useState } from "react";
import { DashboardPage, DashboardHeader, DashboardControls } from "@/components/dashboard/DashboardPage";
import {
    tableBase,
    tableHead,
    tableHeadCell,
    tableRow,
    tableCell,
    tableCellMuted
} from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowUpRightIcon
} from "@heroicons/react/24/outline";

const projects = [
    { id: "J1", name: "Plumbing Fix", sku: "PLB-001", category: "Maintenance", price: "$99.00", stock: "Assigned", status: "Active" },
    { id: "J2", name: "Electrical Wiring", sku: "ELE-002", category: "Installation", price: "$149.00", stock: "Pending", status: "Active" },
    { id: "J3", name: "Roof Repair", sku: "ROO-003", category: "Repair", price: "$490.00", stock: "Unassigned", status: "Draft" },
    { id: "J4", name: "HVAC Inspection", sku: "HVC-004", category: "Maintenance", price: "$199.00", stock: "Assigned", status: "Active" },
    { id: "J5", name: "Painting Job", sku: "PNT-005", category: "Renovation", price: "$579.00", stock: "Assigned", status: "Active" },
];

export default function ProjectsPage() {
    const [search, setSearch] = useState("");

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardPage>
            <DashboardHeader
                title="Projects"
                subtitle="View and manage all service projects."
            >
                <Button className="rounded-full px-6 shrink-0">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Project
                </Button>
            </DashboardHeader>

            <DashboardControls>
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search projects or reference..."
                        className="pl-9 rounded-xl border-border/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </DashboardControls>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>Project Name</th>
                            <th className={tableHeadCell + " px-4 hidden sm:table-cell"}>Reference</th>
                            <th className={tableHeadCell + " px-4"}>Category</th>
                            <th className={tableHeadCell + " px-4 text-right sm:text-left"}>Value</th>
                            <th className={tableHeadCell + " px-4 hidden sm:table-cell"}>Status</th>
                            <th className={tableHeadCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map((project) => (
                            <tr key={project.id} className={tableRow + " group cursor-pointer"}>
                                <td className={tableCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-foreground/50 border border-border/50 shrink-0">
                                            {project.id}
                                        </div>
                                        <span className="font-semibold text-sm truncate">{project.name}</span>
                                    </div>
                                </td>
                                <td className={tableCellMuted + " px-4 hidden sm:table-cell"}>
                                    {project.sku}
                                </td>
                                <td className={tableCell + " px-4"}>
                                    <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-medium border-border/50">
                                        {project.category}
                                    </Badge>
                                </td>
                                <td className={tableCell + " px-4 text-right sm:text-left"}>
                                    <span className="font-bold text-sm">{project.price}</span>
                                </td>
                                <td className={tableCell + " px-4 hidden sm:table-cell"}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${project.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                        <span className="text-xs font-medium text-muted-foreground">{project.status}</span>
                                    </div>
                                </td>
                                <td className={tableCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right md:opacity-0 md:group-hover:opacity-100 transition-opacity"}>
                                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-muted-foreground">
                                        <ArrowUpRightIcon className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardPage>
    );
}
