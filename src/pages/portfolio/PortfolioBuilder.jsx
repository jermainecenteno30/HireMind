import React, { useState, useEffect, useCallback } from 'react';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';
import { portfolioService } from '../../services/portfolioService';
import { portfolioAnalyticsService } from '../../services/portfolioAnalyticsService';
import { uploadService } from '../../services/uploadService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GlobeAltIcon, 
  UserIcon, 
  BriefcaseIcon,
  LinkIcon,
  PhotoIcon,
  DocumentTextIcon,
  ShareIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ThemeSelector from '../../components/portfolio/ThemeSelector';
import PortfolioAnalytics from '../../components/portfolio/PortfolioAnalytics';

// TEMPORARY - Remove for production
const FORCE_PREMIUM_ACCESS = true;

const PortfolioBuilder = () => {
  const { user, isPremium: userIsPremium } = useAuth();
  const { getCareerInsights, isProcessing } = useAI();
  const isPremium = FORCE_PREMIUM_ACCESS || userIsPremium;
  
  const [portfolio, setPortfolio] = useState({
    username: '',
    displayName: user?.displayName || '',
    title: '',
    bio: '',
    avatar: '',
    coverImage: '',
    github: '',
    linkedin: '',
    twitter: '',
    projects: []
  });
  
  const [newProject, setNewProject] = useState({ 
    title: '', 
    description: '', 
    link: '', 
    technologies: '',
    image: ''
  });
  const [isPublished, setIsPublished] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [portfolioId, setPortfolioId] = useState(null);

  // Load existing portfolio
  useEffect(() => {
    loadPortfolio();
  }, [user]);

  // Load saved theme preference
  useEffect(() => {
    if (portfolioId) {
      const savedTheme = localStorage.getItem(`portfolio_theme_${portfolioId}`);
      if (savedTheme) setSelectedTheme(savedTheme);
    }
  }, [portfolioId]);

  // Auto-save theme preference
  useEffect(() => {
    if (portfolioId && selectedTheme) {
      localStorage.setItem(`portfolio_theme_${portfolioId}`, selectedTheme);
    }
  }, [selectedTheme, portfolioId]);

  // Auto-save draft
  useEffect(() => {
    if (!hasChanges) return;
    
    const timer = setTimeout(async () => {
      if (user && portfolio.username) {
        await autoSavePortfolio();
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [portfolio, user]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!portfolio.username || portfolio.username.length < 3) {
        setUsernameAvailable(false);
        return;
      }
      
      setCheckingUsername(true);
      const available = await portfolioService.isUsernameAvailable(portfolio.username, user?.uid);
      setUsernameAvailable(available);
      setCheckingUsername(false);
    };
    
    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [portfolio.username, user]);

  const loadPortfolio = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await portfolioService.getPortfolioByUserId(user.uid);
    
    if (result.success && result.data) {
      setPortfolio(result.data);
      setPortfolioId(result.data.id);
      setIsPublished(true);
      setShareUrl(`${window.location.origin}/portfolio/${result.data.username}`);
    } else {
      // Set default username
      setPortfolio(prev => ({
        ...prev,
        username: user.displayName?.toLowerCase().replace(/\s/g, '') || user.email?.split('@')[0] || ''
      }));
    }
    setLoading(false);
  };

  const autoSavePortfolio = async () => {
    if (!user || !portfolio.username) return;
    
    setSaving(true);
    const result = await portfolioService.savePortfolio(user.uid, portfolio);
    if (result.success) {
      if (!portfolioId && result.id) setPortfolioId(result.id);
      setHasChanges(false);
    }
    setSaving(false);
  };

  const savePortfolio = async () => {
    if (!user) return;
    
    // Validate username
    if (!portfolio.username) {
      toast.error('Please enter a username');
      return;
    }
    
    if (!usernameAvailable) {
      toast.error('Username is not available. Please choose another.');
      return;
    }
    
    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/i;
    if (!usernameRegex.test(portfolio.username)) {
      toast.error('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }
    
    setSaving(true);
    const result = await portfolioService.savePortfolio(user.uid, portfolio);
    
    if (result.success) {
      if (!portfolioId && result.id) setPortfolioId(result.id);
      setIsPublished(true);
      setShareUrl(`${window.location.origin}/portfolio/${portfolio.username}`);
      toast.success('Portfolio saved successfully!');
      setHasChanges(false);
    } else {
      toast.error('Failed to save portfolio');
    }
    setSaving(false);
  };

  const handleImageUpload = async (type, file) => {
    if (!file) return;
    
    try {
      await uploadService.validateImage(file);
      setUploadingImage(true);
      const imageUrl = await uploadService.uploadImage(file);
      
      if (imageUrl) {
        setPortfolio(prev => ({ ...prev, [type]: imageUrl }));
        setHasChanges(true);
        toast.success(`${type === 'avatar' ? 'Avatar' : 'Cover image'} uploaded!`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const generateBioWithAI = async () => {
    if (!isPremium) {
      toast.error('AI Bio generation is a premium feature');
      return;
    }
    
    setGeneratingBio(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedBio = `Passionate ${portfolio.title || 'developer'} with experience building web applications. 
      Skilled in modern technologies and committed to writing clean, efficient code. 
      Always eager to learn new technologies and solve challenging problems.`;
      
      setPortfolio(prev => ({ ...prev, bio: generatedBio }));
      setHasChanges(true);
      toast.success('AI-generated bio added! You can edit it further.');
      setGeneratingBio(false);
    }, 1500);
  };

  const addProject = () => {
    if (!newProject.title || !newProject.description) {
      toast.error('Please fill in title and description');
      return;
    }
    
    // Validate URL if provided
    if (newProject.link && !isValidUrl(newProject.link)) {
      toast.error('Please enter a valid URL (https://...)');
      return;
    }
    
    if (editingProject) {
      setPortfolio({
        ...portfolio,
        projects: portfolio.projects.map(p => 
          p.id === editingProject.id ? { ...newProject, id: p.id } : p
        )
      });
      toast.success('Project updated!');
    } else {
      setPortfolio({
        ...portfolio,
        projects: [...portfolio.projects, { ...newProject, id: Date.now() }]
      });
      toast.success('Project added!');
    }
    
    setNewProject({ title: '', description: '', link: '', technologies: '', image: '' });
    setEditingProject(null);
    setShowProjectModal(false);
    setHasChanges(true);
  };

  const removeProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setPortfolio({
        ...portfolio,
        projects: portfolio.projects.filter(p => p.id !== projectId)
      });
      setHasChanges(true);
      toast.success('Project removed');
    }
  };

  const moveProject = (index, direction) => {
    const newProjects = [...portfolio.projects];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newProjects.length) return;
    
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    setPortfolio({ ...portfolio, projects: newProjects });
    setHasChanges(true);
  };

  const handleProjectImageUpload = async (file) => {
    if (!file) return;
    
    try {
      await uploadService.validateImage(file);
      setUploadingImage(true);
      const imageUrl = await uploadService.uploadImage(file);
      
      if (imageUrl) {
        setNewProject({ ...newProject, image: imageUrl });
        toast.success('Project image uploaded!');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('https://') || url.startsWith('http://');
    } catch {
      return false;
    }
  };

  const canPublish = () => {
    return portfolio.username && 
           usernameAvailable && 
           portfolio.username.length >= 3 &&
           /^[a-z0-9_-]+$/i.test(portfolio.username);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="text-center py-12">
        <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Builder</h2>
        <p className="text-gray-600 mb-6">Create a professional portfolio to share with employers</p>
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-xl font-bold text-primary-600 mb-2">Premium Feature</p>
          <p className="text-sm text-gray-700 mb-4">Get a shareable portfolio page with custom themes</p>
          <Button>Upgrade to Pro - ₱99/month</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Builder</h1>
          <p className="text-gray-600 mt-2">Create a stunning portfolio to showcase your work</p>
        </div>
        <div className="flex gap-3">
          {saving && (
            <span className="text-sm text-gray-500 self-center">Saving...</span>
          )}
          <Button onClick={() => setShowAnalytics(!showAnalytics)} variant="outline">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
          </Button>
          <Button onClick={savePortfolio} disabled={saving || !canPublish()}>
            <ShareIcon className="h-4 w-4 mr-2" />
            {isPublished ? 'Update Portfolio' : 'Publish Portfolio'}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">You have unsaved changes. Your portfolio is auto-saving...</span>
          </div>
        </div>
      )}

      {/* Published Link Banner */}
      {isPublished && shareUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-green-900">Your portfolio is live!</p>
              <p className="text-sm text-green-700 break-all">{shareUrl}</p>
            </div>
            <Button onClick={() => navigator.clipboard.writeText(shareUrl)} size="sm" variant="outline">
              Copy Link
            </Button>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && portfolioId && (
        <PortfolioAnalytics portfolioId={portfolioId} username={portfolio.username} />
      )}

      {/* Theme Selector Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Theme</h3>
          <p className="text-sm text-gray-600 mt-1">Choose how your portfolio looks</p>
        </CardHeader>
        <CardBody>
          <ThemeSelector 
            selectedTheme={selectedTheme}
            onSelect={setSelectedTheme}
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </CardHeader>
            <CardBody>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={portfolio.username}
                      onChange={(e) => {
                        setPortfolio({...portfolio, username: e.target.value.toLowerCase()});
                        setHasChanges(true);
                      }}
                      placeholder="yourname"
                      className={!usernameAvailable && portfolio.username ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="text-sm text-gray-500 self-center">
                    .hiremind.app
                  </div>
                </div>
                {portfolio.username && (
                  <p className="text-xs mt-1">
                    {usernameAvailable ? (
                      <span className="text-green-600">✓ Username is available</span>
                    ) : (
                      <span className="text-red-600">✗ Username is taken. Please choose another</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  hiremind.app/portfolio/{portfolio.username || 'your-username'}
                </p>
              </div>
              
              <Input
                label="Display Name"
                value={portfolio.displayName}
                onChange={(e) => {
                  setPortfolio({...portfolio, displayName: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="Your full name"
                className="mt-4"
              />
              
              <Input
                label="Professional Title"
                value={portfolio.title}
                onChange={(e) => {
                  setPortfolio({...portfolio, title: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="e.g., Senior Frontend Developer"
                className="mt-4"
              />
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Bio / About Me</label>
                  {isPremium && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={generateBioWithAI}
                      isLoading={generatingBio}
                    >
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      Generate with AI
                    </Button>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={portfolio.bio}
                  onChange={(e) => {
                    setPortfolio({...portfolio, bio: e.target.value});
                    setHasChanges(true);
                  }}
                  placeholder="Tell employers about yourself, your experience, and what you're passionate about..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Avatar Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {portfolio.avatar ? (
                      <img src={portfolio.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={(e) => handleImageUpload('avatar', e.target.files[0])}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" isLoading={uploadingImage}>
                        <PhotoIcon className="h-4 w-4 mr-1" />
                        Upload Avatar
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {portfolio.coverImage ? (
                      <img src={portfolio.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={(e) => handleImageUpload('coverImage', e.target.files[0])}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" isLoading={uploadingImage}>
                        <PhotoIcon className="h-4 w-4 mr-1" />
                        Upload Cover
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 1200x400px</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
            </CardHeader>
            <CardBody>
              <Input
                label="GitHub"
                value={portfolio.github}
                onChange={(e) => {
                  setPortfolio({...portfolio, github: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="https://github.com/username"
              />
              <Input
                label="LinkedIn"
                value={portfolio.linkedin}
                onChange={(e) => {
                  setPortfolio({...portfolio, linkedin: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="https://linkedin.com/in/username"
                className="mt-4"
              />
              <Input
                label="Twitter/X"
                value={portfolio.twitter}
                onChange={(e) => {
                  setPortfolio({...portfolio, twitter: e.target.value});
                  setHasChanges(true);
                }}
                placeholder="https://twitter.com/username"
                className="mt-4"
              />
            </CardBody>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <p className="text-sm text-gray-600 mt-1">Showcase your best work</p>
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingProject(null);
                  setNewProject({ title: '', description: '', link: '', technologies: '', image: '' });
                  setShowProjectModal(true);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Project
              </Button>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {portfolio.projects.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No projects added yet</p>
                    <p className="text-sm">Click "Add Project" to showcase your work</p>
                  </div>
                ) : (
                  portfolio.projects.map((project, index) => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <button 
                              className="cursor-grab text-gray-400"
                              onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                              draggable
                            >
                              <Bars3Icon className="h-4 w-4" />
                            </button>
                            <h4 className="font-semibold text-gray-900">{project.title}</h4>
                          </div>
                          {project.image && (
                            <img src={project.image} alt={project.title} className="w-full h-32 object-cover rounded-lg mt-2" />
                          )}
                          <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                          {project.technologies && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.split(',').map((tech, i) => (
                                <span key={i} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          {project.link && (
                            <a 
                              href={project.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:underline mt-2 inline-block"
                            >
                              View Project →
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => moveProject(index, 'up')}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={index === 0}
                          >
                            <ArrowUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveProject(index, 'down')}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={index === portfolio.projects.length - 1}
                          >
                            <ArrowDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setNewProject({
                                title: project.title,
                                description: project.description,
                                link: project.link || '',
                                technologies: project.technologies || '',
                                image: project.image || ''
                              });
                              setShowProjectModal(true);
                            }}
                            className="text-gray-400 hover:text-primary-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeProject(project.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Preview Side */}
        <div className="lg:sticky lg:top-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              <p className="text-sm text-gray-600 mt-1">How employers will see your portfolio</p>
              <Badge variant="info" className="mt-2">Theme: {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}</Badge>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                    {portfolio.avatar ? (
                      <img src={portfolio.avatar} alt={portfolio.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {(portfolio.displayName?.[0] || portfolio.username?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-3">
                    {portfolio.displayName || portfolio.username || 'Your Name'}
                  </h2>
                  {portfolio.title && (
                    <p className="text-gray-600">{portfolio.title}</p>
                  )}
                  <div className="flex gap-3 justify-center mt-3">
                    {portfolio.github && (
                      <a href={portfolio.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm">
                        GitHub
                      </a>
                    )}
                    {portfolio.linkedin && (
                      <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm">
                        LinkedIn
                      </a>
                    )}
                    {portfolio.twitter && (
                      <a href={portfolio.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 text-sm">
                        Twitter
                      </a>
                    )}
                  </div>
                </div>

                {portfolio.coverImage && (
                  <div className="rounded-lg overflow-hidden">
                    <img src={portfolio.coverImage} alt="Cover" className="w-full h-32 object-cover" />
                  </div>
                )}

                {portfolio.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-sm text-gray-600">{portfolio.bio}</p>
                  </div>
                )}

                {portfolio.projects.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Projects</h3>
                    <div className="space-y-3">
                      {portfolio.projects.slice(0, 3).map(project => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-3">
                          {project.image && (
                            <img src={project.image} alt={project.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                          )}
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{project.description.substring(0, 100)}...</p>
                          {project.technologies && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.split(',').slice(0, 3).map((tech, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {portfolio.projects.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        +{portfolio.projects.length - 3} more projects
                      </p>
                    )}
                  </div>
                )}

                {!portfolio.bio && portfolio.projects.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <UserIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Add your info to see preview</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                  setNewProject({ title: '', description: '', link: '', technologies: '', image: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Project Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {newProject.image ? (
                      <img src={newProject.image} alt="Project" className="w-full h-full object-cover" />
                    ) : (
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={(e) => handleProjectImageUpload(e.target.files[0])}
                      className="hidden"
                      id="project-image-upload"
                    />
                    <label htmlFor="project-image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" isLoading={uploadingImage}>
                        <PhotoIcon className="h-4 w-4 mr-1" />
                        Upload Image
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP up to 5MB</p>
                  </div>
                </div>
              </div>

              <Input
                label="Project Title *"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                placeholder="E-Commerce Website"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your project, your role, and the impact..."
                />
              </div>
              
              <Input
                label="Technologies Used"
                value={newProject.technologies}
                onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                placeholder="React, Node.js, MongoDB (comma separated)"
              />
              
              <Input
                label="Project Link (Optional)"
                value={newProject.link}
                onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                placeholder="https://github.com/username/project"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <Button onClick={addProject}>
                {editingProject ? 'Update Project' : 'Add Project'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                  setNewProject({ title: '', description: '', link: '', technologies: '', image: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilder;