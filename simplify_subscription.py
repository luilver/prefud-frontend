import re

with open("src/components/UserProfile.tsx", "r") as f:
    content = f.read()

# Remove the state variable
content = re.sub(r'\s*const \[showSubscriptionManager, setShowSubscriptionManager\] = useState\(false\);', '', content)

# Find the start of the Subscription tab content
start_marker = '<TabsContent value="subscription">'
start_idx = content.find(start_marker)

end_marker = '</TabsContent>\n        </Tabs>'
end_idx = content.find(end_marker, start_idx)

# We want to replace the inside of the subscription tab.
# Let's extract everything inside the Card content.
card_content_start = content.find('<CardContent className="p-6">', start_idx) + len('<CardContent className="p-6">')
card_content_end = content.find('</CardContent>', card_content_start)

# We will create a new simplified card content
new_card_content = """
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
                </div>
              </div>
              
              <div className="mt-6">
                <SubscriptionManager />
              </div>
            """

new_content = content[:card_content_start] + new_card_content + content[card_content_end:]

with open("src/components/UserProfile.tsx", "w") as f:
    f.write(new_content)

print("Simplified subscription tab successfully.")
