import re

def fix_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to match:
    # <div class="page-content" id="...">
    #     <div class="content-header">
    #         <div class="header-titles">
    #             <h1>...</h1>
    #             <p>...</p>
    #         </div>
    #     </div>
    # ...
    # </div> (the end of page-content)

    # Let's split by '<div class="page-content"'
    parts = content.split('<div class="page-content"')
    
    out_parts = [parts[0]]
    
    for part in parts[1:]:
        # check if it already has unified-container
        if 'class="unified-container"' in part:
            out_parts.append('<div class="page-content"' + part)
            continue
            
        # check if it has a <p> right under header-titles
        # Example:
        # <div class="header-titles">
        #     <h1>Rounds</h1>
        #     <p>View and manage all rounds, their durations, and linked diplomas.</p>
        # </div>
        
        match = re.search(r'(<div class="content-header"[^>]*>\s*<div class="header-titles">\s*<h1[^>]*>.*?</h1>\s*)(<p[^>]*>.*?</p>\s*)(</div>\s*</div>)', part, re.DOTALL)
        
        if match:
            # We found a header with h1 and p.
            # We need to change the content-header to add margin-bottom: 15px; if not present
            # Then insert <div class="unified-container" style="margin-top: 0;"> after it.
            # Then insert the <p> inside it with styling.
            # Finally, insert a closing </div> at the end of the part (before the last </div> of page-content).
            
            p1 = match.group(1) # content-header, header-titles, h1
            p2 = match.group(2) # <p>...</p>
            p3 = match.group(3) # </div></div> (closing header-titles, content-header)
            
            # extract text from p2
            p_text_match = re.search(r'<p[^>]*>(.*?)</p>', p2, re.DOTALL)
            p_text = p_text_match.group(1) if p_text_match else ""
            
            # Modify p1 to ensure content-header has margin-bottom: 15px
            if 'style=' in p1:
                # just replace <div class="content-header" with <div class="content-header" style="margin-bottom: 15px;"
                pass # let's just do a simple replace
            p1 = p1.replace('<div class="content-header">', '<div class="content-header" style="margin-bottom: 15px;">')
            
            new_header = p1 + p3
            unified_start = '\n                <div class="unified-container" style="margin-top: 0;">\n                    <p style="color: #666; margin-top: 0; margin-bottom: 20px; font-size: 14px;">' + p_text + '</p>'
            
            part_modified = part[:match.start()] + new_header + unified_start + part[match.end():]
            
            # Now we need to close the unified-container at the end.
            # The part ends with </div>\n            </div> for page-content.
            # Or usually ends with </div> \n </div>
            # We can find the last '</div>' and insert '</div>\n' before it.
            # But wait, part might have other stuff. Let's find the last </div>
            last_div_idx = part_modified.rfind('</div>')
            if last_div_idx != -1:
                part_modified = part_modified[:last_div_idx] + '    </div>\n            ' + part_modified[last_div_idx:]
            
            out_parts.append('<div class="page-content"' + part_modified)
        else:
            out_parts.append('<div class="page-content"' + part)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("".join(out_parts))

if __name__ == '__main__':
    fix_html('c:/Users/omar/Downloads/frontend (2)/frontend/index.html')
    print('Done applying unified container to all page-content blocks.')
