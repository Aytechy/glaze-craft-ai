import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Download, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  
  // Settings state
  const [notifications, setNotifications] = useState({
    newFeatures: true,
    aiUpdates: true,
    tips: false,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    analytics: true,
    crashReports: true,
    personalization: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    fontSize: 'medium',
    messageFontSize: 'medium',
    animations: true,
  });

  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Pottery enthusiast and ceramic artist',
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export is being prepared. You'll receive an email when ready.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings className="h-6 w-6" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={undefined} alt={profile.name} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your pottery journey..."
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-features">New Features</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when we release new features
                      </p>
                    </div>
                    <Switch
                      id="new-features"
                      checked={notifications.newFeatures}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, newFeatures: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-updates">AI Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about AI model improvements
                      </p>
                    </div>
                    <Switch
                      id="ai-updates"
                      checked={notifications.aiUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, aiUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="tips">Tips & Tutorials</Label>
                      <p className="text-sm text-muted-foreground">
                        Helpful pottery tips and tutorials
                      </p>
                    </div>
                    <Switch
                      id="tips"
                      checked={notifications.tips}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, tips: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Promotional content and special offers
                      </p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how GlazeAI looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred color scheme
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['Light', 'Dark', 'System'].map((theme) => (
                        <Button
                          key={theme}
                          variant={appearance.theme === theme.toLowerCase() ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAppearance(prev => ({ ...prev, theme: theme.toLowerCase() }))}
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Font Size</Label>
                      <p className="text-sm text-muted-foreground">
                        Adjust text size for better readability
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['Small', 'Medium', 'Large'].map((size) => (
                        <Button
                          key={size}
                          variant={appearance.fontSize === size.toLowerCase() ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAppearance(prev => ({ ...prev, fontSize: size.toLowerCase() }))}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Message Font Size</Label>
                      <p className="text-sm text-muted-foreground">
                        Adjust AI response and message text size
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['Small', 'Medium', 'Large'].map((size) => (
                        <Button
                          key={size}
                          variant={appearance.messageFontSize === size.toLowerCase() ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAppearance(prev => ({ ...prev, messageFontSize: size.toLowerCase() }))}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations">Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth animations and transitions
                      </p>
                    </div>
                    <Switch
                      id="animations"
                      checked={appearance.animations}
                      onCheckedChange={(checked) =>
                        setAppearance(prev => ({ ...prev, animations: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Control how your data is used and stored
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve GlazeAI by sharing usage data
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={privacy.analytics}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="crash-reports">Crash Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically send crash reports to help fix bugs
                      </p>
                    </div>
                    <Switch
                      id="crash-reports"
                      checked={privacy.crashReports}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, crashReports: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="personalization">Personalization</Label>
                      <p className="text-sm text-muted-foreground">
                        Use your data to provide personalized recommendations
                      </p>
                    </div>
                    <Switch
                      id="personalization"
                      checked={privacy.personalization}
                      onCheckedChange={(checked) =>
                        setPrivacy(prev => ({ ...prev, personalization: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label>Data Management</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download or delete your personal data
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExportData}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};