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

4. **Custom Domain & HTTPS (CRITICAL)**:
   - Scroll down to **Custom domain**.
   - It might already be filled with `slmmb.com` (because of the CNAME file).
   - If not, enter `slmmb.com` and click **Save**.
   - **IMPORTANT**: Check the **Enforce HTTPS** box. 
     - *Note: This checkbox saves automatically when clicked. There is no "Save" button for this specific option.*
     - *If this is unchecked, users will see "Not Secure" warnings when submitting forms.*
     - *If it is grayed out, wait up to 24 hours for the certificate to issue, then come back and check it.*

### Troubleshooting: "Enforce HTTPS" is Grayed Out / Disabled

If you cannot check the "Enforce HTTPS" box, it usually means GitHub is still processing your SSL certificate.

1.  **Wait 24 Hours**: This is the most common fix. The certificate issuance process can take time.
2.  **Check DNS Records**: Ensure your domain registrar (where you bought the domain) has the following **A Records**:
    *   `185.199.108.153`
    *   `185.199.109.153`
    *   `185.199.110.153`
    *   `185.199.111.153`
3.  **Re-trigger the Process**: 
    *   Clear the "Custom domain" field in GitHub Settings and click **Save**.
    *   Wait 1 minute.
    *   Enter `slmmb.com` again and click **Save**. This forces GitHub to re-check your DNS.

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
