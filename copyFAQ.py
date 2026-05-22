import os

source_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE-BUS/src/pages/FAQ.jsx'
target_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE/src/pages/FAQ.jsx'

with open(source_path, 'r') as f:
    content = f.read()

# Replace Theme Colors: Blues -> Greens
content = content.replace("linear-gradient(135deg, #3B82F6, #1D4ED8)", "linear-gradient(135deg, #059669, #064E3B)")
content = content.replace("linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)", "linear-gradient(135deg, #059669 0%, #064E3B 100%)")
content = content.replace("rgba(59,130,246,0.25)", "rgba(5, 150, 105, 0.25)")
content = content.replace("#3B82F6", "#059669")
content = content.replace("#EFF6FF", "#ECFDF5")

with open(target_path, 'w') as f:
    f.write(content)
