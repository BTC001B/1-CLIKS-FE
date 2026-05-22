import os

source_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE-BUS/src/pages/BusinessPitches.jsx'
target_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE/src/pages/public/BetaClub.jsx'

with open(source_path, 'r') as f:
    content = f.read()

# 1. Component Name
content = content.replace("export default function BusinessPitches()", "export default function BetaClub()")

# 2. Currency
content = content.replace("import { useCurrency } from '../context';", "import { formatCurrency } from '../../lib/formatCurrency';")
content = content.replace("const { currency, formatCurrency } = useCurrency();", "const currency = { symbol: '₹' };")

# 3. Fix import path for pitchesService
content = content.replace("import { pitchesService } from '../services/pitchesService';", "import { pitchesService } from '../../services';")

# 4. Header Styling & Titles
content = content.replace("background: '#1E3A8A'", "background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)'")
content = content.replace("rgba(30, 58, 138, 0.15)", "rgba(6, 78, 59, 0.15)")
content = content.replace("color: '#60A5FA'", "color: '#34D399'")
content = content.replace("SME Deal Marketplace", "BETA Club Deal Marketplace")
content = content.replace("color: '#BFDBFE'", "color: '#A7F3D0'")
content = content.replace("color = '#1E3A8A'", "color = '#064E3B'")

with open(target_path, 'w') as f:
    f.write(content)
