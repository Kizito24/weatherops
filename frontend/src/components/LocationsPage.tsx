import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Globe,
  X,
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';
import { Location } from '../types';
import EmptyState from './EmptyState';
import { TableSkeleton } from './Skeletons';

interface LocationsPageProps {
  id?: string;
  locations: Location[];
  onAddLocation: (name: string, lat: number, lng: number) => Promise<any>;
  onEditLocation: (id: string, name: string, lat: number, lng: number) => Promise<any>;
  onDeleteLocation: (id: string) => Promise<any>;
  isLoading: boolean;
}

export default function LocationsPage({
  id = 'weatherops-locations-view',
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  isLoading,
}: LocationsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals Local state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  
  // Loading and Errors
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter locations by name
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setName('');
    setLatitude('');
    setLongitude('');
    setActionError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingLocId(loc.id);
    setName(loc.name);
    setLatitude(loc.latitude.toString());
    setLongitude(loc.longitude.toString());
    setActionError(null);
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setIsSubmitting(true);

    try {
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);

      await onAddLocation(name, latVal, lngVal);
      setIsAddOpen(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail ||
                      err.message ||
                      'Failed to create location';
      setActionError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocId) return;

    setActionError(null);
    setIsSubmitting(true);

    try {
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);

      await onEditLocation(editingLocId, name, latVal, lngVal);
      setIsEditOpen(false);
      setEditingLocId(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail ||
                      err.message ||
                      'Failed to update location';
      setActionError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to stop monitoring ${name}? This will delete all weather rules and alerts associated with this location.`)) {
      await onDeleteLocation(id);
    }
  };

  return (
    <div id={id} className="space-y-5">
      {/* Search and Main Call to Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-lg shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            id="search-locations"
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-805 border border-slate-150 dark:border-slate-750 focus:border-indigo-650 rounded-md text-slate-900 dark:text-slate-100 focus:outline-hidden transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          id="open-add-location-modal"
          onClick={handleOpenAdd}
          className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#111827] hover:bg-black dark:bg-slate-850 dark:hover:bg-slate-800 rounded-md shadow-2xs hover:shadow-xs transition-all uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Provision Station</span>
        </button>
      </div>

      {/* Main Table view */}
      {isLoading ? (
        <TableSkeleton id="locations-loading-skele" rows={5} />
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          id="no-locations-match-state"
          iconName="Compass"
          title={searchQuery ? "No matches found" : "No locations tracked"}
          description={
            searchQuery
              ? `We couldn't find any location matching "${searchQuery}". Try refining spelling limits.`
              : "WeatherOps tracks real-time microclimate boundaries per coordinates. Get started by provisioning your first spot."
          }
          actionText={searchQuery ? undefined : "Provision Position"}
          onAction={searchQuery ? undefined : handleOpenAdd}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F9FAFB] dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-100 dark:border-slate-803">
                <tr>
                  <th className="px-5 py-3 font-semibold">Provision Name</th>
                  <th className="px-5 py-3 font-semibold">Latitude</th>
                  <th className="px-5 py-3 font-semibold">Longitude</th>
                  <th className="px-5 py-3 font-semibold">Created Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                {filteredLocations.map((loc) => (
                  <tr
                    key={loc.id}
                    id={`location-row-${loc.id}`}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all font-sans"
                  >
                    <td className="px-5 py-3 font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-md bg-slate-50 dark:bg-indigo-950/30 text-slate-500 dark:text-indigo-455">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span>{loc.name}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-350">
                      {loc.latitude.toFixed(4)}°
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-350">
                      {loc.longitude.toFixed(4)}°
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(loc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`edit-loc-${loc.id}`}
                          onClick={() => handleOpenEdit(loc)}
                          className="p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                          title="Edit Operational details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`delete-loc-${loc.id}`}
                          onClick={() => handleDelete(loc.id, loc.name)}
                          className="p-1 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-605 dark:hover:text-red-405 transition cursor-pointer"
                          title="Decommission Location"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-850 bg-slate-50/20 text-[10px] font-mono tracking-wider font-bold text-slate-450 uppercase">
            Currently tracking {filteredLocations.length} active global regions.
          </div>
        </div>
      )}

      {/* --- ADD LOCATION MODEL EXPRESSION --- */}
      {isAddOpen && (
        <div id="add-location-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div id="add-location-modal" className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">Provision Spot</h3>
              </div>
              <button
                id="close-add-location"
                onClick={() => setIsAddOpen(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-lg text-red-750 dark:text-red-400 text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <label htmlFor="loc-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                  Location Label Name
                </label>
                <input
                  id="loc-name"
                  type="text"
                  required
                  placeholder="e.g. Lagos, Nigeria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:border-indigo-500 rounded-lg text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="loc-lat" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                    Latitude
                  </label>
                  <input
                    id="loc-lat"
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    required
                    placeholder="e.g. 6.5244"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:border-indigo-500 rounded-lg text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="loc-lng" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                    Longitude
                  </label>
                  <input
                    id="loc-lng"
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    required
                    placeholder="e.g. 3.3792"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:border-indigo-500 rounded-lg text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-[11px] text-indigo-750 dark:text-indigo-400 flex gap-2">
                <Compass className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Provide accurate GPS values. WeatherOps automatically fetches microclimate updates matching these coordinates.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  id="cancel-add-location"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-750 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="submit-add-location"
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-750 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Point'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT LOCATION MODEL EXPRESSION --- */}
      {isEditOpen && (
        <div id="edit-location-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div id="edit-location-modal" className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4.5 w-4.5 text-indigo-655 dark:text-indigo-400" />
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">Edit Location Parameters</h3>
              </div>
              <button
                id="close-edit-location"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingLocId(null);
                }}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-lg text-red-750 dark:text-red-400 text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <label htmlFor="edit-loc-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                  Location Label Name
                </label>
                <input
                  id="edit-loc-name"
                  type="text"
                  required
                  placeholder="e.g. Lagos, Nigeria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:border-indigo-500 rounded-lg text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-loc-lat" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                    Latitude
                  </label>
                  <input
                    id="edit-loc-lat"
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    required
                    placeholder="e.g. 6.5244"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:border-indigo-500 rounded-lg text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="edit-loc-lng" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                    Longitude
                  </label>
                  <input
                    id="edit-loc-lng"
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    required
                    placeholder="e.g. 3.3792"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:border-indigo-500 rounded-lg text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  id="cancel-edit-location"
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingLocId(null);
                  }}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-750 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="submit-edit-location"
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-755 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Parameters'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
