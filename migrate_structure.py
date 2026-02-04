import os
import re
import shutil

# Configuration
base_dir = r"d:\外贸\WH"
files_to_migrate = [
    "products.html",
    "about.html",
    "applications.html",
    "quality.html",
    "news.html",
    "contact.html",
    "faq.html",
    "thank-you.html",
    "landing-page.html"
]

# Blog files to update links only
blog_dir = os.path.join(base_dir, "blog")
blog_files = [f for f in os.listdir(blog_dir) if f.endswith(".html")]

# Mapping for link replacement
# filename -> new_href_from_root
# e.g. "products.html" -> "products/"
link_map = {
    "index.html": "", # root
}
for f in files_to_migrate:
    link_map[f] = f.replace(".html", "/")

def update_content(content, current_depth=0):
    # 1. Update internal links
    for old_file, new_path_from_root in link_map.items():
        # Pattern to match: href="[../]*old_file[#anchor]"
        # We handle:
        # 1. old_file (in root)
        # 2. ../old_file (in subpage)
        
        # We simply look for the filename in href
        # regex: href="(\.\./)?old_file(#.*)?"
        
        pattern = r'(href=["\'])((?:\.\./)*)' + re.escape(old_file) + r'((?:#[^"\']*)?["\'])'
        
        def replace_link(match):
            prefix_quote = match.group(1) # href="
            existing_dots = match.group(2) # ../ or empty
            anchor = match.group(3) # #black" or "
            
            # Determine new target
            # If current_depth == 0 (root file):
            #   Target should be new_path_from_root (e.g. "products/")
            #   If target is "", use "./" or just "" (for index)
            
            # If current_depth == 1 (subpage):
            #   Target should be "../" + new_path_from_root (e.g. "../products/")
            #   If target is "", use "../"
            
            if current_depth == 0:
                if new_path_from_root == "":
                    final_target = "./" # index.html -> ./
                else:
                    final_target = new_path_from_root
            else:
                if new_path_from_root == "":
                    final_target = "../" # index.html -> ../
                else:
                    final_target = "../" + new_path_from_root
            
            # Special case: self-reference
            # If we are in products/index.html and link was products.html
            # old_file="products.html", new_path="products/"
            # We are at depth 1. final_target = "../products/"
            # This is technically correct (goes to folder), but "./" would be cleaner?
            # Browser handles ../products/ fine from products/index.html -> goes to products/ directory.
            
            return f'{prefix_quote}{final_target}{anchor}'

        content = re.sub(pattern, replace_link, content)

    # 2. Update resource links (css, js, assets) ONLY if moving from depth 0 to depth 1
    # This applies to the migrated files (products.html -> products/index.html)
    # But NOT to blog files (which are already depth 1 and presumably have correct ../ links, 
    # unless they linked to assets/ directly which would be broken).
    # Wait, blog files should already have ../. I should check if they need update.
    # If I am processing products.html (depth 0) to make it depth 1:
    #   I need to prepend ../ to assets, css, js.
    
    if current_depth == 1 and "blog" not in content: # Hacky check? No.
        # We need a flag if we are *moving* the file or just updating links.
        pass

    return content

def update_resources(content):
    # Prepend ../ to css/, js/, assets/
    res_pattern = r'(src|href)=["\'](css/|js/|assets/)'
    content = re.sub(res_pattern, r'\1="../\2', content)
    
    style_url_pattern = r'url\([\'"]?(assets/)'
    content = re.sub(style_url_pattern, r'url(\'../\1', content)
    return content

# 1. Process files to migrate (Level 0 -> Level 1)
for filename in files_to_migrate:
    old_path = os.path.join(base_dir, filename)
    if not os.path.exists(old_path):
        print(f"Skipping {filename}, not found.")
        continue
        
    folder_name = filename.replace(".html", "")
    new_folder = os.path.join(base_dir, folder_name)
    os.makedirs(new_folder, exist_ok=True)
    
    with open(old_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update links (assuming it will be at depth 1)
    new_content = update_content(content, current_depth=1)
    # Update resources (since it moved down)
    new_content = update_resources(new_content)
    
    # Special fix for canonical tags
    canonical_pattern = r'(<link rel="canonical" href="https://slmmb.com/)' + re.escape(filename) + r'(")'
    new_content = re.sub(canonical_pattern, r'\1' + folder_name + r'/\2', new_content)
    
    new_path = os.path.join(new_folder, "index.html")
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Migrated {filename} to {folder_name}/index.html")

# 2. Process index.html (Root) - Only update links
root_index = os.path.join(base_dir, "index.html")
with open(root_index, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = update_content(content, current_depth=0)
new_content = new_content.replace('href="https://slmmb.com/index.html"', 'href="https://slmmb.com/"')
shutil.copy(root_index, root_index + ".bak")
with open(root_index, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated index.html")

# 3. Process Blog files (Depth 1) - Only update links
for filename in blog_files:
    path = os.path.join(blog_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Blog files are at depth 1, so links should be ../page/
    new_content = update_content(content, current_depth=1)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated blog/{filename}")
