# Multiversity - AI-Powered Learning Platform

A personalized learning platform that generates AI-powered courses on any topic. Built with Next.js, Prisma, and OpenAI.

## Features

- **AI-Generated Courses**: Create comprehensive learning plans for any topic
- **Lesson Caching**: Efficient database caching for lessons and content
- **Interactive Learning**: Expandable lessons with sections and detailed content
- **Progress Tracking**: Track learning progress through lessons and sections
- **Responsive Design**: Works on desktop and mobile devices

## Recent Improvements

- ✅ **Database Lesson Caching**: Added `Lesson` model for efficient content storage
- ✅ **Enhanced Content Generation**: Rich lesson content with key points, examples, and exercises
- ✅ **Better Error Handling**: Improved error responses and user feedback
- ✅ **Performance Optimizations**: Reduced API calls through smart caching
- ✅ **Progress Tracking API**: Foundation for tracking user progress

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up the database**:
```bash
npx prisma migrate dev
```

3. **Configure environment variables**:
```bash
cp .env.example .env.local
# Add your OpenAI API key and database URL
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
