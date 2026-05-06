import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ResumeBuilderV2 from '../../components/resume/ResumeBuilderV2';
import { PlusIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ResumeBuilder = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    linkedin: '',
    
    // Profile Summary
    profileSummary: '',
    
    // Work Experience
    workExperience: [],
    
    // Projects
    projects: [],
    
    // Skills
    skills: [],
    
    // Certifications
    certifications: [],
    
    // Education
    education: []
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  
  // Work Experience handlers
  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        {
          id: Date.now(),
          company: '',
          position: '',
          duration: '',
          description: ''
        }
      ]
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
  
  // Projects handlers
  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        {
          id: Date.now(),
          name: '',
          description: '',
          technologies: '',
          link: ''
        }
      ]
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
  
  // Skills handlers
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
  
  // Certifications handlers
  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData({
        ...formData,
        certifications: [
          ...formData.certifications,
          {
            id: Date.now(),
            name: newCertification.trim(),
            issuer: '',
            date: ''
          }
        ]
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
  
  // Education handlers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          id: Date.now(),
          degree: '',
          institution: '',
          year: '',
          description: ''
        }
      ]
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
  
  const handleSubmit = () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }
    
    // Generate markdown content from structured data
    const markdown = generateMarkdown(formData);
    onSave(markdown, formData);
  };
  
  const generateMarkdown = (data) => {
    let markdown = '';
    
    // Contact info header
    markdown += `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}\n`;
    markdown += `${data.phone} | ${data.email} | ${data.address}\n`;
    if (data.linkedin) markdown += `${data.linkedin}\n`;
    markdown += '\n---\n\n';
    
    // Profile Summary
    if (data.profileSummary) {
      markdown += `# Profile Summary\n\n${data.profileSummary}\n\n`;
    }
    
    // Work Experience
    if (data.workExperience.length > 0) {
      markdown += `# Work Experience\n\n`;
      data.workExperience.forEach(exp => {
        markdown += `## ${exp.position} - ${exp.company}\n`;
        if (exp.duration) markdown += `*${exp.duration}*\n`;
        if (exp.description) markdown += `${exp.description}\n`;
        markdown += `\n`;
      });
    }
    
    // Projects
    if (data.projects.length > 0) {
      markdown += `# Projects\n\n`;
      data.projects.forEach(proj => {
        markdown += `## ${proj.name}\n`;
        if (proj.description) markdown += `${proj.description}\n`;
        if (proj.technologies) markdown += `**Technologies:** ${proj.technologies}\n`;
        if (proj.link) markdown += `**Link:** ${proj.link}\n`;
        markdown += `\n`;
      });
    }
    
    // Skills
    if (data.skills.length > 0) {
      markdown += `# Skills\n\n`;
      markdown += data.skills.join(', ') + '\n\n';
    }
    
    // Certifications
    if (data.certifications.length > 0) {
      markdown += `# Certifications\n\n`;
      data.certifications.forEach(cert => {
        markdown += `- ${cert.name}`;
        if (cert.issuer) markdown += ` - ${cert.issuer}`;
        if (cert.date) markdown += ` (${cert.date})`;
        markdown += `\n`;
      });
      markdown += `\n`;
    }
    
    // Education
    if (data.education.length > 0) {
      markdown += `# Education\n\n`;
      data.education.forEach(edu => {
        markdown += `**${edu.degree}** - ${edu.institution}`;
        if (edu.year) markdown += ` (${edu.year})`;
        markdown += `\n`;
        if (edu.description) markdown += `${edu.description}\n`;
        markdown += `\n`;
      });
    }
    
    return markdown;
  };
  
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p className="text-sm text-gray-600 mt-1">Your basic contact details</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="First Name *"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Jermaine"
            />
            <Input
              label="Middle Name"
              value={formData.middleName}
              onChange={(e) => setFormData({...formData, middleName: e.target.value})}
              placeholder="(Optional)"
            />
            <Input
              label="Last Name *"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Centeno"
            />
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+63 991 797 3665"
            />
            <Input
              label="Email *"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="jermaine.centeno30@gmail.com"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="City of Malolos, Bulacan"
            />
            <Input
              label="LinkedIn (Optional)"
              value={formData.linkedin}
              onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
              placeholder="linkedin.com/in/username"
              className="md:col-span-2"
            />
          </div>
        </CardBody>
      </Card>
      
      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Profile Summary</h3>
          <p className="text-sm text-gray-600 mt-1">A brief overview of your professional background</p>
        </CardHeader>
        <CardBody>
          <textarea
            value={formData.profileSummary}
            onChange={(e) => setFormData({...formData, profileSummary: e.target.value})}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Information Technology graduate with strong foundation in web development..."
          />
        </CardBody>
      </Card>
      
      {/* Work Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Work Experience / OJT</h3>
            <p className="text-sm text-gray-600 mt-1">Your professional experience</p>
          </div>
          <Button onClick={addWorkExperience} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {formData.workExperience.map((exp) => (
              <div key={exp.id} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeWorkExperience(exp.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Company"
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                    placeholder="NLEX Corporation"
                  />
                  <Input
                    label="Position"
                    value={exp.position}
                    onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                    placeholder="OJT Intern"
                  />
                  <Input
                    label="Duration"
                    value={exp.duration}
                    onChange={(e) => updateWorkExperience(exp.id, 'duration', e.target.value)}
                    placeholder="June 2024 - August 2024"
                    className="md:col-span-2"
                  />
                  <textarea
                    label="Description"
                    value={exp.description}
                    onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                    rows={3}
                    className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Resolved customer issues by analyzing transaction logs..."
                  />
                </div>
              </div>
            ))}
            {formData.workExperience.length === 0 && (
              <p className="text-gray-500 text-center py-4">No work experience added yet. Click "Add Experience" to start.</p>
            )}
          </div>
        </CardBody>
      </Card>
      
      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <p className="text-sm text-gray-600 mt-1">Your personal and academic projects</p>
          </div>
          <Button onClick={addProject} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Project
          </Button>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {formData.projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeProject(proj.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <div className="space-y-3">
                  <Input
                    label="Project Name"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    placeholder="VeRentify"
                  />
                  <textarea
                    label="Description"
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Developed a mobile-based apartment rental platform..."
                  />
                  <Input
                    label="Technologies Used"
                    value={proj.technologies}
                    onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    placeholder="Flutter, Firebase, Dart"
                  />
                  <Input
                    label="Project Link (Optional)"
                    value={proj.link}
                    onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                    placeholder="https://github.com/username/project"
                  />
                </div>
              </div>
            ))}
            {formData.projects.length === 0 && (
              <p className="text-gray-500 text-center py-4">No projects added yet. Click "Add Project" to start.</p>
            )}
          </div>
        </CardBody>
      </Card>
      
      {/* Skills */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          <p className="text-sm text-gray-600 mt-1">Your technical and soft skills</p>
        </CardHeader>
        <CardBody>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g., JavaScript, React)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button onClick={addSkill} size="sm">Add Skill</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <div key={skill} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-600">
                  ×
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      
      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Certifications & Recognition</h3>
            <p className="text-sm text-gray-600 mt-1">Your professional certifications</p>
          </div>
          <Button onClick={addCertification} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Certification
          </Button>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Quick add certification name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {formData.certifications.map((cert) => (
              <div key={cert.id} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeCertification(cert.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label="Certification Name"
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                    placeholder="Java Fundamentals"
                    className="md:col-span-2"
                  />
                  <Input
                    label="Issuer"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                    placeholder="Oracle"
                  />
                  <Input
                    label="Date Earned"
                    value={cert.date}
                    onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                    placeholder="2024"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      
      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            <p className="text-sm text-gray-600 mt-1">Your educational background</p>
          </div>
          <Button onClick={addEducation} size="sm">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Education
          </Button>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {formData.education.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Information Technology"
                    className="md:col-span-2"
                  />
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="STI College Malolos"
                  />
                  <Input
                    label="Year"
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    placeholder="2022-2026"
                  />
                  <textarea
                    label="Description (Optional)"
                    value={edu.description}
                    onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                    rows={2}
                    className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Relevant coursework, achievements, etc."
                  />
                </div>
              </div>
            ))}
            {formData.education.length === 0 && (
              <p className="text-gray-500 text-center py-4">No education added yet. Click "Add Education" to start.</p>
            )}
          </div>
        </CardBody>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white py-4 border-t border-gray-200">
        <Button onClick={handleSubmit}>
          Save Resume
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ResumeBuilder;