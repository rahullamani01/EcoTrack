import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { CampusTreeRecord } from '../types';
import {
  Trees,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Maximize2,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

export const TreeMonitoringView: React.FC = () => {
  const { user, token } = useAuth();
  const [trees, setTrees] = useState<CampusTreeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedVerificationFilter, setSelectedVerificationFilter] = useState<string>('all');
  const [selectedTree, setSelectedTree] = useState<CampusTreeRecord | null>(null);

  // Modal state for adding a tree (Admin / Faculty only)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Add form fields
  const [formCommon, setFormCommon] = useState('');
  const [formBotanical, setFormBotanical] = useState('');
  const [formMarathi, setFormMarathi] = useState('');
  const [formZone, setFormZone] = useState('Central Knowledge Resource Centre Lawns');
  const [formStatus, setFormStatus] = useState<'Healthy' | 'Needs Inspection' | 'Maintenance Required'>('Healthy');
  const [formCanopy, setFormCanopy] = useState('4.0');
  const [formHeight, setFormHeight] = useState('5.0');
  const [formNotes, setFormNotes] = useState('');

  const isAuthorized = user?.role === 'faculty' || user?.role === 'admin';

  const fetchTrees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trees');
      if (res.ok) {
        const data = await res.json();
        setTrees(data.trees || []);
      }
    } catch (err) {
      console.error('Failed to fetch trees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
  }, []);

  const handleCreateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCommon.trim() || !formZone.trim()) {
      setActionError('Common species name and campus location zone are required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const currentToken = token || localStorage.getItem('ecotrack_auth_token');
      const res = await fetch('/api/trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          treeData: {
            speciesCommon: formCommon,
            speciesBotanical: formBotanical,
            localNameMarathi: formMarathi,
            locationZone: formZone,
            status: formStatus,
            canopyDiameterMeters: parseFloat(formCanopy),
            heightMeters: parseFloat(formHeight),
            maintainedBy: user?.name ? `${user.name} (${user.department || 'SGU'})` : 'SGU Green Campus Cell',
            notes: formNotes,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to record tree');
      }

      setIsAddModalOpen(false);
      // Reset form
      setFormCommon('');
      setFormBotanical('');
      setFormMarathi('');
      setFormNotes('');
      await fetchTrees();
    } catch (err: any) {
      setActionError(err.message || 'Error recording tree');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (treeId: string, newStatus: 'Healthy' | 'Needs Inspection' | 'Maintenance Required') => {
    if (!isAuthorized) return;
    try {
      const currentToken = token || localStorage.getItem('ecotrack_auth_token');
      const res = await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          updates: { status: newStatus },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrees((prev) => prev.map((t) => (t.id === treeId ? data.tree : t)));
        if (selectedTree?.id === treeId) {
          setSelectedTree(data.tree);
        }
      }
    } catch (err) {
      console.error('Failed to update tree status:', err);
    }
  };

  const filteredTrees = useMemo(() => {
    return trees.filter((tree) => {
      const matchesSearch =
        tree.speciesCommon.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tree.speciesBotanical.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tree.localNameMarathi && tree.localNameMarathi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tree.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tree.locationZone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === 'all' || tree.status.toLowerCase() === selectedStatusFilter.toLowerCase();

      const matchesVerification =
        selectedVerificationFilter === 'all' ||
        (selectedVerificationFilter === 'verified' && tree.isVerified) ||
        (selectedVerificationFilter === 'sample' && !tree.isVerified);

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [trees, searchQuery, selectedStatusFilter, selectedVerificationFilter]);

  // Aggregate telemetry
  const totalCount = trees.length;
  const healthyCount = trees.filter((t) => t.status === 'Healthy').length;
  const needsAttentionCount = trees.filter((t) => t.status !== 'Healthy').length;
  const verifiedCount = trees.filter((t) => t.isVerified).length;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-card-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-mint text-on-pastel-mint text-xs font-semibold mb-2 border border-emerald-200/50">
            <Trees className="w-3.5 h-3.5" />
            <span>SGU Biodiversity & Urban Forestry Telemetry</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
            Campus Tree Monitoring
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            Audit, track, and maintain campus shade trees, medicinal specimens, and carbon sinks across the Sanjay Ghodawat University grounds in Kolhapur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAuthorized ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Tree Specimen</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-surface-container-low text-xs text-on-surface-variant border border-card-border flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-secondary" />
              <span>Logged in as Student (View & Search Mode)</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-card-border shadow-xs">
          <span className="text-xs text-secondary font-medium">Cataloged Specimens</span>
          <p className="font-headline text-2xl sm:text-3xl font-bold text-primary mt-1">{totalCount}</p>
          <span className="text-[11px] text-on-surface-variant">Campus wide</span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-card-border shadow-xs">
          <span className="text-xs text-secondary font-medium">Healthy Canopy</span>
          <p className="font-headline text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">{healthyCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0}% vitality rate
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-card-border shadow-xs">
          <span className="text-xs text-secondary font-medium">Maintenance Required</span>
          <p className="font-headline text-2xl sm:text-3xl font-bold text-amber-700 mt-1">{needsAttentionCount}</p>
          <span className="text-[11px] text-on-surface-variant">Pruning or hydration needed</span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-card-border shadow-xs">
          <span className="text-xs text-secondary font-medium">Verified Field Audits</span>
          <p className="font-headline text-2xl sm:text-3xl font-bold text-primary mt-1">{verifiedCount}</p>
          <span className="text-[11px] text-on-surface-variant">{totalCount - verifiedCount} sample research tags</span>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-card-border shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Neem, Peepal, Tag #, zone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-card-border bg-surface-container-low text-on-surface focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <span className="text-xs text-secondary font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface cursor-pointer"
          >
            <option value="all">All Health Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Needs Inspection">Needs Inspection</option>
            <option value="Maintenance Required">Maintenance Required</option>
          </select>

          <select
            value={selectedVerificationFilter}
            onChange={(e) => setSelectedVerificationFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface cursor-pointer"
          >
            <option value="all">All Records</option>
            <option value="verified">Verified Official Trees Only</option>
            <option value="sample">Educational Sample Records</option>
          </select>

          <button
            onClick={fetchTrees}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary hover:text-primary border border-card-border transition-colors cursor-pointer"
            title="Refresh tree records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-on-surface-variant">
          Loading SGU campus tree records...
        </div>
      ) : filteredTrees.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-lowest border border-card-border text-center">
          <Trees className="w-10 h-10 text-secondary mx-auto mb-2 opacity-50" />
          <h4 className="font-semibold text-primary text-sm">No Tree Specimens Found</h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Try adjusting your search keywords or clear status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrees.map((tree) => (
            <div
              key={tree.id}
              className="bg-surface-container-lowest rounded-2xl border border-card-border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/9] w-full bg-surface-container overflow-hidden">
                  <img
                    src={tree.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'}
                    alt={tree.speciesCommon}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-xs text-primary shadow-xs border border-card-border">
                      {tree.tagNumber}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {tree.isVerified ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-pastel-mint text-on-pastel-mint shadow-xs border border-emerald-300">
                        Verified Audit
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-pastel-amber text-on-pastel-amber shadow-xs border border-amber-300">
                        Sample Record
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-primary leading-tight">
                        {tree.speciesCommon}
                      </h3>
                      {tree.localNameMarathi && (
                        <span className="text-xs text-secondary font-medium block">
                          {tree.localNameMarathi}
                        </span>
                      )}
                      <span className="text-[11px] text-on-surface-variant italic">
                        {tree.speciesBotanical}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                        tree.status === 'Healthy'
                          ? 'bg-pastel-mint text-on-pastel-mint border-emerald-200'
                          : tree.status === 'Needs Inspection'
                          ? 'bg-pastel-amber text-on-pastel-amber border-amber-200'
                          : 'bg-pastel-rose text-on-pastel-rose border-rose-300'
                      }`}
                    >
                      {tree.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-on-surface-variant my-4 pt-3 border-t border-card-border">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <span className="line-clamp-1">{tree.locationZone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <span>Planted: {tree.plantedDate} · Inspected: {tree.lastInspectionDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <span>Canopy: {tree.canopyDiameterMeters}m · Height: {tree.heightMeters}m</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-card-border line-clamp-2">
                    {tree.notes}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedTree(tree)}
                  className="flex-1 py-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-medium text-primary border border-card-border transition-colors cursor-pointer text-center"
                >
                  View Dossier
                </button>

                {isAuthorized && (
                  <select
                    value={tree.status}
                    onChange={(e) => handleUpdateStatus(tree.id, e.target.value as any)}
                    className="text-[11px] px-2.5 py-2 rounded-xl border border-card-border bg-surface-container text-on-surface cursor-pointer"
                    title="Change maintenance status"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Inspection">Needs Inspection</option>
                    <option value="Maintenance Required">Maintenance Req.</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dossier Modal */}
      {selectedTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl border border-card-border p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTree(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface cursor-pointer border border-card-border"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pastel-mint text-primary border border-emerald-200">
                {selectedTree.tagNumber}
              </span>
              <span className="text-xs text-on-surface-variant">
                {selectedTree.isVerified ? 'Official Verified Tree' : 'Demonstration / Educational Record'}
              </span>
            </div>

            <h2 className="font-headline text-2xl font-bold text-primary mb-1">
              {selectedTree.speciesCommon}
            </h2>
            <p className="text-xs text-secondary italic mb-4">
              {selectedTree.speciesBotanical} {selectedTree.localNameMarathi ? `· ${selectedTree.localNameMarathi}` : ''}
            </p>

            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-4 border border-card-border">
              <img
                src={selectedTree.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80'}
                alt={selectedTree.speciesCommon}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded-xl bg-surface-container-low border border-card-border">
                <span className="text-secondary block">Location Zone</span>
                <strong className="text-on-surface mt-0.5 block">{selectedTree.locationZone}</strong>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-card-border">
                <span className="text-secondary block">Maintenance Status</span>
                <strong className="text-on-surface mt-0.5 block">{selectedTree.status}</strong>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-card-border">
                <span className="text-secondary block">Planted Date</span>
                <strong className="text-on-surface mt-0.5 block">{selectedTree.plantedDate}</strong>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-card-border">
                <span className="text-secondary block">Managed By</span>
                <strong className="text-on-surface mt-0.5 block">{selectedTree.maintainedBy}</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-card-border text-xs mb-6">
              <span className="font-semibold text-primary block mb-1">Audit Notes & Agronomy Observations</span>
              <p className="text-on-surface-variant leading-relaxed">{selectedTree.notes}</p>
            </div>

            <button
              onClick={() => setSelectedTree(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

      {/* Record New Tree Modal (Authorized Only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-card-border p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface cursor-pointer border border-card-border"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Trees className="w-5 h-5 text-primary" />
              <h3 className="font-headline text-lg font-bold text-primary">
                Register SGU Campus Tree
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Enter botanic metadata and geolocation to log this specimen in the official university urban forestry register.
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-pastel-rose text-xs text-on-pastel-rose mb-4 border border-rose-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateTree} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-on-surface mb-1">Common Species Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neem, Peepal, Gulmohar, Mahogany"
                  value={formCommon}
                  onChange={(e) => setFormCommon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Botanical Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Azadirachta indica"
                    value={formBotanical}
                    onChange={(e) => setFormBotanical(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">Local / Marathi Name</label>
                  <input
                    type="text"
                    placeholder="e.g. कडुनिंब"
                    value={formMarathi}
                    onChange={(e) => setFormMarathi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">Campus Location Zone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Library Quad, School of Technology Front"
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Health Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Needs Inspection">Needs Inspection</option>
                    <option value="Maintenance Required">Maintenance Req.</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">Canopy (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formCanopy}
                    onChange={(e) => setFormCanopy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">Height (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">Agronomy & Maintenance Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add notes about irrigation, branch pruning, or disease symptoms..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-border bg-surface-container-low text-on-surface"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Recording...' : 'Register Tree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
