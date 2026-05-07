import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useAI } from '../../context/AIContext';
import { 
  DocumentTextIcon, 
  LinkIcon, 
  ClipboardDocumentIcon,
  SparklesIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const JobDescriptionParser = ({ onParsed, onClose }) => {
  const [inputType, setInputType] = useState('text'); // 'text', 'url', 'file'
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const { parseJobDescription } = useAI();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && file.type === 'text/plain') {
        const text = await file.text();
        setJobText(text);
        toast.success('File loaded! Click "Parse" to extract information.');
      } else {
        toast.error('Please upload a .txt file');
      }
    },
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const handleParse = async () => {
    let content = '';
    
    if (inputType === 'url' && jobUrl) {
      content = `URL: ${jobUrl}`;
    } else if (inputType === 'text' && jobText) {
      content = jobText;
    } else {
      toast.error('Please provide job description content');
      return;
    }
    
    setParsing(true);
    const result = await parseJobDescription(content, inputType);
    if (result && !result.error) {
      setParsedData(result);
      toast.success('Job description parsed successfully!');
    } else {
      toast.error('Failed to parse job description');
    }
    setParsing(false);
  };

  const handleApply = () => {
    if (parsedData) {
      onParsed(parsedData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Job Description Parser</h2>
            <p className="text-gray-600 mt-1">Paste URL, text, or upload file to auto-extract information</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Type Selection */}
          <div className="flex gap-3">
            <button
              onClick={() => setInputType('text')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                inputType === 'text'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📝 Paste Text
            </button>
            <button
              onClick={() => setInputType('url')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                inputType === 'url'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔗 Job URL
            </button>
            <button
              onClick={() => setInputType('file')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                inputType === 'file'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📄 Upload File
            </button>
          </div>

          {/* Input Area */}
          {inputType === 'url' && (
            <Input
              label="Job Posting URL"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              icon={<LinkIcon className="h-4 w-4" />}
            />
          )}

          {inputType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description Text
              </label>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Paste the full job description here..."
              />
            </div>
          )}

          {inputType === 'file' && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
            >
              <input {...getInputProps()} />
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Drag & drop a .txt file here, or click to select</p>
              <p className="text-xs text-gray-400 mt-2">Only .txt files supported</p>
            </div>
          )}

          <Button onClick={handleParse} isLoading={parsing} className="w-full">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Parse with AI
          </Button>

          {/* Parsed Results */}
          {parsedData && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{parsedData.company || 'Not detected'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">{parsedData.role || 'Not detected'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Salary Range</p>
                    <p className="font-medium text-gray-900">{parsedData.salary || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Experience Level</p>
                    <p className="font-medium text-gray-900">{parsedData.experience || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills?.map((skill, i) => (
                      <Badge key={i} variant="info">{skill}</Badge>
                    )) || <p className="text-sm text-gray-400">No skills detected</p>}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.keywords?.slice(0, 10).map((keyword, i) => (
                      <Badge key={i} variant="default" className="text-xs">{keyword}</Badge>
                    )) || <p className="text-sm text-gray-400">No keywords detected</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleApply} className="flex-1">
                  Apply to Job Tracker
                </Button>
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionParser;