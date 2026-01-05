import urllib.request
import re

url = "http://www.slmmb.com"
try:
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    # Find all image sources
    images = re.findall(r'src=["\'](.*?\.(?:jpg|jpeg|png|gif|webp))["\']', html, re.IGNORECASE)
    
    print(f"Found {len(images)} images:")
    for img in images:
        # Handle relative URLs
        if not img.startswith('http'):
            if img.startswith('/'):
                img = url + img
            else:
                img = url + '/' + img
        print(img)
        
except Exception as e:
    print(f"Error: {e}")
