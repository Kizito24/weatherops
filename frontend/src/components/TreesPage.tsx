import React, { useState, useEffect } from 'react';
import {
  Upload,
  Leaf,
  AlertCircle,
  CheckCircle2,
  TreePine,
  TrendingUp,
  Calendar,
  MapPin,
  Zap,
  Loader2,
  X,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { TreeAnalysis, TreeUsage } from '../types';
import { treesApi } from '../lib/api/trees';
import { TableSkeleton, WidgetSkeleton } from './Skeletons';

export default function TreesPage() {
  const [treeAnalyses, setTreeAnalyses] = useState<TreeAnalysis[]>([]);
  const [usage, setUsage] = useState<TreeUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<TreeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [farmerId, setFarmerId] = useState('');
  const [county, setCounty] = useState('');
  const [landAcres, setLandAcres] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [analysesData, usageData] = await Promise.all([
        treesApi.listAnalyses(10),
        treesApi.getUsage(),
      ]);
      setTreeAnalyses(analysesData.analyses);
      setUsage(usageData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load tree analysis data');
    }
    setIsLoading(false);
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image must be smaller than 20MB');
      return;
    }

    setSelectedImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = e => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    if (!usage || usage.remaining <= 0) {
      setError('No tree analyses remaining in your plan');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      if (farmerId) formData.append('farmer_id', farmerId);
      if (county) formData.append('county', county);
      if (landAcres) formData.append('land_acres', landAcres);
      if (location) formData.append('location', location);
      if (notes) formData.append('notes', notes);

      const result = await treesApi.analyze(formData);
      setAnalysisResult(result);

      // Reload analyses list
      const analysesData = await treesApi.listAnalyses(10);
      setTreeAnalyses(analysesData.analyses);

      const usageData = await treesApi.getUsage();
      setUsage(usageData);

      // Clear form
      setSelectedImage(null);
      setPreviewUrl(null);
      setFarmerId('');
      setCounty('');
      setLandAcres('');
      setLocation('');
      setNotes('');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze image. Please try again.');
    }

    setIsAnalyzing(false);
  };

  const handleClearResult = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold">Tree & Canopy Analysis</h1>
          </div>
          <p className="text-gray-400">Upload farm images to analyze tree count, canopy health, and get agronomic recommendations.</p>

          {usage && (
            <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-400">
                Analyses used: <span className="text-white font-semibold">{usage.used} / {usage.limit}</span>
                {usage.remaining > 0 && (
                  <span className="ml-3 text-emerald-400">({usage.remaining} remaining)</span>
                )}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Analysis Result Card (shown after analysis) */}
        {analysisResult && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-500/50 rounded-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <button
                onClick={handleClearResult}
                className="p-1 hover:bg-gray-700 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Original vs Overlay Images */}
              <div>
                <p className="text-sm font-semibold text-gray-400 mb-2">Original Image</p>
                <img
                  src={analysisResult.original_image_url}
                  alt="Original"
                  className="w-full rounded-lg border border-gray-700"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-400 mb-2">Canopy Overlay</p>
                <img
                  src={analysisResult.overlay_image_url}
                  alt="Overlay"
                  className="w-full rounded-lg border border-gray-700"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Total Trees</p>
                <p className="text-3xl font-bold">{analysisResult.total_tree_count}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Tree Density</p>
                <p className="text-3xl font-bold">{analysisResult.tree_density_per_acre?.toFixed(1) || '-'}</p>
                <p className="text-xs text-gray-400">per acre</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Canopy Coverage</p>
                <p className="text-3xl font-bold">{analysisResult.canopy_coverage_pct.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Confidence</p>
                <p className="text-3xl font-bold">{(analysisResult.confidence_score * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Tree Health Breakdown */}
            <div className="bg-gray-700/30 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4">Tree Health Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Healthy
                    </span>
                    <span className="font-bold">{analysisResult.tree_health.healthy}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition"
                      style={{
                        width: `${(analysisResult.tree_health.healthy / analysisResult.total_tree_count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      Needs Care
                    </span>
                    <span className="font-bold">{analysisResult.tree_health.needs_care}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition"
                      style={{
                        width: `${(analysisResult.tree_health.needs_care / analysisResult.total_tree_count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-red-400">
                      <X className="w-4 h-4" />
                      Needs Replacement
                    </span>
                    <span className="font-bold">{analysisResult.tree_health.needs_replacement}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition"
                      style={{
                        width: `${(analysisResult.tree_health.needs_replacement / analysisResult.total_tree_count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Species and Observations */}
            {analysisResult.tree_species_guess && (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Species Identified</p>
                <div className="inline-block bg-indigo-900/30 border border-indigo-500/50 rounded-full px-4 py-2">
                  <p className="font-medium">{analysisResult.tree_species_guess}</p>
                </div>
              </div>
            )}

            {analysisResult.observations.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-lg mb-3">Observations</p>
                <ul className="space-y-2">
                  {analysisResult.observations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.recommendations.length > 0 && (
              <div>
                <p className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Recommendations
                </p>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-indigo-400 mt-1">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!analysisResult && (
          <>
            {/* Upload Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
              <h2 className="text-xl font-bold mb-6">Upload Farm Image</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div>
                  <label className="block mb-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition"
                      onDragOver={e => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-indigo-500');
                      }}
                      onDragLeave={e => {
                        e.currentTarget.classList.remove('border-indigo-500');
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-indigo-500');
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          handleImageSelect(files[0]);
                        }
                      }}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 font-medium mb-1">Drop image here or click to browse</p>
                      <p className="text-sm text-gray-400">JPEG, PNG, or WEBP • Max 20MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => e.target.files && handleImageSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  {previewUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-400 mb-2">Preview</p>
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg border border-gray-700" />
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Farmer ID (optional)</label>
                    <input
                      type="text"
                      value={farmerId}
                      onChange={e => setFarmerId(e.target.value)}
                      placeholder="e.g., F-001"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">County (optional)</label>
                    <input
                      type="text"
                      value={county}
                      onChange={e => setCounty(e.target.value)}
                      placeholder="e.g., Bomet"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Land Size (acres) (optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={landAcres}
                      onChange={e => setLandAcres(e.target.value)}
                      placeholder="e.g., 2.5"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Location (optional)</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g., Kapkimolwa Farm"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g., Tea plantation, recently pruned"
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedImage || isAnalyzing || !usage || usage.remaining <= 0}
                    className="w-full mt-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Analyze Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Past Analyses */}
        {isLoading ? (
          <TableSkeleton />
        ) : treeAnalyses.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Past Analyses</h2>
            <div className="space-y-4">
              {treeAnalyses.map(analysis => (
                <div
                  key={analysis.analysis_id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-indigo-500/50 transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Date</p>
                      <p className="font-semibold">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="font-semibold flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        {analysis.location || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Tree Count</p>
                      <p className="text-2xl font-bold text-emerald-400">{analysis.total_tree_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Confidence</p>
                      <p className="font-semibold">{(analysis.confidence_score * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 rounded-lg text-indigo-400 text-sm font-medium transition flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <TreePine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No past analyses yet</p>
            <p className="text-gray-500 text-sm">Upload an image to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
