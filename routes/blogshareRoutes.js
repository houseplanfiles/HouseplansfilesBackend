const express = require("express");
const router = express.Router();
const BlogPost = require("../models/blogPostModel");

const generateBlogShareHTML = (data) => {
  const { title, description, image, url, author, tags } = data;
  const cleanDescription = description
    .replace(/<[^>]*>/g, "")
    .substring(0, 160);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | House Plan Files Blog</title>
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="${title}">
    <meta name="description" content="${cleanDescription}">
    <meta name="author" content="${author}">
    ${tags ? `<meta name="keywords" content="${tags}">` : ""}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:site_name" content="House Plan Files">
    <meta property="article:author" content="${author}">
    ${tags ? `<meta property="article:tag" content="${tags}">` : ""}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${title}">
    <meta name="twitter:creator" content="${author}">
    
    <!-- JavaScript Redirect (Only for Browsers, NOT Bots) -->
    <script>
      // Check if it's a bot/crawler
      const isBot = /bot|crawler|spider|crawling|facebook|twitter|linkedin|whatsapp|telegram|pinterest/i.test(navigator.userAgent);
      
      // Only redirect if NOT a bot
      if (!isBot) {
        setTimeout(() => {
          window.location.href = "${url}";
        }, 500);
      }
    </script>
    
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 100vh; 
        margin: 0; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white;
        padding: 20px;
      }
      .content { 
        text-align: center; 
        max-width: 700px;
        background: rgba(255,255,255,0.1);
        padding: 40px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }
      .blog-image {
        width: 100%;
        max-width: 600px;
        height: 300px;
        object-fit: cover;
        border-radius: 12px;
        margin: 20px auto;
        display: block;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }
      h1 { 
        margin: 0 0 16px 0; 
        font-size: 32px;
        font-weight: 700;
        line-height: 1.3;
      }
      .author {
        font-size: 14px;
        opacity: 0.9;
        margin: 10px 0;
        font-style: italic;
      }
      p { 
        font-size: 16px; 
        opacity: 0.9; 
        line-height: 1.6;
        margin: 16px 0;
      }
      .spinner { 
        border: 4px solid rgba(255,255,255,0.3); 
        border-radius: 50%; 
        border-top: 4px solid white; 
        width: 50px; 
        height: 50px; 
        animation: spin 1s linear infinite; 
        margin: 20px auto; 
      }
      @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
      }
      a { 
        color: #ffd700; 
        text-decoration: none;
        font-weight: 600;
        padding: 12px 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 8px;
        display: inline-block;
        margin-top: 20px;
        transition: all 0.3s;
      }
      a:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-2px);
      }
    </style>
</head>
<body>
    <div class="content">
      <h1>${title}</h1>
      ${author ? `<div class="author">By ${author}</div>` : ""}
      <img src="${image}" alt="${title}" class="blog-image" onerror="this.style.display='none'">
      <p>${cleanDescription}</p>
      <div class="spinner"></div>
      <p style="font-size: 14px; margin-top: 30px;">Redirecting to House Plan Files Blog...</p>
      <a href="${url}">Click here if not redirected automatically</a>
    </div>
</body>
</html>`;
};

const handleBlogShareRequest = async (req, res) => {
  const { slug } = req.params;

  const frontendUrl =
    process.env.FRONTEND_URL || "https://www.houseplanfiles.com";
  const blogUrl = `${frontendUrl}/blogs/${slug}`;
  const backendUrl =
    process.env.BACKEND_URL || "https://architect-backend.vercel.app";

  try {
    const post = await BlogPost.findOne({ slug });

    if (!post) {
      console.log(`⚠️ Blog post not found: ${slug}`);
      return res.redirect(blogUrl);
    }

    const postTitle = post.title || "Blog Post";
    const postDescription =
      post.metaDescription ||
      post.description ||
      "Read this interesting article on House Plan Files.";
    const postAuthor = post.author || "House Plan Files";
    const postTags = Array.isArray(post.tags) ? post.tags.join(", ") : "";

    // Image URL generation
    let absoluteImageUrl;
    const dbImage = post.mainImage;

    if (!dbImage) {
      absoluteImageUrl = `${backendUrl}/uploads/default-blog.jpg`;
    } else if (
      dbImage.startsWith("http://") ||
      dbImage.startsWith("https://")
    ) {
      absoluteImageUrl = dbImage;
    } else {
      const cleanPath = dbImage.startsWith("/") ? dbImage : `/${dbImage}`;
      absoluteImageUrl = `${backendUrl}${cleanPath}`;
    }

    // Force HTTPS
    absoluteImageUrl = absoluteImageUrl.replace(/^http:/, "https:");

    console.log(`✅ Blog share page generated for: ${postTitle}`);
    console.log(`📸 Image URL: ${absoluteImageUrl}`);
    console.log(
      `📝 Description length: ${postDescription.replace(/<[^>]*>/g, "").substring(0, 160).length} chars`
    );

    const html = generateBlogShareHTML({
      title: postTitle,
      description: postDescription,
      image: absoluteImageUrl,
      url: blogUrl,
      author: postAuthor,
      tags: postTags,
    });

    // CRITICAL: Headers for social media crawlers
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.setHeader("X-Robots-Tag", "noindex, follow");

    // IMPORTANT: Don't set any redirect headers
    res.status(200).send(html);
  } catch (error) {
    console.error(`❌ Blog share route error for ${slug}:`, error.message);
    res.redirect(blogUrl);
  }
};

router.get("/blog/:slug", handleBlogShareRequest);

module.exports = router;
