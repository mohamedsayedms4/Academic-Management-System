import re

with open('js/dashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove duplicate loadDiplomasForModeratorForm
content = re.sub(r'async function loadDiplomasForModeratorForm\(\) \{.*?\n\}(?=\n)', '', content, flags=re.DOTALL)
content = re.sub(r'async function loadDiplomasForLeadForm\(\) \{.*?\n\}(?=\n)', '', content, flags=re.DOTALL)
content = re.sub(r'async function loadDiplomasForTelesalesForm\(\) \{.*?\n\}(?=\n)', '', content, flags=re.DOTALL)

# Also remove any remaining stragglers due to catch blocks
content = re.sub(r'async function loadDiplomasForModeratorForm\(\) \{[\s\S]*?catch \(e\) \{ console\.error\([^\)]+\); \}\s*\}', '', content)
content = re.sub(r'async function loadDiplomasForLeadForm\(\) \{[\s\S]*?catch \(e\) \{ console\.error\([^\)]+\); \}\s*\}', '', content)
content = re.sub(r'async function loadDiplomasForTelesalesForm\(\) \{[\s\S]*?catch \(e\) \{ console\.error\([^\)]+\); \}\s*\}', '', content)

new_func = """
async function loadAllDiplomas() {
    try {
        const resp = await fetch(`${API_BASE}/api/v2/diplomas`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (!resp.ok) return;
        const diplomas = await resp.json();
        const selects = document.querySelectorAll('#mod-lead-diploma, #mod-filter-diploma, #add-lead-diploma, #filter-diploma');
        selects.forEach(sel => {
            if (!sel) return;
            sel.innerHTML = '<option value="">All Diplomas</option>';
            diplomas.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                sel.appendChild(opt);
            });
        });
    } catch (e) { console.error('loadAllDiplomas error:', e); }
}
"""

content = content.replace('// Lead Management – Shared Helpers', '// Lead Management – Shared Helpers\n' + new_func)

content = content.replace('loadDiplomasForModeratorForm()', 'loadAllDiplomas()')
content = content.replace('loadDiplomasForLeadForm()', 'loadAllDiplomas()')
content = content.replace('loadDiplomasForTelesalesForm()', 'loadAllDiplomas()')

with open('js/dashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned up dashboard.js successfully.')
