"use client";

import Link from "next/link";
import { ArrowLeft, User, Bell, Lock, Palette, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-700 sticky top-0 z-40 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                      activeTab === tab.id
                        ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-8 space-y-6">
              {activeTab === "account" && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="john@example.com"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition font-medium mt-6">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "notifications" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Email notifications</div>
                        <div className="text-sm text-slate-400">Get updates about your projects</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Collaboration alerts</div>
                        <div className="text-sm text-slate-400">When someone shares a project with you</div>
                      </div>
                    </label>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="font-medium mb-2">Two-Factor Authentication</div>
                      <p className="text-sm text-slate-400 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium text-sm">
                        Enable 2FA
                      </button>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="font-medium mb-2">Change Password</div>
                      <p className="text-sm text-slate-400 mb-4">Update your password regularly</p>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium text-sm">
                        Change Password
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "appearance" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                          <input type="radio" name="theme" defaultChecked className="w-4 h-4" />
                          Dark (Default)
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                          <input type="radio" name="theme" className="w-4 h-4" />
                          Light
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "help" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Help & Support</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                      <div className="font-medium mb-1">Documentation</div>
                      <p className="text-sm text-slate-400">Read our comprehensive guides and tutorials</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                      <div className="font-medium mb-1">Contact Support</div>
                      <p className="text-sm text-slate-400">Get help from our support team</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                      <div className="font-medium mb-1">Community</div>
                      <p className="text-sm text-slate-400">Join our community forums and Discord</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
