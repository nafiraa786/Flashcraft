"use client";

import Link from "next/link";
import { Plus, MoreHorizontal, Trash2, Share2, Clock, Eye } from "lucide-react";
import { useState } from "react";

const PROJECTS = [
  {
    id: "1",
    title: "Landing Page v2",
    thumbnail: "🎨",
    lastModified: "2 hours ago",
    views: 234,
    category: "Landing Pages",
  },
  {
    id: "2",
    title: "Admin Dashboard",
    thumbnail: "📊",
    lastModified: "Yesterday",
    views: 567,
    category: "Dashboards",
  },
  {
    id: "3",
    title: "E-Commerce Store",
    thumbnail: "🛍️",
    lastModified: "3 days ago",
    views: 1203,
    category: "E-Commerce",
  },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState(PROJECTS);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-700 sticky top-0 z-40 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Projects</h1>
            <p className="text-slate-400">Manage and organize your FlashCraft projects</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
          >
            <Plus size={18} />
            New Project
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold">{projects.length}</div>
            <div className="text-sm text-slate-400">Total Projects</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm text-slate-400">Total Views</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-slate-400">Shared Projects</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="text-2xl font-bold">3.2 GB</div>
            <div className="text-sm text-slate-400">Storage Used</div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/studio/${project.id}`}
              className="group bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition"
            >
              {/* Thumbnail */}
              <div className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl relative overflow-hidden">
                {project.thumbnail}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 group-hover:text-blue-400 transition line-clamp-2">
                  {project.title}
                </h3>

                <div className="space-y-3">
                  {/* Category */}
                  <div className="text-xs">
                    <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-300 rounded">
                      {project.category}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {project.lastModified}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        {project.views}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div
                className="hidden group-hover:flex items-center justify-between px-6 py-3 border-t border-slate-700 bg-slate-800/50 gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <button className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200">
                  <Share2 size={14} />
                </button>
                <button className="p-2 hover:bg-red-900/30 rounded transition text-red-400 hover:text-red-300">
                  <Trash2 size={14} />
                </button>
                <button className="p-2 hover:bg-slate-700 rounded transition text-slate-400 hover:text-slate-200">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </Link>
          ))}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-6">Create your first project to get started</p>
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
              >
                Create Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
