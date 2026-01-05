# SLM Masterbatches Website

This is a static corporate website for SLM Masterbatches Co., Ltd.

## Structure
- **index.html**: Home page
- **products.html**: Product catalog
- **about.html**: Company information
- **applications.html**: Industry applications
- **quality.html**: QC process
- **news.html**: News articles
- **contact.html**: Contact info and form
- **css/**: Stylesheets
- **js/**: JavaScript logic

## Domain Configuration (slmmb.com)

This project is configured for the domain: `slmmb.com`

### Files Created
- **CNAME**: Contains `slmmb.com` (required for GitHub Pages automatic configuration).
- **robots.txt**: Points search engines to the sitemap.
- **sitemap.xml**: Lists all pages with the `https://slmmb.com` prefix.
- **Canonical Tags**: All HTML pages include `<link rel="canonical" ...>` pointing to the correct URL.

### GitHub Pages Deployment Guide (Recommended)

1. **Upload Code**: 
   - Ensure this `SLM_Website` folder's contents are in your GitHub repository.
   - **Important**: `index.html` should be in the root of the repository (not inside a subfolder), or you must configure the "Source" folder accordingly.

2. **Go to Settings**:
   - Open your repository on GitHub.
   - Click the **Settings** tab (top right menu bar).
   - In the left sidebar, under "Code and automation", click **Pages**.

3. **Configure Build and deployment**:
   - Under **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
   - Click **Save**.

4. **Custom Domain**:
   - Scroll down to **Custom domain**.
   - It might already be filled with `slmmb.com` (because of the CNAME file).
   - If not, enter `slmmb.com` and click **Save**.
   - Check the **Enforce HTTPS** box (wait for DNS to propagate if it's grayed out).

5. **DNS Setup (At your Domain Registrar)**:
   - Go to where you bought your domain (Aliyun, Tencent, GoDaddy, etc.).
   - Add these records:
     - **Type**: `A`, **Name**: `@`, **Value**: `185.199.108.153`
     - **Type**: `A`, **Name**: `@`, **Value**: `185.199.109.153`
     - **Type**: `A`, **Name**: `@`, **Value**: `185.199.110.153`
     - **Type**: `A`, **Name**: `@`, **Value**: `185.199.111.153`
     - **Type**: `CNAME`, **Name**: `www`, **Value**: `your-github-username.github.io`

### Other Hosting Options

#### Vercel
1.  Go to project dashboard > Settings > Domains.
2.  Add `slmmb.com`.
3.  Add the A/CNAME records provided by Vercel to your DNS.

#### Netlify
1.  Go to Site Settings > Domain Management.
2.  Add `slmmb.com`.
3.  Follow instructions to configure DNS.

## Customization
- Edit `css/style.css` for colors and fonts.
- Edit HTML files for content.
- Images are located in `assets/images/`.
