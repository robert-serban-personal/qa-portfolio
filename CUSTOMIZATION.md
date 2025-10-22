# Quick Customization Guide

## 🎯 Priority Customizations

### 1. Personal Information (5 minutes)

**File: `components/sections/Contact.tsx`**

```typescript
// Line 9-23: Update contact information
const contactInfo = [
  {
    icon: HiMail,
    label: 'Email',
    value: 'YOUR_EMAIL@example.com',  // ← Change this
    link: 'mailto:YOUR_EMAIL@example.com',  // ← Change this
  },
  {
    icon: HiPhone,
    label: 'Phone',
    value: '+1 (XXX) XXX-XXXX',  // ← Change this
    link: 'tel:+1XXXXXXXXXX',  // ← Change this
  },
  {
    icon: HiLocationMarker,
    label: 'Location',
    value: 'Your City, Country',  // ← Change this
    link: '#',
  },
];

// Line 26-40: Update social media links
const socialLinks = [
  {
    icon: SiLinkedin,
    label: 'LinkedIn',
    url: 'https://linkedin.com/in/YOUR_PROFILE',  // ← Change this
    color: '#0A66C2',
  },
  {
    icon: SiGithub,
    label: 'GitHub',
    url: 'https://github.com/YOUR_USERNAME',  // ← Change this
    color: '#181717',
  },
  {
    icon: SiX,
    label: 'X (Twitter)',
    url: 'https://twitter.com/YOUR_HANDLE',  // ← Change this
    color: '#000000',
  },
];
```

### 2. Portfolio Projects (10 minutes)

**File: `components/sections/Portfolio.tsx`**

Replace the `projects` array (lines 9-72) with your actual projects:

```typescript
const projects = [
  {
    title: 'Your Project Name',
    description: 'Brief description of what this project does and the problem it solves.',
    technologies: ['Cypress', 'TypeScript', 'etc'],
    githubUrl: 'https://github.com/yourusername/your-repo',
    liveUrl: '#', // or link to demo/docs
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Keep gradients or use actual images
  },
  // Add more projects...
];
```

### 3. About Section (5 minutes)

**File: `components/sections/About.tsx`**

- Lines 54-65: Update your bio/description
- Lines 70-78: Update your highlights and achievements

### 4. Skills (5 minutes)

**File: `components/sections/Skills.tsx`**

- Lines 26-63: Update the skills to match your actual tech stack
- Keep the structure but replace technologies you don't use

### 5. Hero Section (2 minutes)

**File: `components/sections/Hero.tsx`**

- Line 39: Update your title/role
- Lines 49-54: Update the main heading
- Lines 62-68: Update the tagline/description

### 6. Add Resume (1 minute)

1. Export your resume as `resume.pdf`
2. Place it in `/public/resume.pdf`
3. The download button will automatically work

### 7. Footer (2 minutes)

**File: `components/ui/Footer.tsx`**

- Line 37: Update "QA Portfolio" to your name
- Update social links (lines 6-10) to match Contact section

## 🎨 Optional Customizations

### Change Color Scheme

Search and replace these color classes across all components:

- `emerald-400`, `emerald-500` → Your primary color
- `cyan-400`, `cyan-500` → Your secondary color
- `slate-800`, `slate-900` → Background colors

### Add Your Photo

**File: `components/sections/About.tsx`**

Replace lines 82-94 with an actual image:

```typescript
<div className="relative aspect-square rounded-2xl overflow-hidden">
  <Image
    src="/your-photo.jpg"
    alt="Your Name"
    fill
    className="object-cover"
  />
</div>
```

### Update SEO/Metadata

**File: `app/layout.tsx`**

- Line 16: Update title
- Line 17: Update description

## 🚀 Running the Site

```bash
# Install dependencies (first time only)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

## 📝 Content Checklist

- [ ] Personal contact information updated
- [ ] Social media links updated
- [ ] At least 3-6 portfolio projects added
- [ ] About section personalized
- [ ] Skills/technologies updated
- [ ] Resume PDF added to /public folder
- [ ] Hero section customized
- [ ] Footer updated with your name
- [ ] Metadata/SEO updated

## 🎯 Ready to Deploy?

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically!

Your portfolio will be live at `https://your-project.vercel.app`
