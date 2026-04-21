# User Ninjas - AI-Powered UX Research Platform

## Project Info

**URL**: https://userninjas.in

## Getting Started

### Local Development

To work locally using your own IDE, follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and instant preview.
npm run dev
```

### Edit Files Directly

- Navigate to the desired file(s)
- Make your changes and commit them
- Push changes to update the repository

### Using GitHub Codespaces

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit your changes when done

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- React Router
- shadcn-ui
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Zustand (State Management)

## Environment Variables

Create a `.env` file in the root directory with the following:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_GROQ_API_KEY=your_groq_api_key
```

## Deployment

The project can be deployed to various platforms:

- Vercel (see `vercel.json`)
- Netlify
- Azure
- AWS
- Any Node.js hosting platform

### Build for Production

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Features

- **AI-Powered Insights**: Get intelligent analysis of user testing data
- **Real User Testing**: Connect with qualified testers in your target audience
- **Test Templates**: Pre-built templates for common research scenarios
- **Analytics Dashboard**: Track metrics and analyze results in real-time
- **Researcher Tools**: Comprehensive tools for UX researchers
- **Recruiter Dashboard**: Manage candidates and interviews
- **Tester Portal**: Dashboard for test participants
