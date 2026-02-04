import os
import re
import shutil

# Configuration
root_dir = r"D:\外贸\WH"
files_to_move = [
    'about', 'products', 'contact', 'news', 'faq', 
    'quality', 'applications', 'landing-page', 'thank-you'
]

def migrate_file(filename):
    file_path = os.path.join(root_dir, f"{filename}.html")
    if not os.path.exists(file_path):
        print(f"Skipping {filename}, file not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Asset Paths (add ../)
    content = re.sub(r'(src|href)="(assets|css|js)/', r'\1="../\2/', content)
    content = re.sub(r'(src|href)="favicon', r'\1="../favicon', content)

    # 2. Update Navigation Links
    # Special handling for index.html link
    content = content.replace('href="index.html"', 'href="../"')
    content = content.replace("href='index.html'", "href='../'")

    # Update links to other pages
    for page in files_to_move:
        # Check if it's a self-reference with hash
        # e.g. in products.html, href="products.html#black" -> href="#black"
        if page == filename:
            content = re.sub(f'href="{page}\.html(#.*?)"', r'href="\1"', content)
            content = re.sub(f'href="{page}\.html"', r'href="./"', content)
        else:
            # External reference
            # href="about.html#team" -> href="../about/#team"
            content = re.sub(f'href="{page}\.html(#.*?)"', r'href="../{page}/\1"', content)
            content = re.sub(f'href="{page}\.html"', r'href="../{page}/"', content)

    # 3. Update Canonical and OG URLs
    content = re.sub(r'https://slmmb.com/([a-zA-Z0-9-]+)\.html', r'https://slmmb.com/\1/', content)
    
    # 4. Update JSON-LD URLs (specifically for products.html)
    # Be careful not to break schema.org URLs, only replace slmmb.com ones
    # The regex above (3) might have already caught most, but let's be sure about "url": "..."
    # "url": "https://slmmb.com/products.html#black" -> "url": "https://slmmb.com/products/#black"
    
    # Write to new location
    new_dir = os.path.join(root_dir, filename)
    os.makedirs(new_dir, exist_ok=True)
    new_path = os.path.join(new_dir, "index.html")
    
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Migrated {filename}.html to {filename}/index.html")

def update_homepage():
    file_path = os.path.join(root_dir, "index.html")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update links only (no asset path changes)
    for page in files_to_move:
        content = re.sub(f'href="{page}\.html(#.*?)"', r'href="{page}/\1"', content)
        content = re.sub(f'href="{page}\.html"', r'href="{page}/"', content)
    
    # Update Canonical/OG
    content = re.sub(r'https://slmmb.com/index\.html', r'https://slmmb.com/', content)
    # Ensure other pages are also referenced cleanly in canonicals if any (unlikely on homepage but good practice)
    content = re.sub(r'https://slmmb.com/([a-zA-Z0-9-]+)\.html', r'https://slmmb.com/\1/', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Updated index.html")

def update_sitemap():
    file_path = os.path.join(root_dir, "sitemap.xml")
    if not os.path.exists(file_path):
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'https://slmmb.com/([a-zA-Z0-9-]+)\.html', r'https://slmmb.com/\1/', content)
    content = content.replace('https://slmmb.com/index.html', 'https://slmmb.com/')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Updated sitemap.xml")

if __name__ == "__main__":
    for page in files_to_move:
        migrate_file(page)
    
    update_homepage()
    update_sitemap()
