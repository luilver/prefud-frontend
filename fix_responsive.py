import re

with open("src/components/UserProfile.tsx", "r") as f:
    content = f.read()

# 1. Add import
if 'import SubscriptionManager from "./SubscriptionManager";' not in content:
    content = content.replace(
        'import SubscriptionCancelModal from "./SubscriptionCancelModal";',
        'import SubscriptionCancelModal from "./SubscriptionCancelModal";\nimport SubscriptionManager from "./SubscriptionManager";'
    )

# 2. Add state
if 'const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);' not in content:
    content = content.replace(
        'const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);',
        'const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);\n  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);'
    )

# 3. Modify Subscription Header and wrap contents
sub_header_old = """                <div className="flex space-x-2">
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
              <p className="text-sm text-muted-foreground mb-4">
                  {t("profile.subscriptionDesc") || "Your current plan usage and limits"}
                </p>"""

sub_header_new = """                <div className="flex space-x-2">
                  {hasActiveSubscription && !showSubscriptionManager ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hidden sm:flex"
                    >
                      Cancel Subscription
                    </Button>
                  ) : null}
                  {showSubscriptionManager && (
                    <Button
                      size="sm"
                      onClick={() => setShowSubscriptionManager(false)}
                      variant="outline"
                    >
                      Back to Usage
                    </Button>
                  )}
                </div>
              </div>
              
              {showSubscriptionManager ? (
                <div className="mt-6">
                  <SubscriptionManager />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("profile.subscriptionDesc") || "Your current plan usage and limits"}
                  </p>"""

content = content.replace(sub_header_old, sub_header_new)

# 4. Modify Subscription Footer and close wrap
sub_footer_old = """              {hasActiveSubscription && (
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
            </CardContent>"""

sub_footer_new = """              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowSubscriptionManager(true)}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Update Subscription
                </Button>
                {hasActiveSubscription && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 sm:hidden"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </>
          )}
            </CardContent>"""

content = content.replace(sub_footer_old, sub_footer_new)

with open("src/components/UserProfile.tsx", "w") as f:
    f.write(content)

