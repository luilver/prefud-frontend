import re

with open("src/components/UserProfile.tsx", "r") as f:
    content = f.read()

# Find the start of the Tabs section
tabs_start_match = re.search(r'<Tabs defaultValue="calories"[^>]*>', content)
if not tabs_start_match:
    print("Could not find Tabs start")
    exit(1)

tabs_start_idx = tabs_start_match.start()
tabs_start_str = tabs_start_match.group(0)

# Extract TabsList
tabs_list_start = content.find('<TabsList', tabs_start_idx)
tabs_list_end = content.find('</TabsList>', tabs_list_start) + len('</TabsList>')
tabs_list_str = content[tabs_list_start:tabs_list_end]

# Function to extract a TabsContent block safely
def extract_tabs_content(value):
    start_tag = f'<TabsContent value="{value}">'
    start_idx = content.find(start_tag, tabs_start_idx)
    if start_idx == -1: return "", 0, 0
    
    end_tag = '</TabsContent>'
    end_idx = content.find(end_tag, start_idx) + len(end_tag)
    return content[start_idx:end_idx], start_idx, end_idx

calories_full, c_start, c_end = extract_tabs_content("calories")
environmental_full, e_start, e_end = extract_tabs_content("environmental")
subscription_full, s_start, s_end = extract_tabs_content("subscription")

# Extract the inner content of each TabsContent
calories_inner = calories_full[len('<TabsContent value="calories">'): -len('</TabsContent>')].strip()
environmental_inner = environmental_full[len('<TabsContent value="environmental">'): -len('</TabsContent>')].strip()
subscription_inner = subscription_full[len('<TabsContent value="subscription">'): -len('</TabsContent>')].strip()

tabs_end = content.find('</Tabs>', s_end) + len('</Tabs>')
if tabs_end == -1 + len('</Tabs>'):
    print("Could not find Tabs end")
    exit(1)

new_tabs_block = f"""      {{/* Mobile view with tabs */}}
      <div className="lg:hidden">
        {tabs_start_str}
{tabs_list_str}
          <TabsContent value="calories">
            {calories_inner}
          </TabsContent>
          <TabsContent value="environmental">
            {environmental_inner}
          </TabsContent>
          <TabsContent value="subscription">
            {subscription_inner}
          </TabsContent>
        </Tabs>
      </div>

      {{/* Desktop view side-by-side */}}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
        <div className="h-full">
          {calories_inner.replace('<Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">', '<Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-full">')}
        </div>
        <div className="h-full">
          {environmental_inner.replace('<Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">', '<Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-full">')}
        </div>
        <div className="h-full">
          {subscription_inner.replace('<Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">', '<Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-full flex flex-col">')}
        </div>
      </div>"""

new_content = content[:tabs_start_idx] + new_tabs_block + content[tabs_end:]

with open("src/components/UserProfile.tsx", "w") as f:
    f.write(new_content)

print("Refactored layout successfully.")
