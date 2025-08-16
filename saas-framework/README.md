# Next.js 14+ SaaS Framework

A complete SaaS foundation built with modern technologies and best practices. This framework provides everything you need to kickstart your SaaS application development.

## 🚀 Features

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** components library
- **Airtable** integration ready
- **ESLint** for code quality
- **Geist** font family
- **Modern React 19** with latest features

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework | 15.4.6 |
| React | UI library | 19.1.0 |
| TypeScript | Type safety | ^5 |
| Tailwind CSS | Styling | ^4 |
| shadcn/ui | Component library | Latest |
| Airtable | Database | - |
| ESLint | Code linting | ^9 |

## 📦 Included Components

The following shadcn/ui components are pre-installed and ready to use:

- `Button` - Interactive buttons with multiple variants
- `Card` - Flexible container component
- `Input` - Form input fields
- `Label` - Form labels
- `Form` - Form handling with validation
- `Dropdown Menu` - Contextual menus
- `Navigation Menu` - Main navigation
- `Sheet` - Slide-out panels
- `Dialog` - Modal dialogs
- `Avatar` - User profile images

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone or use this framework
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.local` file and update the Airtable credentials:

```env
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
AIRTABLE_TABLE_NAME=your_table_name_here
AIRTABLE_TABLE_ID=your_airtable_table_id_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see your app!

## 📁 Project Structure

```
saas-framework/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with Tailwind v4
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── demo-components.tsx  # Demo showcase
│   └── lib/
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── components.json              # shadcn/ui configuration
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## 🎨 Styling

This project uses **Tailwind CSS v4** with the new CSS-first configuration approach. The styling is configured in `src/app/globals.css` with:

- CSS variables for theming
- Dark mode support
- Custom color palette
- Responsive design utilities

### Adding Custom Styles

You can customize the theme by modifying the CSS variables in `globals.css`:

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  /* ... more variables */
}
```

## 🧩 Component Usage

Import and use shadcn/ui components with proper TypeScript support:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## 🗄️ Database Integration

This framework is set up for Airtable integration. To connect your Airtable base:

1. Get your API key from [Airtable Account](https://airtable.com/account)
2. Find your Base ID from the API documentation
3. Update the `.env.local` file with your credentials
4. Create API routes or use the credentials in your components

### Example API Route

```typescript
// src/app/api/airtable/route.ts
export async function GET() {
  // Using table name (human-readable)
  const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`, {
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
  });
  
  // Alternative: Using table ID (more reliable for programmatic access)
  // const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`, {
  //   headers: {
  //     'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
  //   },
  // });
  
  const data = await response.json();
  return Response.json(data);
}
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:

- Netlify
- Railway
- Digital Ocean
- AWS
- Google Cloud

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Airtable API Documentation](https://airtable.com/developers/web/api)

---

**Happy coding!** 🎉
