import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card, { CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  BellIcon, 
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, userData, isPremium } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationReminders: true,
    weeklyDigest: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'subscription', name: 'Subscription', icon: CreditCardIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '₱0',
      period: 'forever',
      features: [
        'Up to 3 resume versions',
        'Track up to 20 job applications',
        'Basic portfolio page',
        'Basic dashboard',
        'Email support'
      ],
      recommended: false,
      badge: 'Current Plan',
      showBadge: !isPremium
    },
    {
      name: 'Premium',
      price: '₱99',
      period: 'per month',
      features: [
        'Unlimited resume versions',
        'Unlimited job tracking',
        'Resume performance analytics ⭐',
        'AI resume feedback',
        'Advanced dashboard insights',
        'Multiple resume templates',
        'Smart skill gap analyzer',
        'Priority support',
        'Monthly career reports'
      ],
      recommended: true,
      badge: 'Most Popular',
      showBadge: true
    },
    {
      name: 'Annual',
      price: '₱999',
      period: 'per year',
      features: [
        'All Premium features',
        'Save ₱189 annually',
        'Early access to new features',
        '1-on-1 career coaching session',
        'PDF export'
      ],
      recommended: false,
      badge: 'Best Value',
      showBadge: true
    }
  ];

  const handleUpgrade = (planName) => {
    if (planName === 'Free') {
      toast.info('You are already on the Free plan');
      return;
    }
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = () => {
    setShowUpgradeModal(false);
    toast.success('Redirecting to payment gateway...');
    // Payment integration will go here
  };

  const handleSaveProfile = () => {
    toast.success('Profile settings saved!');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!');
  };

  const handleChangePassword = () => {
    toast.success('Password changed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-xl font-bold text-gray-900">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </p>
              {!isPremium && (
                <p className="text-xs text-gray-600 mt-1">
                  Upgrade to unlock all premium features
                </p>
              )}
            </div>
          </div>
          {!isPremium && (
            <Button onClick={() => setActiveTab('subscription')}>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          )}
          {isPremium && (
            <Badge variant="premium" className="px-3 py-1">
              Active Subscription
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-4 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-600 mt-1">Update your personal information</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.displayName || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Software Engineer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Current company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your career journey..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-600 mt-1">Manage how you receive updates</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive email updates about your applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Application Reminders</h3>
                    <p className="text-sm text-gray-600">Get reminders for follow-ups and interviews</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.applicationReminders}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        applicationReminders: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Weekly Career Digest</h3>
                    <p className="text-sm text-gray-600">Receive weekly insights and progress reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyDigest}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        weeklyDigest: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Subscription Settings - Pricing Plans */}
      {activeTab === 'subscription' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Current Plan Summary */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </h3>
                  {isPremium ? (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Active - Next billing date: {new Date().setMonth(new Date().getMonth() + 1)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      Free plan with basic features. Upgrade to unlock premium benefits.
                    </p>
                  )}
                </div>
                {isPremium ? (
                  <Badge variant="premium">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Premium Member
                  </Badge>
                ) : (
                  <Button onClick={() => setShowUpgradeModal(true)}>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${plan.recommended ? 'border-2 border-primary-500 shadow-lg' : ''}`}>
                  {plan.showBadge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant={plan.recommended ? 'premium' : 'info'} className="px-3 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  <CardBody className="flex flex-col h-full">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      {plan.name === 'Annual' && (
                        <p className="text-xs text-green-600">Save ₱189 compared to monthly</p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      variant={plan.recommended ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={!isPremium && plan.name === 'Free'}
                    >
                      {isPremium && plan.name === 'Premium'
                        ? 'Current Plan'
                        : !isPremium && plan.name === 'Free'
                        ? 'Current Plan'
                        : `Choose ${plan.name}`}
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Payment Methods */}
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your payment options</p>
            </CardHeader>
            <CardBody>
              {isPremium ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Visa •••• 4242</p>
                      <p className="text-xs text-gray-500">Expires 12/2026</p>
                    </div>
                    <Badge variant="success">Default</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No payment methods added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add a payment method to upgrade to Premium</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowUpgradeModal(true)}>
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Billing History (Premium only) */}
          {isPremium && (
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
                <p className="text-sm text-gray-600 mt-1">Your payment history</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Premium Plan - Monthly</p>
                      <p className="text-xs text-gray-500">April 1, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₱99.00</p>
                      <Badge variant="success">Paid</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Premium Plan - Monthly</p>
                      <p className="text-xs text-gray-500">March 1, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₱99.00</p>
                      <Badge variant="success">Paid</Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </motion.div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword}>Update Password</Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-600">Protect your account with 2FA</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended for enhanced security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <SparklesIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Upgrade to Premium</h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg mb-4">
                <p className="text-3xl font-bold text-primary-600 mb-2">₱99<span className="text-sm text-gray-600">/month</span></p>
                <p className="text-sm text-gray-700">Get unlimited access to all premium features</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited resumes and job tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  AI-powered resume feedback
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Resume performance analytics
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  Multiple professional templates
                </li>
              </ul>
              <Button onClick={handleConfirmUpgrade} className="w-full">
                Upgrade Now - ₱99/month
              </Button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;