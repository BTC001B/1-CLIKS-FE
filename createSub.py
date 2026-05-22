import re

source_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE-BUS/src/pages/BusinessSubscription.jsx'
target_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE/src/pages/Subscription.jsx'

with open(source_path, 'r') as f:
    content = f.read()

# 1. Change component name
content = content.replace('BusinessSubscription', 'Subscription')

# 2. Change default activeCategory
content = content.replace("const [activeCategory, setActiveCategory] = useState('business');", "const [activeCategory, setActiveCategory] = useState('ca');")
content = content.replace("const [selectedTier, setSelectedTier] = useState('Growth Plan');", "const [selectedTier, setSelectedTier] = useState('FIN-PRO Standard');")

# 3. Remove 'business' tab array elements
allTiers_pattern = r"business: \[\s*\{.*?\}\s*\],\s*ca:"
content = re.sub(allTiers_pattern, "ca:", content, flags=re.DOTALL)

# 4. Remove 'business' tab button from the UI
tabs_pattern = r"\{ id: 'business', label: 'Business', icon: ShieldCheck, color: '#1B6B3A' \},\s*"
content = re.sub(tabs_pattern, "", content)

with open(target_path, 'w') as f:
    f.write(content)

