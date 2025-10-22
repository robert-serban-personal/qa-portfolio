# QA Portfolio Website

A modern, sleek, and professional portfolio website for automation QA testers built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Modern Design**: Sleek, high-end design with gradient accents and smooth animations
- **Custom Cursor**: Professional custom cursor with smooth follow effect (desktop only)
- **Smooth Scrolling**: Luxury website-style smooth scroll navigation
- **Responsive**: Fully responsive design that works on all devices
- **Sections**:
  - Landing/Hero section with impactful first impression
  - About section with structured description
  - Skills section with animated tech icons
  - Portfolio section for GitHub project showcases
  - Contact section with functional form and contact info
- **Animations**: Subtle, professional animations using Framer Motion
- **Resume Download**: Easy-to-access resume download button in navigation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Customization

### Personal Information

Update the following files with your information:

1. **Contact Information** (`components/sections/Contact.tsx`):
   - Email, phone, location
   - Social media links (LinkedIn, GitHub, X)

2. **Portfolio Projects** (`components/sections/Portfolio.tsx`):
   - Replace placeholder projects with your actual GitHub projects
   - Update project descriptions, technologies, and links

3. **About Section** (`components/sections/About.tsx`):
   - Update the description to match your experience
   - Customize highlights and achievements
   - Replace the placeholder image with your photo

4. **Skills** (`components/sections/Skills.tsx`):
   - Add/remove technologies based on your expertise
   - Organize into relevant categories

5. **Hero Section** (`components/sections/Hero.tsx`):
   - Update the tagline and description
   - Customize the heading

### Resume

1. Create your resume as a PDF
2. Name it `resume.pdf`
3. Place it in the `/public` folder
4. The download button will automatically work

### Styling

- Colors are defined using Tailwind CSS classes
- Main accent color: Emerald (#10b981) and Cyan (#06b6d4)
- To change colors, search and replace the color classes throughout the components

## 🛠 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Forms**: React Hook Form (ready to integrate)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to GitHub
2. Import your repository on Vercel
3. Vercel will automatically detect Next.js and configure the build
4. Your site will be live!

## 📱 Features Breakdown

### Custom Cursor
- Smooth-following cursor dot and ring
- Scales up when hovering over interactive elements
- Automatically disabled on touch devices

### Smooth Scroll
- CSS-based smooth scrolling
- Navigation links smoothly scroll to sections
- Custom scrollbar styling

### Animations
- Fade-in on scroll using Framer Motion's `useInView`
- Hover effects on cards and buttons
- Subtle background animations
- Stagger animations for lists

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Adaptive grid layouts
- Touch-friendly interactions

## 🎨 Color Palette

- Background: Slate shades (#0f172a, #1e293b, #334155)
- Primary: Emerald (#10b981, #059669)
- Secondary: Cyan (#06b6d4, #0891b2)
- Text: White (#ffffff) and Slate (#cbd5e1, #94a3b8)

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

---

Built with ❤️ for QA Engineers
