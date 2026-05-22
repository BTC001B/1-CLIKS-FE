import re

css_path = '/Users/btc001a/Downloads/Flutter/fin/CLIKS-FE/src/App.css'

with open(css_path, 'r') as f:
    content = f.read()

# Replace .sidebar background
old_sidebar = """
.sidebar {
    width: 180px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
}
"""

new_sidebar = """
.sidebar {
    width: 220px;
    background: #f0fdf4 !important;
    border-right: 1px solid #DCF2E4 !important;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    flex-shrink: 0;
}
"""
content = content.replace(old_sidebar.strip(), new_sidebar.strip())

# Replace .sidebar-header border
old_header = """
.sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--border-color);
}
"""

new_header = """
.sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1.5rem;
    border-bottom: 1px solid #DCF2E4 !important;
}
"""
content = content.replace(old_header.strip(), new_header.strip())

# Replace .app-title color
old_title = """
.app-title {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--text-main);
}
"""

new_title = """
.app-title {
    font-weight: 800;
    font-size: 1.25rem;
    color: #135029 !important;
}
"""
content = content.replace(old_title.strip(), new_title.strip())

with open(css_path, 'w') as f:
    f.write(content)

