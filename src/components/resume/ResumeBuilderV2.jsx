import React, { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PlusIcon, TrashIcon, XMarkIcon, BriefcaseIcon, SparklesIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ModernTemplate from './ModernTemplate';
import { useAI } from '../../context/AIContext';

const ResumeBuilderV2 = ({ initialData, onSave, onCancel }) => {
  const { optimizeResumeText, isProcessing } = useAI();
  const [activeSection, setActiveSection] = useState('personal');
  const [optimizing, setOptimizing] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [showSections, setShowSections] = useState(true);
  
  const [formData, setFormData] = useState(initialData || {
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    linkedin: '',
    title: '',
    profileSummary: '',
    workExperience: [],
    projects: [],
    skills: [],
    certifications: [],
    education: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // Section order for navigation
  const sectionOrder = [
    { id: 'personal', name: 'Personal Information', icon: '👤' },
    { id: 'summary', name: 'Professional Summary', icon: '📝' },
    { id: 'experience', name: 'Work Experience', icon: '💼' },
    { id: 'projects', name: 'Projects', icon: '🚀' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'certifications', name: 'Certifications', icon: '🏆' }
  ];

  const currentIndex = sectionOrder.findIndex(s => s.id === activeSection);
  const nextSection = currentIndex < sectionOrder.length - 1 ? sectionOrder[currentIndex + 1] : null;
  const prevSection = currentIndex > 0 ? sectionOrder[currentIndex - 1] : null;

  // Check which sections have data
  const getSectionStatus = () => {
    const status = {};
    status.personal = !!(formData.firstName && formData.lastName && formData.email);
    status.summary = !!formData.profileSummary;
    status.experience = formData.workExperience.length > 0;
    status.projects = formData.projects.length > 0;
    status.skills = formData.skills.length > 0;
    status.education = formData.education.length > 0;
    status.certifications = formData.certifications.length > 0;
    return status;
  };

  const sectionStatus = getSectionStatus();

  const handleNext = () => {
    if (nextSection) {
      setActiveSection(nextSection.id);
    }
  };

  const handlePrevious = () => {
    if (prevSection) {
      setActiveSection(prevSection.id);
    }
  };

  const hasData = () => {
    return formData.firstName || formData.lastName || formData.email || 
           formData.profileSummary || formData.workExperience.length > 0 ||
           formData.skills.length > 0;
  };

  const calculateATSScore = () => {
    if (!hasData()) {
      setAtsScore(null);
      return;
    }
    
    let score = 60;
    
    if (formData.firstName && formData.lastName) score += 5;
    if (formData.email) score += 5;
    if (formData.phone) score += 5;
    if (formData.profileSummary && formData.profileSummary.length > 100) score += 10;
    else if (formData.profileSummary && formData.profileSummary.length > 0) score += 5;
    if (formData.workExperience.length > 0) score += 15;
    if (formData.skills.length >= 5) score += 10;
    else if (formData.skills.length > 0) score += 5;
    if (formData.projects.length > 0) score += 5;
    if (formData.education.length > 0) score += 5;
    if (formData.certifications.length > 0) score += 5;
    
    setAtsScore(Math.min(100, score));
  };

  useEffect(() => {
    calculateATSScore();
  }, [formData]);

  const sections = [
    { id: 'personal', name: 'Personal Information', icon: '👤', desc: 'Name, contact, title' },
    { id: 'summary', name: 'Professional Summary', icon: '📝', desc: 'Career overview' },
    { id: 'experience', name: 'Work Experience', icon: '💼', desc: 'Job history' },
    { id: 'projects', name: 'Projects', icon: '🚀', desc: 'Portfolio' },
    { id: 'skills', name: 'Skills', icon: '⚡', desc: 'Technical abilities' },
    { id: 'education', name: 'Education', icon: '🎓', desc: 'Academic background' },
    { id: 'certifications', name: 'Certifications', icon: '🏆', desc: 'Credentials' }
  ];

  const getSectionTitle = () => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.name : 'Edit Resume';
  };

  // Work Experience handlers
  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, {
        id: Date.now(),
        company: '',
        position: '',
        duration: '',
        description: ''
      }]
    });
  };

  const updateWorkExperience = (id, field, value) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeWorkExperience = (id) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter(exp => exp.id !== id)
    });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, {
        id: Date.now(),
        title: '',
        description: '',
        technologies: '',
        link: ''
      }]
    });
  };

  const updateProject = (id, field, value) => {
    setFormData({
      ...formData,
      projects: formData.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    });
  };

  const removeProject = (id) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(proj => proj.id !== id)
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        year: '',
        description: ''
      }]
    });
  };

  const updateEducation = (id, field, value) => {
    setFormData({
      ...formData,
      education: formData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id) => {
    setFormData({
      ...formData,
      education: formData.education.filter(edu => edu.id !== id)
    });
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, {
          id: Date.now(),
          name: newCertification.trim(),
          issuer: '',
          date: ''
        }]
      });
      setNewCertification('');
    }
  };

  const updateCertification = (id, field, value) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    });
  };

  const removeCertification = (id) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(cert => cert.id !== id)
    });
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in First Name, Last Name, and Email');
      return;
    }
    onSave(formData, atsScore || 0);
  };

  // If showing sections menu
  if (showSections) {
    return (
      <div className="flex gap-6">
        {/* Left Column - Sections Menu */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">📄</div>
              <h2 className="text-2xl font-bold text-gray-900">Build Your Resume</h2>
              <p className="text-gray-500 mt-2">Choose a section to start building</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setShowSections(false);
                  }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-all text-left border border-transparent hover:border-primary-200"
                >
                  <div className="text-3xl">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{section.name}</h3>
                    <p className="text-sm text-gray-500">{section.desc}</p>
                  </div>
                  {sectionStatus[section.id] && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                <span className="text-sm font-medium text-primary-600">
                  {Object.values(sectionStatus).filter(Boolean).length}/{Object.keys(sectionStatus).length} sections completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 rounded-full h-2 transition-all"
                  style={{ width: `${(Object.values(sectionStatus).filter(Boolean).length / Object.keys(sectionStatus).length) * 100}%` }}
                />
              </div>
            </div>

            {atsScore !== null && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">ATS Score</span>
                  <span className={`text-sm font-bold ${
                    atsScore >= 80 ? 'text-green-600' : atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {atsScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`rounded-full h-2 transition-all ${
                      atsScore >= 80 ? 'bg-green-600' : atsScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {atsScore >= 80 ? 'Excellent! Your resume is ATS-friendly.' :
                   atsScore >= 60 ? 'Good resume, keep adding more details.' :
                   'Add more sections to improve your score.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="w-[45%] flex-shrink-0">
          <div className="sticky top-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-700">Live Preview</h3>
                  <p className="text-xs text-gray-400">See changes in real-time</p>
                </div>
                <Badge variant="info" className="text-xs">Real-time</Badge>
              </div>
              <div className="p-5 max-h-[80vh] overflow-y-auto bg-gray-50">
                <ModernTemplate data={formData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Showing edit form for selected section
  return (
    <div className="flex gap-6">
      {/* Left Column - Editor */}
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Header with Back Button and Progress */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowSections(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Sections</span>
              </button>
              <Badge variant="info" className="text-xs">
                Step {currentIndex + 1} of {sectionOrder.length}
              </Badge>
            </div>
            
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{getSectionTitle()}</span>
                <span>{Math.round(((currentIndex + 1) / sectionOrder.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary-600 rounded-full h-1.5 transition-all"
                  style={{ width: `${((currentIndex + 1) / sectionOrder.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getSectionTitle()}</h2>
              <p className="text-sm text-gray-500">Fill in your details below</p>
            </div>
          </div>

          <div className="p-6">
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="(Optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="+63 912 345 6789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address / Location
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="City, Province, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
              </div>
            )}

            {/* Profile Summary Section */}
            {activeSection === 'summary' && (
              <div className="space-y-5">
                <textarea
                  value={formData.profileSummary}
                  onChange={(e) => setFormData({...formData, profileSummary: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Write 2-3 sentences about your experience, key achievements, and career goals..."
                />
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  💡 Tip: Include years of experience, key skills, and notable achievements.
                </div>
              </div>
            )}

            {/* Work Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-5">
                <Button onClick={addWorkExperience} className="mb-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Work Experience
                </Button>
                {formData.workExperience.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No work experience added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click the button above to add</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.workExperience.map((exp) => (
                      <div key={exp.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200 relative">
                        <button onClick={() => removeWorkExperience(exp.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Google, Microsoft"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position / Title</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => updateWorkExperience(exp.id, 'duration', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Jan 2020 - Present"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={exp.description}
                              onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects Section */}
            {activeSection === 'projects' && (
              <div className="space-y-5">
                <Button onClick={addProject} className="mb-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
                {formData.projects.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-5xl mb-3">🚀</div>
                    <p className="text-gray-500">No projects added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click the button above to add</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.projects.map((project) => (
                      <div key={project.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200 relative">
                        <button onClick={() => removeProject(project.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="E-Commerce Platform"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Describe what you built, your role, and the impact..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                            <input
                              type="text"
                              value={project.technologies}
                              onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="React, Node.js, MongoDB"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                            <input
                              type="text"
                              value={project.link}
                              onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="https://github.com/username/project"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill (e.g., JavaScript, React, Python)"
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button onClick={addSkill} className="px-6">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 p-5 bg-gray-50 rounded-lg min-h-[120px]">
                  {formData.skills.length === 0 ? (
                    <p className="text-gray-400 text-center w-full py-4">No skills added yet. Start typing above!</p>
                  ) : (
                    formData.skills.map((skill) => (
                      <div key={skill} className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Education Section */}
            {activeSection === 'education' && (
              <div className="space-y-5">
                <Button onClick={addEducation} className="mb-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
                {formData.education.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-5xl mb-3">🎓</div>
                    <p className="text-gray-500">No education added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click the button above to add</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.education.map((edu) => (
                      <div key={edu.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200 relative">
                        <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Degree / Course</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Institution / School</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="University Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year / Duration</label>
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="2020 - 2024"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certifications Section */}
            {activeSection === 'certifications' && (
              <div className="space-y-5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification (e.g., AWS Certified Developer)"
                    className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button onClick={addCertification} className="px-6">Add</Button>
                </div>
                {formData.certifications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-5xl mb-3">🏆</div>
                    <p className="text-gray-500">No certifications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.certifications.map((cert) => (
                      <div key={cert.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200 relative">
                        <button onClick={() => removeCertification(cert.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="AWS Certified Developer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="Amazon Web Services"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Earned</label>
                            <input
                              type="text"
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
                              placeholder="2024"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons - Previous and Next */}
            <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
              <div>
                {prevSection && (
                  <Button variant="secondary" onClick={handlePrevious}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Previous: {prevSection.name}
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                {nextSection ? (
                  <Button onClick={handleNext}>
                    Next: {nextSection.name}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Save Resume
                  </Button>
                )}
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Live Preview */}
      <div className="w-[45%] flex-shrink-0">
        <div className="sticky top-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">Live Preview</h3>
                <p className="text-xs text-gray-400">See changes in real-time</p>
              </div>
              <Badge variant="info" className="text-xs">Real-time</Badge>
            </div>
            <div className="p-5 max-h-[80vh] overflow-y-auto bg-gray-50">
              <ModernTemplate data={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderV2;