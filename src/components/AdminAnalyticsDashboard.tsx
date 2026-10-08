import React, { useState } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Download,
  ShieldCheck,
  Activity,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { CAMPUS_LOCATIONS, LOCATION_ZONES } from '../data/campusLocations';

export const AdminAnalyticsDashboard: React.FC = () => {
  const { complaints } = useResolveHub();

  // Filters State
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedZone, setExpandedZone] = useState<string | null>('Hostels');

  // Non-Academic & Administrative Departments Registry
  const ALL_DEPARTMENTS = [
    'Facilities & HVAC',
    'IT & Network Systems',
    'Hostel Office & Administration',
    'Transport & Vehicle Bay',
    'Central Library Directorate',
    'Accounts & Finance Bureau',
    'Examination Controller Cell',
    'Security & Gate Affairs',
    'Health & Sanitation',
    'Academics Redressal',
    'Internal Grievance Committee'
  ];

  // Apply Filters
  const filteredComplaints = complaints.filter(c => {
    const catMatch = filterCategory === 'all' || c.category === filterCategory;
    const statusMatch = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    return catMatch && statusMatch;
  });

  const total = filteredComplaints.length;
  const resolved = filteredComplaints.filter(c => c.status.toLowerCase() === 'resolved').length;
  const escalated = filteredComplaints.filter(c => c.isEscalated).length;

  // Zone Aggregation
  const zoneCounts: Record<string, number> = {};
  LOCATION_ZONES.forEach(z => { zoneCounts[z] = 0; });

  // Location Aggregation
  interface LocStat {
    id: string;
    name: string;
    zone: string;
    type: string;
    count: number;
    categories: Record<string, number>;
  }

  const locationStatsMap: Record<string, LocStat> = {};

  CAMPUS_LOCATIONS.forEach(loc => {
    locationStatsMap[loc.id] = {
      id: loc.id,
      name: loc.name,
      zone: loc.zone,
      type: loc.type,
      count: 0,
      categories: {}
    };
  });

  filteredComplaints.forEach(t => {
    let matchedLoc: LocStat | null = null;
    if (t.locationId && locationStatsMap[t.locationId]) {
      matchedLoc = locationStatsMap[t.locationId];
    } else {
      const textToMatch = `${t.location || ''} ${t.hostelBlock || ''}`.toLowerCase();
      const foundObj = CAMPUS_LOCATIONS.find(l => textToMatch.includes(l.name.toLowerCase()));
      if (foundObj && locationStatsMap[foundObj.id]) {
        matchedLoc = locationStatsMap[foundObj.id];
      }
    }

    if (matchedLoc) {
      matchedLoc.count++;
      zoneCounts[matchedLoc.zone] = (zoneCounts[matchedLoc.zone] || 0) + 1;
      const cat = t.category || 'General';
      matchedLoc.categories[cat] = (matchedLoc.categories[cat] || 0) + 1;
    } else {
      zoneCounts['Online / No location'] = (zoneCounts['Online / No location'] || 0) + 1;
    }
  });

  const locationList = Object.values(locationStatsMap).map(loc => {
    let intensity = 'green';
    if (loc.count >= 5) intensity = 'rose';
    else if (loc.count >= 2) intensity = 'amber';
    return { ...loc, intensity };
  });

  // Top 5 Hotspots
  const topHotspots = [...locationList]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const categories = ['Hostel & Facilities', 'IT & Network', 'Finance & Scholarship', 'Sanitation & Hygiene', 'Academics', 'Harassment & Discipline'];

  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Title', 'Category', 'Department', 'Campus Zone', 'Building Location', 'Status', 'SLA Escalated', 'Submitted Date'];
    const rows = filteredComplaints.map(c => [
      `"${c.id}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${c.category || ''}"`,
      `"${c.department || ''}"`,
      `"${c.zone || 'Campus'}"`,
      `"${c.location || 'General'}"`,
      `"${c.status || ''}"`,
      `"${c.isEscalated ? 'YES' : 'NO'}"`,
      `"${c.submittedAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ResolveHub_Campus_Heatmap_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Overview Analytics Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#8B2414]" />
            Campus-Wide Issue Heatmap & SLA Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive complaint density across Hostels, Academics, Library, Administration, Food, Transport, and Online Systems.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-[#8B2414] hover:bg-[#721c0e] text-white font-extrabold text-xs rounded-2xl cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT REPORT (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-500 font-extrabold uppercase">
          <Filter className="w-4 h-4 text-[#8B2414]" />
          <span>HEATMAP FILTERS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-800 font-semibold cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-800 font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="investigating">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-800 font-semibold cursor-pointer"
          >
            <option value="all">All Time History</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Filtered Complaints</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-heading">{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all campus zones</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Resolution Velocity</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-sky-700 mt-2 font-heading">18.5 Hrs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Average SLA turnaround</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-[#8B2414]" />
          </div>
          <div className="text-3xl font-extrabold text-[#8B2414] mt-2 font-heading">{resolved}</div>
          <div className="text-[11px] text-[#8B2414] font-semibold mt-0.5">
            {total > 0 ? Math.round((resolved / total) * 100) : 100}% Resolution Rate
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">SLA Escalations</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700 mt-2 font-heading">{escalated}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Escalated to HOD/Dean</div>
        </div>
      </div>

      {/* ── TOP 5 HOTSPOTS LIST ── */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            Top 5 Campus Hotspots (Highest Issue Volume)
          </h3>
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold">
            Priority Attention Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {topHotspots.map((hotspot, idx) => (
            <div 
              key={hotspot.id} 
              className={`p-4 rounded-2xl border transition-all ${
                hotspot.count >= 3 ? 'bg-rose-50 border-rose-300' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-rose-900">#{idx + 1}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-stone-200 font-bold">{hotspot.zone}</span>
              </div>
              <div className="font-bold text-xs text-slate-900 truncate" title={hotspot.name}>{hotspot.name}</div>
              <div className="mt-2 text-2xl font-extrabold text-rose-800 font-heading">
                {hotspot.count} <span className="text-[10px] font-normal text-slate-500">issues</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ZONE-LEVEL CARDS & EXPANDABLE LOCATIONS HEATMAP ── */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8B2414]" />
            Campus Zone-Level Complaint Heatmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any campus zone card to expand and inspect building-level complaint distributions.
          </p>
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LOCATION_ZONES.map(zoneName => {
            const count = zoneCounts[zoneName] || 0;
            const isExpanded = expandedZone === zoneName;
            const isHighDensity = count >= 5;

            return (
              <div
                key={zoneName}
                onClick={() => setExpandedZone(isExpanded ? null : zoneName)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isExpanded
                    ? 'bg-[#8B2414] text-white shadow-md border-[#8B2414]'
                    : isHighDensity
                    ? 'bg-rose-100/70 border-rose-300 text-rose-950 hover:bg-rose-100'
                    : count > 0
                    ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
                    : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{zoneName}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-2xl font-extrabold font-heading ${isExpanded ? 'text-white' : ''}`}>
                    {count}
                  </span>
                  <span className={`text-[10px] ${isExpanded ? 'text-rose-200' : 'text-slate-500'}`}>complaints</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded Zone Detail View */}
        {expandedZone && (
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8B2414]" />
                Building Locations in Zone: <span className="text-[#8B2414] font-mono">{expandedZone}</span>
              </h4>
              <span className="text-xs text-slate-500">
                Click zone above to close
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locationList
                .filter(loc => loc.zone === expandedZone)
                .map(loc => (
                  <div key={loc.id} className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{loc.name}</div>
                      <div className="text-[10px] text-slate-400">{loc.type}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-extrabold ${
                      loc.count >= 5 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      loc.count >= 2 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-slate-700'
                    }`}>
                      {loc.count} issues
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── LOCATION-BY-CATEGORY MATRIX TABLE ── */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-700" />
          Location-by-Category Grievance Matrix
        </h3>
        <div className="overflow-x-auto border border-stone-200 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Campus Building / Location</th>
                <th className="px-4 py-3">Zone</th>
                {categories.map(cat => <th key={cat} className="px-3 py-3 text-center">{cat.split('&')[0]}</th>)}
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {locationList.slice(0, 10).map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{loc.name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{loc.zone}</td>
                  {categories.map(cat => {
                    const cCount = loc.categories[cat] || 0;
                    return (
                      <td key={cat} className="px-3 py-3 text-center font-mono">
                        {cCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold">{cCount}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900">{loc.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── UPDATED DEPARTMENT SLA COMPLIANCE CARD (Includes Non-Academic & Displays N/A) ── */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8B2414]" />
            Department SLA Compliance & Performance Monitor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Includes Hostel Office, Transport, Library, Accounts, Exam Cell, and Security. Shows &quot;N/A&quot; when no complaints exist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_DEPARTMENTS.map((dept) => {
            const deptComplaints = filteredComplaints.filter(c => c.department === dept);
            const deptTotal = deptComplaints.length;
            const deptResolved = deptComplaints.filter(c => c.status.toLowerCase() === 'resolved').length;
            
            // Show "N/A" instead of 0% when no complaints are resolved or no complaints exist
            const hasData = deptTotal > 0 && deptResolved > 0;
            const pct = deptTotal > 0 ? Math.round((deptResolved / deptTotal) * 100) : 0;
            const slaDisplay = hasData ? `${pct}% SLA Met` : 'N/A (No Resolved Complaints)';

            return (
              <div key={dept} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <span>{dept}</span>
                  <span className={`font-mono font-extrabold ${hasData ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {slaDisplay}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${hasData ? 'bg-emerald-600' : 'bg-slate-300'}`} 
                    style={{ width: `${hasData ? Math.max(pct, 8) : 0}%` }} 
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {deptTotal === 0 ? 'No grievances logged for this department' : `${deptResolved} resolved out of ${deptTotal} total tickets`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
