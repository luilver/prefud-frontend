import re

with open("src/components/UserProfile.tsx", "r") as f:
    content = f.read()

# 1. Add missing imports
imports_to_add = """
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
"""
content = re.sub(r'(import {[^}]+} from "@/components/ui/accordion";)', r'\1\n' + imports_to_add, content)
content = re.sub(r'Palette,(\s+)} from "lucide-react";', r'Palette,\n  Settings as SettingsIcon,\n} from "lucide-react";', content)

# 2. Modify Header to include Configuration button
header_old = """
        {/* Header */}
        <div className="bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {t("profile.title") || "My Profile"}
              </h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                {t("profile.description") || "Manage your personal information and preferences"}
              </p>
            </div>
          </div>
        </div>
"""
header_new = """
        {/* Header */}
        <div className="bg-primary/40 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-primary/20 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {t("profile.title") || "My Profile"}
              </h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 mt-0.5">
                {t("profile.description") || "Manage your personal information and preferences"}
              </p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <SettingsSection />
                <PasswordUpdate />
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-red-600">
                        {t("profile.deleteAccount.section") || "Danger Zone"}
                      </h3>
                      <p className="text-xs text-red-500 mt-0.5">
                        {t("profile.deleteAccount.sectionDesc") || "Permanently delete your account and all data"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 bg-white"
                    >
                      {t("profile.deleteAccount.button") || "Delete Account"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
"""
content = content.replace(header_old, header_new)

# 3. Replace Profile Information Accordion with standard Card
profile_info_old = """
        {/* Profile Information Accordion */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <Accordion type="single" collapsible>
              <AccordionItem value="profile-info" className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="text-lg sm:text-xl font-semibold">
                      {t("profile.personalInfo") || "Profile Information"}
                    </span>
                  </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="border-primary text-primary hover:bg-primary/5 ml-4"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t("profile.edit") || "Edit"}
                  </Button>
                )}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
"""
profile_info_new = """
        {/* Profile Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-lg sm:text-xl font-semibold">
                  {t("profile.personalInfo") || "Profile Information"}
                </span>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t("profile.edit") || "Edit"}
                </Button>
              )}
            </div>
"""
content = content.replace(profile_info_old, profile_info_new)

# Close the profile info card properly by removing AccordionContent/AccordionItem/Accordion
profile_info_end_old = """
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

        {/* Subscription Information Accordion */}
"""
profile_info_end_new = """
        </CardContent>
      </Card>

      {/* Tabs Section for tracking and subscription */}
      <Tabs defaultValue="calories" className="w-full space-y-4">
        <TabsList className="w-full grid grid-cols-3 bg-white/95 shadow-md">
          <TabsTrigger value="calories" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Flame className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Calories</span>
          </TabsTrigger>
          <TabsTrigger value="environmental" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Leaf className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Impact</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Trophy className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
        </TabsList>
"""
content = content.replace(profile_info_end_old, profile_info_end_new)


# Now extract the inner content of Calories, Environmental, and Subscription

def extract_accordion_content(text, section_name):
    pattern = r'{\/\* ' + section_name + r' Accordion \*\/}.*?<AccordionContent className="px-6 pb-6">(.*?)<\/AccordionContent>.*?<\/Accordion>'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

calories_content = extract_accordion_content(content, "Calorie Tracking")
environmental_content = extract_accordion_content(content, "Environmental Impact")
subscription_content = extract_accordion_content(content, "Subscription Information")
# Because I'm modifying the content linearly, Calorie Tracking might still exist in the un-replaced part of `content`, wait. 
# It's better to read from original backup content to extract! Let me extract from original f.read().

with open("/tmp/UserProfile_backup.tsx", "r") as original_f:
    original_content = original_f.read()
    calories_content = extract_accordion_content(original_content, "Calorie Tracking")
    environmental_content = extract_accordion_content(original_content, "Environmental Impact")
    subscription_content = extract_accordion_content(original_content, "Subscription Information")

# Prepare new tabs content
tabs_new = """
        <TabsContent value="calories">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Flame className="h-5 w-5 text-orange-600" />
                <h3 className="text-xl font-semibold">
                  {t("profile.calorieTracking.title") || "Calorie Tracking"}
                </h3>
              </div>
              """ + calories_content + """
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Leaf className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">
                  {t("profile.environmental.title") || "Environmental Impact"}
                </h3>
              </div>
              """ + environmental_content + """
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">
                    {t("profile.subscription") || "My Subscription"}
                  </h3>
                  <div className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {currentSubscriptionName} Plan
                  </div>
                </div>
                <div className="flex space-x-2">
                  {hasActiveSubscription ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hidden sm:flex"
                    >
                      Cancel Subscription
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => navigate("/pricing")}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    Update Subscription
                  </Button>
                </div>
              </div>
              """ + subscription_content + """
              
              {hasActiveSubscription && (
                <div className="mt-6 sm:hidden">
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
"""

# Now we need to remove the old accordions from the content and insert tabs_new
# Find where the `Tabs Section for tracking and subscription` is and replace everything up to `{/* Check Favorites Button */}`

replace_pattern = r'{\/\* Subscription Information Accordion \*\/}.*?{\/\* Check Favorites Button \*\/}'
content = re.sub(replace_pattern, tabs_new + '\n\n        {/* Check Favorites Button */}', content, flags=re.DOTALL)
# wait, actually the original content had: `{/* Calorie Tracking Accordion */}` and `{/* Environmental Impact Accordion */}`.
# I matched starting with `{/* Subscription Information Accordion */}` which is where I ended `profile_info_end_new`.
# Wait, let me check the order in the original file:
# 1. Profile Info
# 2. Subscription Information Accordion
# 3. Calorie Tracking Accordion
# 4. Environmental Impact Accordion
# 5. Check Favorites Button
# So `replace_pattern = r'{\/\* Subscription Information Accordion \*\/}.*?{\/\* Check Favorites Button \*\/}'` should match from 2 to 5 correctly!

# Remove the old SettingsSection, PasswordUpdate, DeleteAccount from the main render body
# They are now in the Configuration Modal!
remove_pattern = r'{\/\* Settings \(Theme\) Section \*\/}.*?{\/\* Cancel Subscription Modal \*\/}'
content = re.sub(remove_pattern, '{/* Cancel Subscription Modal */}', content, flags=re.DOTALL)

with open("src/components/UserProfile.tsx", "w") as f:
    f.write(content)

