// app/(auth)/setup/team/page.tsx (Step 4: Team Setup)
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, UserPlus, Mail, Sparkles, X } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
}

interface NewMember {
  name: string;
  email: string;
  role: "admin" | "agent";
}

export default function SetupTeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "John Doe", email: "john@company.com", role: "admin" },
  ]);
  const [newMember, setNewMember] = useState<NewMember>({ 
    name: "", 
    email: "", 
    role: "agent" 
  });

  const addMember = () => {
    if (newMember.name && newMember.email) {
      setMembers([
        ...members,
        {
          id: Date.now().toString(),
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
        },
      ]);
      setNewMember({ name: "", email: "", role: "agent" });
    }
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleContinue = () => {
    router.push("/setup/integrations");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 mb-3">
          <Sparkles className="w-3 h-3" />
          Step 4 of 6
        </div>
        <h1 className="text-2xl font-bold">Set up your team</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Invite team members to collaborate on support
        </p>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {member.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                member.role === "admin"
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}>
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Remove member"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="Full name"
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="Email address"
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <div className="flex gap-2">
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ 
                  ...newMember, 
                  role: e.target.value as "admin" | "agent" 
                })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                aria-label="Select role"
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={addMember}
                disabled={!newMember.name || !newMember.email}
                className="px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all font-medium text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Optional: Add note about email invitations */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Team members will receive an email invitation to join your workspace
        </p>
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2"
      >
        Continue to Integrations
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}