import re

css_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE/src/App.css'

with open(css_path, 'r') as f:
    content = f.read()

# Replace .sidebar-item base
old_item = """
.sidebar-item {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border-radius: 8px;
    color: var(--text-muted);
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
}
"""

new_item = """
.sidebar-item {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    /* color: #111827 !important; */
    font-weight: 600;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    font-size: 0.92rem !important;
    position: relative;
    z-index: 1;
    background: transparent;
    border: none;
    cursor: pointer;
    margin-bottom: 1px;
}

.sidebar-item svg {
    color: #374151 !important;
    width: 20px !important;
    height: 20px !important;
    transition: color 0.2s ease, transform 0.2s ease;
}
"""
content = content.replace(old_item.strip(), new_item.strip())

# Replace .sidebar-item hover
old_hover = """
.sidebar-item:hover {
    background-color: rgba(27, 107, 58, 0.05);
    color: var(--primary);
}
"""

new_hover = """
.sidebar-item:hover {
    background-color: #E2E8F0 !important;
    color: #000000 !important;
    transform: translateX(2px);
}

.sidebar-item:hover svg {
    color: #111827 !important;
    transform: scale(1.05);
}
"""
content = content.replace(old_hover.strip(), new_hover.strip())

# Replace .sidebar-item active
old_active = """
.sidebar-item.active {
    background-color: rgba(27, 107, 58, 0.08);
    color: var(--primary);
    font-weight: 700;
    box-shadow: inset 4px 0 0 -1px var(--primary);
}
"""

new_active = """
.sidebar-item.active {
    background-color: #1F2937 !important;
    color: #FFFFFF !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.sidebar-item.active svg {
    color: #FFFFFF !important;
}
"""
content = content.replace(old_active.strip(), new_active.strip())

with open(css_path, 'w') as f:
    f.write(content)

