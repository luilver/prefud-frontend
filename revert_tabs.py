import re

with open("src/components/UserProfile.tsx", "r") as f:
    content = f.read()

# Find the start of the mobile view container
start_marker = '{/* Mobile view with tabs */}'
start_idx = content.find(start_marker)

if start_idx == -1:
    print("Could not find start marker")
    exit(1)

# Find the end of the desktop view
end_marker = '{/* Desktop view side-by-side */}'
end_marker_idx = content.find(end_marker)

if end_marker_idx == -1:
    print("Could not find end marker")
    exit(1)

# we need to find where the desktop view ends. It's a div.
# let's just use regex to extract the <Tabs>...</Tabs> block from the mobile view, and replace the whole section.
tabs_start = content.find('<Tabs', start_idx)
tabs_end = content.find('</Tabs>', tabs_start) + len('</Tabs>')

tabs_block = content[tabs_start:tabs_end]

# Now find where the entire injected block ends.
# The desktop view ends before {/* Check Favorites Button */}
favorites_marker = '{/* Check Favorites Button */}'
favorites_idx = content.find(favorites_marker)

# Replace everything from start_marker to favorites_idx with the tabs_block
new_content = content[:start_idx] + tabs_block + "\n\n        " + content[favorites_idx:]

with open("src/components/UserProfile.tsx", "w") as f:
    f.write(new_content)

print("Reverted tabs refactor successfully.")
