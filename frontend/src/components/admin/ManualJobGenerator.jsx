// components/admin/ManualJobGenerator.jsx - Manual Job Generation for Admins
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Play,
  BarChart3
} from 'lucide-react';

const ManualJobGenerator = ({ onJobsGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [generationStats, setGenerationStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
    loadLastGeneration();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/recurring-job-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadLastGeneration = async () => {
    try {
      // Get the most recent lastGenerated timestamp from templates
      const response = await fetch('/api/recurring-job-templates');
      if (response.ok) {
        const templates = await response.json();
        const lastGeneration = templates
          .filter(t => t.lastGenerated)
          .map(t => new Date(t.lastGenerated))
          .sort((a, b) => b - a)[0];
        
        if (lastGeneration) {
          setLastGenerated(lastGeneration);
        }
      }
    } catch (error) {
      console.error('Error loading last generation:', error);
    }
  };

  const handleGenerateAllJobs = async () => {
    setIsGenerating(true);
    setError('');
    setGenerationStats(null);
    
    try {
      console.log('🔄 Starting manual job generation...');
      
      const response = await fetch('/api/recurring-job-templates/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Generation completed:', result);
      
      setGenerationStats(result);
      setLastGenerated(new Date());
      
      // Notify parent component
      if (onJobsGenerated && result.jobsGenerated > 0) {
        onJobsGenerated(result);
      }
      
      // Reload templates to get updated lastGenerated timestamps
      loadTemplates();
      
    } catch (error) {
      console.error('❌ Generation error:', error);
      setError(error.message || 'Failed to generate jobs');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateStatus = (template) => {
    if (!template.lastGenerated) {
      return { status: 'never', color: 'text-red-600', icon: AlertTriangle };
    }
    
    const lastGen = new Date(template.lastGenerated);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    if (lastGen < weekAgo) {
      return { status: 'overdue', color: 'text-orange-600', icon: AlertTriangle };
    }
    
    return { status: 'recent', color: 'text-green-600', icon: CheckCircle };
  };

  const activeTemplates = templates.filter(t => t.isActive);
  const overdueTemplates = templates.filter(t => {
    const status = getTemplateStatus(t);
    return status.status === 'never' || status.status === 'overdue';
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Zap className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Manual Job Generation</h3>
          <p className="text-sm text-gray-600">Generate recurring jobs from all active templates</p>
        </div>
      </div>

      {/* Template Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Active Templates</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{activeTemplates.length}</div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Need Generation</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{overdueTemplates.length}</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Last Generated</span>
          </div>
          <div className="text-sm font-medium text-green-600">
            {lastGenerated ? lastGenerated.toLocaleDateString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Generation Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleGenerateAllJobs}
          disabled={isGenerating || activeTemplates.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isGenerating 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating Jobs...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Generate Jobs for This Week
            </>
          )}
        </button>
        
        <button
          onClick={loadTemplates}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Generation Failed</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Generation Results */}
      {generationStats && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-700 mb-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Generation Completed!</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-600">Templates Processed:</span>
              <div className="font-semibold text-green-700">{generationStats.templatesProcessed || 0}</div>
            </div>
            <div>
              <span className="text-green-600">Jobs Generated:</span>
              <div className="font-semibold text-green-700">{generationStats.jobsGenerated || 0}</div>
            </div>
            <div>
              <span className="text-green-600">Success Rate:</span>
              <div className="font-semibold text-green-700">
                {generationStats.templatesProcessed > 0 
                  ? Math.round(((generationStats.templatesProcessed - (generationStats.errors || 0)) / generationStats.templatesProcessed) * 100)
                  : 0}%
              </div>
            </div>
            <div>
              <span className="text-green-600">Duration:</span>
              <div className="font-semibold text-green-700">
                {generationStats.duration ? `${Math.round(generationStats.duration)}ms` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template List */}
      {templates.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Template Status
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {templates.map((template) => {
              const status = getTemplateStatus(template);
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={template.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500">
                        {template.frequency.toLowerCase()} • {template.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.lastGenerated 
                      ? new Date(template.lastGenerated).toLocaleDateString()
                      : 'Never generated'
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">How it works:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Generates jobs from all active recurring templates</li>
          <li>• Only creates jobs that don't already exist for this week</li>
          <li>• Automatically runs every Monday at 6:00 AM</li>
          <li>• Daily backup check at 7:00 AM catches any missed jobs</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualJobGenerator;