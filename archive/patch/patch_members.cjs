const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Add imports
code = code.replace(
  /MessageCircle, Plus, ChevronRight, UserPlus\n} from 'lucide-react';/,
  `MessageCircle, Plus, ChevronRight, UserPlus,\n  ShieldAlert, Ban, CheckCircle2, MoreHorizontal\n} from 'lucide-react';`
);

// Add members state
code = code.replace(
  /const \[channels, setChannels\] = useState<any\[\]>\(\[\]\);/,
  `const [channels, setChannels] = useState<any[]>([]);\n  const [membersList, setMembersList] = useState([\n    { id: '1', name: 'UCUP', email: 'ucup@nsn969.com', role: 'admin', status: 'active', joinDate: '2026-01-15' },\n    { id: '2', name: 'Bambang', email: 'bambang@nsn969.com', role: 'streamer', status: 'active', joinDate: '2026-02-20' },\n    { id: '3', name: 'Siti', email: 'siti@nsn969.com', role: 'member', status: 'inactive', joinDate: '2026-03-05' },\n    { id: '4', name: 'Kucrut', email: 'kucrut@nsn969.com', role: 'streamer', status: 'active', joinDate: '2026-04-10' },\n    { id: '5', name: 'Joko', email: 'joko@nsn969.com', role: 'member', status: 'active', joinDate: '2026-05-01' },\n  ]);\n\n  const handlePromote = (id: string) => {\n    setMembersList(prev => prev.map(m => m.id === id ? { ...m, role: 'admin' } : m));\n  };\n\n  const handleRestrict = (id: string) => {\n    setMembersList(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));\n  };\n\n  const handleDeleteMember = (id: string) => {\n    if (confirm('Are you sure you want to remove this member?')) {\n      setMembersList(prev => prev.filter(m => m.id !== id));\n    }\n  };`
);

const newRenderMembersTab = `  const renderMembersTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className={\`text-2xl font-bold \${textPrimary}\`}>Member NSN969</h2>
      <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-4\`}>
        <div>
          <h3 className={\`text-lg font-semibold \${textPrimary}\`}>Manage NSN969 Streamers</h3>
          <p className={\`text-sm \${textSecondary} mt-1\`}>Add, remove, or modify streamer accounts and ranks.</p>
        </div>
        <button className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Streamer
        </button>
      </div>
      
      <div className={\`rounded-2xl border \${borderCard} \${bgCard} overflow-hidden\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/50\`}>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Member</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Role</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Status</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Joined</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {membersList.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className={\`font-medium \${textPrimary}\`}>{member.name}</div>
                        <div className={\`text-xs \${textSecondary}\`}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2.5 py-1 rounded-full text-xs font-medium border \${
                      member.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : member.role === 'streamer'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                    }\`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className={\`w-2 h-2 rounded-full \${member.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}\`}></div>
                      <span className={\`text-sm \${member.status === 'active' ? 'text-emerald-400' : 'text-red-400'}\`}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className={\`px-6 py-4 whitespace-nowrap text-sm \${textSecondary}\`}>
                    {member.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.role !== 'admin' && (
                        <button 
                          onClick={() => handlePromote(member.id)}
                          title="Promote to Admin"
                          className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleRestrict(member.id)}
                        title={member.status === 'active' ? 'Restrict User' : 'Activate User'}
                        className={\`p-1.5 rounded-lg transition-colors \${
                          member.status === 'active' 
                            ? 'text-red-400 hover:bg-red-500/10' 
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }\`}
                      >
                        {member.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        title="Delete User"
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {membersList.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No members found.
            </div>
          )}
        </div>
      </div>
    </div>
  );`;

code = code.replace(/const renderMembersTab = \(\) => \([\s\S]*?This section allows you to edit member roles, profiles, and live stream settings\.[\s\S]*?<\/div>\n    <\/div>\n  \);/, newRenderMembersTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
