"use client";

import Link from "next/link";
import { ArrowLeft, Search, Heart, Eye, Code } from "lucide-react";
import { useState } from "react";

const TEMPLATES = [
  {
    id: "1",
    title: "Landing Page",
    description: "Modern SaaS landing page with animations",
    image: "🎨",
    category: "Landing Pages",
    views: 2341,
    likes: 523,
  },
  {
    id: "2",
    title: "Dashboard",
    description: "Admin dashboard with charts and analytics",
    image: "📊",
    category: "Dashboards",
    views: 1823,
    likes: 412,
  },
  {
    id: "3",
    title: "E-Commerce Store",
    description: "Full-featured product catalog and cart",
    image: "🛍️",
    category: "E-Commerce",
    views: 3421,
    likes: 892,
  },
  {
    id: "4",
    title: "Blog Platform",
    description: "Blog with categories and search",
    image: "📝",
    category: "Blogs",
    views: 1204,
    likes: 234,
  },
  {
    id: "5",
    title: "Portfolio",
    description: "Creative portfolio with case studies",
    image: "💼",
    category: "Portfolio",
    views: 2102,
    likes: 534,
  },
  {
    id: "6",
    title: "Chat App",
    description: "Real-time messaging interface",
    image: "💬",
    category: "Communication",
    views: 1834,
    likes: 423,
  },
];

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));
  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch = template.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-700 sticky top-0 z-40 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-2">Template Gallery</h1>
            <p className="text-slate-400">Browse and remix curated designs built by the FlashCraft community</p>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Link
              key={template.id}
              href={`/studio/new?template=${template.id}`}
              className="group bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition"
            >
              {/* Image */}
              <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-6xl">
                {template.image}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">
                  {template.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      {template.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={14} />
                      {template.likes}
                    </div>
                  </div>
                  <Code size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
