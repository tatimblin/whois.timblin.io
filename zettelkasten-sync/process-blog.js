const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const sharp = require('sharp');

const publishedDir = path.join(__dirname, 'Published');
const assetsDir = path.join(__dirname, 'Assets');
const outputFile = path.join(__dirname, 'whois-site/src/txt-posts.js');
const blogImagesDir = path.join(__dirname, 'whois-site/public/blog-images');

function slugify(filename) {
  return filename
    .replace('.md', '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Replace image extensions with .webp
function toWebpFilename(filename) {
  return filename.replace(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i, '.webp');
}

// Rewrite Obsidian wiki-link images and Assets/ paths to /blog-images/*.webp
function processImages(content) {
  // ![[file.jpg]] or ![[file.jpg|300]]
  content = content.replace(/!\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g, (_, file) => {
    const webp = toWebpFilename(file.trim());
    return `![${file.trim()}](/blog-images/${webp})`;
  });

  // ![alt](Assets/file.png)
  content = content.replace(/!\[([^\]]*)\]\(Assets\/([^)]+)\)/g, (_, alt, file) => {
    const webp = toWebpFilename(file.trim());
    return `![${alt}](/blog-images/${webp})`;
  });

  return content;
}

// Extract all referenced image filenames (original names from Assets/)
function collectImageFilenames(content) {
  const filenames = new Set();

  // ![[file.jpg]] or ![[file.jpg|300]]
  const wikiLinks = content.matchAll(/!\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g);
  for (const match of wikiLinks) {
    filenames.add(match[1].trim());
  }

  // ![alt](Assets/file.png)
  const mdLinks = content.matchAll(/!\[([^\]]*)\]\(Assets\/([^)]+)\)/g);
  for (const match of mdLinks) {
    filenames.add(match[2].trim());
  }

  return filenames;
}

function processPost(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const filename = path.basename(filePath);
  const slug = slugify(filename);

  const title = data.title || filename.replace('.md', '');
  const date = data.date
    ? new Date(data.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const tags = data.tags || [];
  const icon = data.icon || null;
  const image = data.image || null;
  const imageAlt = data.imageAlt || null;
  const canonical = data.canonical || null;
  const modified = data.modified
    ? new Date(data.modified).toISOString().split('T')[0]
    : null;

  let excerpt = data.excerpt || null;
  if (!excerpt) {
    const plainText = content.replace(/[#*`>\[\]()!-]/g, '').trim();
    excerpt = plainText.substring(0, 160).trim();
    if (plainText.length > 160) excerpt += '...';
  }

  const images = collectImageFilenames(content);
  const processedContent = processImages(content);
  const html = marked(processedContent);

  return { slug, title, date, icon, tags, excerpt, image, imageAlt, canonical, modified, html, images };
}

// Optimize and copy images to public/blog-images/ as WebP
async function processAllImages(allImageFilenames) {
  // Clear blog-images directory (remove stale images from deleted posts)
  if (fs.existsSync(blogImagesDir)) {
    const existing = fs.readdirSync(blogImagesDir);
    for (const file of existing) {
      if (file === '.gitkeep') continue;
      fs.unlinkSync(path.join(blogImagesDir, file));
    }
  } else {
    fs.mkdirSync(blogImagesDir, { recursive: true });
  }

  for (const filename of allImageFilenames) {
    const srcPath = path.join(assetsDir, filename);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Warning: referenced image not found: ${srcPath}`);
      continue;
    }

    const webpName = toWebpFilename(filename);
    const destPath = path.join(blogImagesDir, webpName);

    await sharp(srcPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(destPath);

    console.log(`  ${filename} -> ${webpName}`);
  }
}

async function main() {
  // Read all .md files from Published/
  let posts = [];
  if (fs.existsSync(publishedDir)) {
    const files = fs.readdirSync(publishedDir).filter(f => f.endsWith('.md'));
    posts = files.map(f => processPost(path.join(publishedDir, f)));
  }

  // Collect all referenced images across all posts
  const allImageFilenames = new Set();
  for (const post of posts) {
    for (const img of post.images) {
      allImageFilenames.add(img);
    }
  }

  // Process images
  if (allImageFilenames.size > 0) {
    console.log(`Processing ${allImageFilenames.size} image(s)...`);
    await processAllImages(allImageFilenames);
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Escape backticks and backslashes in HTML for template literal safety
  function escapeForTemplateLiteral(str) {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  }

  // Generate JS module (delete images property from output)
  const entries = posts.map(post => `  {
    slug: '${post.slug}',
    title: ${JSON.stringify(post.title)},
    date: '${post.date}',
    icon: ${JSON.stringify(post.icon)},
    tags: ${JSON.stringify(post.tags)},
    excerpt: ${JSON.stringify(post.excerpt)},
    image: ${JSON.stringify(post.image)},
    imageAlt: ${JSON.stringify(post.imageAlt)},
    canonical: ${JSON.stringify(post.canonical)},
    modified: ${JSON.stringify(post.modified)},
    html: \`${escapeForTemplateLiteral(post.html)}\`,
  }`);

  const output = `// Auto-generated by zettelkasten sync -- do not edit manually
export default [
${entries.join(',\n')}
];
`;

  fs.writeFileSync(outputFile, output, 'utf-8');
  console.log(`Wrote ${posts.length} post(s) to ${outputFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
