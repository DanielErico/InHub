import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { Loader2, Download, Search, Table as TableIcon } from "lucide-react";

interface SurveyResponse {
  id: string;
  user_id: string;
  role: string;
  source: string;
  goal: string;
  features: string;
  created_at: string;
  users: {
    full_name: string;
    email: string;
  };
}

export function SurveysPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("onboarding_responses")
        .select(`
          *,
          users ( full_name, email )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResponses((data as any) || []);
    } catch (err) {
      console.error("Failed to load survey responses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (responses.length === 0) return;

    // Build CSV Headers
    const headers = ["Date", "Name", "Email", "Role", "Source", "Primary Goal", "Excited Features"];
    
    // Build CSV Rows
    const rows = responses.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      `"${r.users?.full_name || 'N/A'}"`,
      `"${r.users?.email || 'N/A'}"`,
      `"${r.role}"`,
      `"${r.source.replace(/"/g, '""')}"`,
      `"${r.goal.replace(/"/g, '""')}"`,
      `"${r.features.replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inhub_onboarding_surveys_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResponses = responses.filter(r => 
    r.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TableIcon className="w-6 h-6 text-blue-600" />
            Onboarding Surveys
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            View and export survey responses collected during user registration.
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={responses.length === 0}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">How did you hear?</th>
                <th className="px-6 py-4 font-semibold">Primary Goal</th>
                <th className="px-6 py-4 font-semibold">Excited Features</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-2">Loading responses...</p>
                  </td>
                </tr>
              ) : filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TableIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No survey responses found.</p>
                  </td>
                </tr>
              ) : (
                filteredResponses.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.users?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{r.users?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        r.role === 'tutor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {r.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 max-w-[150px] truncate" title={r.source}>{r.source}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 max-w-[200px] truncate" title={r.goal}>{r.goal}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 max-w-[200px] truncate" title={r.features}>{r.features}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
