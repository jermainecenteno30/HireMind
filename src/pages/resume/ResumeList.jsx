import React, { useState } from 'react';
import { useResumes } from '../../hooks/useResumes';
import { useAuth } from '../../context/AuthContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import ResumeBuilderV2 from '../../components/resume/ResumeBuilderV2';
import { ModernTemplate, MinimalTemplate, CorporateTemplate, TemplateSelector } from '../../components/resume/ResumeTemplates';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AIResumeFeedback from '../../components/resume/AIResumeFeedback';

const ResumeList = () => {
  const { resumes, addResume, updateResume, deleteResume, canAddResume } = useResumes();
  const { isPremium, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [formData, setFormData] = useState({
    title: '',
    tags: [],
    content: '',
    structuredData: null,
    version: 1
  });
  const [tagInput, setTagInput] = useState('');
  
  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput]
      });
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const handleSubmit = async (markdownContent, structuredData) => {
    if (!formData.title) {
      toast.error('Please enter a resume title');
      return;
    }
    
    if (!markdownContent && !formData.content) {
      toast.error('Please fill in your resume information');
      return;
    }
    
    const resumeData = {
      title: formData.title,
      tags: formData.tags,
      content: markdownContent || formData.content,
      structuredData: structuredData || formData.structuredData,
      version: editingResume ? formData.version + 1 : 1
    };
    
    let result;
    if (editingResume) {
      result = await updateResume(editingResume.id, resumeData);
      if (result.success) {
        toast.success('Resume updated successfully!');
      }
    } else {
      result = await addResume(resumeData);
      if (result.success) {
        toast.success('Resume created successfully!');
      } else if (result.error) {
        toast.error(result.error);
        return;
      }
    }
    
    if (result.success) {
      setShowForm(false);
      setEditingResume(null);
      setFormData({
        title: '',
        tags: [],
        content: '',
        structuredData: null,
        version: 1
      });
    }
  };
  
  const handleEdit = (resume) => {
    setEditingResume(resume);
    setFormData({
      title: resume.title,
      tags: resume.tags || [],
      content: resume.content || '',
      structuredData: resume.structuredData || null,
      version: resume.version
    });
    setShowForm(true);
  };
  
  const handleDelete = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      const result = await deleteResume(resumeId);
      if (result.success) {
        toast.success('Resume deleted');
      }
    }
  };

  const handleView = (resume) => {
    setViewingResume(resume);
    setSelectedTemplate('modern');
  };

  const handleCopyToClipboard = () => {
    if (viewingResume) {
      navigator.clipboard.writeText(viewingResume.content || '');
      toast.success('Resume content copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (viewingResume && viewingResume.content) {
      const element = document.createElement('a');
      const file = new Blob([viewingResume.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${viewingResume.title.replace(/\s/g, '_')}_v${viewingResume.version}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Resume downloaded!');
    } else {
      toast.error('No content to download');
    }
  };

  const renderResumeTemplate = () => {
    if (!viewingResume) return null;
    
    switch(selectedTemplate) {
      case 'minimal':
        return <MinimalTemplate resume={viewingResume} />;
      case 'corporate':
        return <CorporateTemplate resume={viewingResume} />;
      default:
        return <ModernTemplate resume={viewingResume} />;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage professional resumes with our builder</p>
          {!isPremium && (
            <p className="text-sm text-gray-500 mt-1">
              Free tier: {resumes.length}/3 resumes used
            </p>
          )}
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!canAddResume()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Resume
        </Button>
      </div>
      
      {/* Resume Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                        <p className="text-xs text-gray-500">Version {resume.version}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(resume)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                    </div>
                    {resume.tags && resume.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resume.tags.map(tag => (
                          <Badge key={tag} variant="default" className="text-xs">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
  {resume.content && typeof resume.content === 'string' ? resume.content.substring(0, 150) : 'No content yet'}...
</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleView(resume)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* View Resume Modal with Templates */}
      <AnimatePresence>
        {viewingResume && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{viewingResume.title}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="info">Version {viewingResume.version}</Badge>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date(viewingResume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {viewingResume.tags && viewingResume.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {viewingResume.tags.map(tag => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCopyToClipboard}
                    >
                      <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleDownload}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <button
                      onClick={() => setViewingResume(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                {/* Template Selector - Only for Premium users */}
                {isPremium && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Choose Template Style
                    </label>
                    <TemplateSelector 
                      selectedTemplate={selectedTemplate}
                      onSelect={setSelectedTemplate}
                    />
                  </div>
                )}
              </div>
              
              {/* Modal Content - Rendered Template with null check */}
              <div className="p-6">
{viewingResume && viewingResume.content && typeof viewingResume.content === 'string' ? (
  renderResumeTemplate()
) : (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No Resume Content</h3>
    <p className="text-gray-500 mb-4">
      This resume doesn't have any content yet.
    </p>
    <Button 
      size="sm" 
      onClick={() => {
        setViewingResume(null);
        handleEdit(viewingResume);
      }}
    >
      <PencilIcon className="h-4 w-4 mr-2" />
      Edit Resume
    </Button>
  </div>
)}
                
                {/* AI Resume Feedback Section (Premium) */}
                {isPremium && viewingResume && viewingResume.content && typeof viewingResume.content === 'string' && (
  <div className="mt-6">
    <AIResumeFeedback 
      resumeContent={viewingResume.content}
      resumeTitle={viewingResume.title}
      userSkills={viewingResume.tags || []}
    />
  </div>
)}
                {/* Upgrade prompt for free users */}
                {!isPremium && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg text-center">
                    <p className="text-sm text-gray-700">
                      🎨 Want more templates and AI feedback? 
                      <button className="ml-2 text-primary-600 hover:text-primary-700 font-medium">
                        Upgrade to Premium - ₱99/month
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Add/Edit Resume Modal with ResumeBuilder */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingResume ? 'Edit Resume' : 'Create New Resume'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fill in your professional information to build your resume
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingResume(null);
                    setFormData({
                      title: '',
                      tags: [],
                      content: '',
                      structuredData: null,
                      version: 1
                    });
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Resume Title and Tags */}
                <div className="mb-6">
                  <Input
                    label="Resume Title *"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Frontend Developer Resume, Jermaine Centeno CV"
                  />
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag (e.g., Web Developer, React, Fresh Graduate)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button type="button" size="sm" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="default">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Resume Builder Component */}
                <ResumeBuilderV2
                  initialData={formData.structuredData}
                  onSave={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingResume(null);
                    setFormData({
                      title: '',
                      tags: [],
                      content: '',
                      structuredData: null,
                      version: 1
                    });
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeList;