"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/fetchers/course";
import { getLesson, patchLesson } from "@/fetchers/lesson";
import { getLessonSections, getSectionContent } from "@/fetchers/json";
import { patchCourse } from "@/fetchers/course";
// No more SCSS imports - using Tailwind classes directly

const Sidebar = ({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) => {
  const sidebarItems = [
    { icon: '🏠', label: 'Home', active: false },
    { icon: '📚', label: 'My Courses', active: true },
    { icon: '📖', label: 'Learning Path', active: false },
    { icon: '⭐', label: 'Favorites', active: false },
    { icon: '📊', label: 'Progress', active: false },
    { icon: '⚙️', label: 'Settings', active: false },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-15' : 'w-60'} bg-white/95 backdrop-blur-md border-r border-white/20 transition-all duration-300 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto`}>
      <div className="p-4 h-full flex flex-col">
        <nav className="flex-1">
          {sidebarItems.map((item, index) => (
            <div key={index} className={`flex items-center gap-4 p-3 text-gray-600 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1 hover:bg-primary/10 hover:text-primary ${item.active ? 'bg-primary/15 text-primary font-semibold' : ''}`}>
              <span className="text-xl min-w-[20px] text-center">{item.icon}</span>
              {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </div>
          ))}
        </nav>
        
        {!isCollapsed && (
          <div className="border-t border-primary/10 pt-4 mt-4">
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-4">Quick Actions</h4>
              <div className="flex items-center gap-4 p-3 text-gray-600 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1 hover:bg-primary/10 hover:text-primary">
                <span className="text-xl min-w-[20px] text-center">➕</span>
                <span className="text-sm whitespace-nowrap">Create Course</span>
              </div>
              <div className="flex items-center gap-4 p-3 text-gray-600 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1 hover:bg-primary/10 hover:text-primary">
                <span className="text-xl min-w-[20px] text-center">🔍</span>
                <span className="text-sm whitespace-nowrap">Browse All</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

const SectionItem = ({
  lessonTitle,
  sectionTitle,
  courseId,
}: {
  lessonTitle: string;
  sectionTitle: string;
  courseId: string;
}) => {
  const [sectionContent, setSectionContent] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const handleGenerateContent = async () => {
    setIsLoadingContent(true);

    try {
      const content = await getSectionContent(lessonTitle, sectionTitle);
      setSectionContent(content);

      // TODO: Update storage to save individual section content
    } catch (error) {
      console.error("Error generating section content:", error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  return (
    <div className="mb-6 pl-4">
      <h5 className="text-gray-800 mb-3 text-lg font-semibold">{sectionTitle}</h5>
      
      {!sectionContent ? (
        <button
          onClick={handleGenerateContent}
          disabled={isLoadingContent}
          className="btn-small"
        >
          {isLoadingContent
            ? "Generating Content..."
            : "Generate Section Content"}
        </button>
      ) : (
        <div className="bg-white/90 p-6 rounded-lg shadow-md border border-white/30">
          <p className="text-gray-800 leading-relaxed mb-4">{sectionContent.content}</p>

          {sectionContent.keyPoints && sectionContent.keyPoints.length > 0 && (
            <div className="mb-6 last:mb-0">
              <strong className="text-primary text-base font-semibold mb-2 block">Key Points:</strong>
              <ul className="m-0 pl-6 list-disc">
                {sectionContent.keyPoints.map((point: string, j: number) => (
                  <li key={`point${j}`} className="text-gray-800 mb-2 leading-relaxed list-disc">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {sectionContent.examples && sectionContent.examples.length > 0 && (
            <div className="mb-6 last:mb-0">
              <strong className="text-primary text-base font-semibold mb-2 block">Examples:</strong>
              <ul className="m-0 pl-6 list-disc">
                {sectionContent.examples.map((example: string, j: number) => (
                  <li key={`example${j}`} className="text-gray-800 mb-2 leading-relaxed list-disc">{example}</li>
                ))}
              </ul>
            </div>
          )}

          {sectionContent.exercises && sectionContent.exercises.length > 0 && (
            <div className="mb-6 last:mb-0">
              <strong className="text-primary text-base font-semibold mb-2 block">Practice Exercises:</strong>
              <ul className="m-0 pl-6 list-disc">
                {sectionContent.exercises.map((exercise: string, j: number) => (
                  <li key={`exercise${j}`} className="text-gray-800 mb-2 leading-relaxed list-disc">{exercise}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LessonItem = ({
  prompt,
  learningPlan,
  lesson,
  courseId,
}: {
  prompt: string;
  learningPlan: any;
  lesson: any;
  courseId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [lessonSections, setLessonSections] = useState<any>([]);

  const handleLessonOpen = async () => {
    if (!open) {
      setOpen(true);

      try {
        const cachedLesson = await getLesson(courseId, lesson.lesson);

        if (cachedLesson && cachedLesson.sections) {
          setLessonSections(
            cachedLesson.sections.sections || cachedLesson.sections
          );
        } else {
          const sections = await getLessonSections(
            learningPlan.lessons,
            lesson
          );
          setLessonSections(sections.sections);

          await patchLesson(courseId, lesson.lesson, sections);

          const fullPlan = {
            ...learningPlan,
            lessons: learningPlan.lessons.map((les: any) => {
              if (les.id === lesson.id) {
                return {
                  ...les,
                  ...sections,
                };
              } else {
                return les;
              }
            }),
          };

          await patchCourse(prompt, fullPlan);
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
      }
    }
  };

  return (
    <>
      <li
        onClick={handleLessonOpen}
        className="text-lg p-5 rounded-xl bg-white/95 text-gray-800 cursor-pointer mb-3 shadow-lg backdrop-blur-md border border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:bg-white font-semibold hover:text-primary"
      >
        {lesson.lesson}
      </li>
      {open && (
        <div className="ml-5 mt-4 p-4 bg-white/50 rounded-lg border-l-3 border-primary">
          <h4 className="text-gray-800 mb-4 text-xl font-semibold">Sections:</h4>
          {lessonSections?.map((section: string, i: number) => (
            <SectionItem
              key={`section${i}`}
              lessonTitle={lesson.lesson}
              sectionTitle={section}
              courseId={courseId}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (err) {
        setError("Failed to load course");
        console.error("Error fetching course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <nav className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-white/20 z-50 py-2">
        <div className="w-full px-5 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <button 
              className="bg-none border-none text-xl text-primary cursor-pointer p-2 rounded transition-colors hover:bg-primary/10"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              ☰
            </button>
            <Link href="/" className="text-2xl font-bold text-primary whitespace-nowrap">Multiversity</Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="text-primary hover:underline">Home</Link>
            <span className="text-gray-400">/</span>
            <span>Course</span>
          </div>
        </div>
      </nav>
      
      <div className="flex min-h-[calc(100vh-70px)]">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 px-5 overflow-x-hidden">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-lg border border-white/20">
          <h1 className="text-gray-800 mb-4 text-4xl md:text-5xl lg:text-6xl font-bold">Learning Plan</h1>
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
            <span className="font-semibold text-primary block mb-2">Course Topic:</span>
            <span className="text-gray-800 text-lg">{decodeURIComponent(course.prompt)}</span>
          </div>
          <p className="text-gray-600 mb-4">Here is the learning plan for the course you requested:</p>
          <h2 className="text-gray-800 text-2xl md:text-3xl lg:text-4xl font-semibold mb-0">{course.learningPlan?.title}</h2>
        </div>
        <ul className="block list-none mt-8">
          {course.learningPlan.lessons.map((lesson: string, i: number) => (
            <LessonItem
              key={`lesson${i}`}
              prompt={decodeURIComponent(course.prompt)}
              learningPlan={course.learningPlan}
              lesson={lesson}
              courseId={courseId}
            />
          ))}
        </ul>
      </main>
      </div>
    </div>
  );
}