import urllib.request
import os

images = [
    ("https://www.slmmb.com/wp-content/uploads/2025/10/cropped-slmb-log.png", "logo.png"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/20240818-black1.jpg", "black-masterbatch.jpg"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/白色母 粒.png", "white-masterbatch.png"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/3.jpg", "color-masterbatch.jpg"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/交流会.jpg", "team.jpg"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/1-1-300x278.png", "product-1.png"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/cropped-2-300x300.png", "product-2.png"),
    ("https://www.slmmb.com/wp-content/uploads/2025/05/3-300x294.png", "product-3.png"),
    ("https://www.slmmb.com/wp-content/uploads/2023/11/picture-in-contact.png", "contact-bg.png")
]

save_dir = r"c:\Users\dorothy\Desktop\WH\SLM_Website\assets\images"
if not os.path.exists(save_dir):
    os.makedirs(save_dir)

headers = {'User-Agent': 'Mozilla/5.0'}

for url, filename in images:
    try:
        # Encode non-ascii characters in URL
        parts = list(urllib.parse.urlsplit(url))
        parts[2] = urllib.parse.quote(parts[2])
        url_encoded = urllib.parse.urlunsplit(parts)
        
        req = urllib.request.Request(url_encoded, headers=headers)
        print(f"Downloading {filename}...")
        with urllib.request.urlopen(req) as response, open(os.path.join(save_dir, filename), 'wb') as out_file:
            out_file.write(response.read())
        print(f"Saved {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
