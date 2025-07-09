"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/fetchers/course";
import { getLesson, patchLesson } from "@/fetchers/lesson";
import { getLessonSections } from "@/fetchers/json";
import { patchCourse } from "@/fetchers/course";

interface LessonSidebarProps {
  course: any;
  courseId: string;
}

const LessonSidebar = ({ course, courseId }: LessonSidebarProps) => {
  const [expandedLessons, setExpandedLessons] = useState<string[]>([]);
  const [lessonSections, setLessonSections] = useState<{
    [key: string]: string[];
  }>({});
  const pathname = usePathname();

  const toggleLesson = async (lessonId: string, lessonTitle: string) => {
    const isExpanded = expandedLessons.includes(lessonId);

    if (isExpanded) {
      setExpandedLessons(expandedLessons.filter((id) => id !== lessonId));
    } else {
      setExpandedLessons([...expandedLessons, lessonId]);

      // Load sections if not already loaded
      if (!lessonSections[lessonId]) {
        try {
          const cachedLesson = await getLesson(courseId, lessonTitle);

          if (cachedLesson && cachedLesson.sections) {
            const sections =
              cachedLesson.sections.sections || cachedLesson.sections;
            setLessonSections((prev) => ({
              ...prev,
              [lessonId]: sections,
            }));
          } else {
            const sections = await getLessonSections(
              course.learningPlan.lessons,
              // { lesson: lessonTitle, id: lessonId }
              lessonTitle
            );
            setLessonSections((prev) => ({
              ...prev,
              [lessonId]: sections.sections,
            }));

            await patchLesson(courseId, lessonTitle, sections);

            const fullPlan = {
              ...course.learningPlan,
              lessons: course.learningPlan.lessons.map((les: any) => {
                if (les.id === lessonId) {
                  return {
                    ...les,
                    ...sections,
                  };
                } else {
                  return les;
                }
              }),
            };

            await patchCourse(decodeURIComponent(course.prompt), fullPlan);
          }
        } catch (error) {
          console.error("Error loading lesson sections:", error);
        }
      }
    }
  };

  const createSectionSlug = (sectionTitle: string) => {
    return sectionTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const createLessonSlug = (lessonTitle: string) => {
    return lessonTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  return (
    <aside className="w-80 bg-white/90 backdrop-blur-md border-r border-white/20 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Course Lessons
          </h3>
          <p className="text-sm text-gray-600">{course.learningPlan?.title}</p>
        </div>

        <nav className="space-y-2">
          {course.learningPlan?.lessons?.map((lesson: any, index: number) => {
            const lessonSlug = createLessonSlug(lesson.lesson);
            const isExpanded = expandedLessons.includes(lesson.id);
            const sections = lessonSections[lesson.id] || [];

            return (
              <div
                key={lesson.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleLesson(lesson.id, lesson.lesson)}
                  className="w-full p-3 text-left bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {lesson.lesson}
                    </span>
                  </div>
                  <span
                    className={`text-gray-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                </button>

                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {sections.length > 0 ? (
                      <div className="py-2">
                        {sections.map(
                          (section: string, sectionIndex: number) => {
                            const sectionSlug = createSectionSlug(section);
                            const sectionPath = `/course/${courseId}/lesson/${lessonSlug}/section/${sectionSlug}`;
                            const isActive = pathname === sectionPath;

                            return (
                              <Link
                                key={sectionIndex}
                                href={sectionPath}
                                className={`block px-6 py-2 text-sm transition-colors ${
                                  isActive
                                    ? "bg-blue-100 text-blue-800 border-r-2 border-blue-600"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {section}
                              </Link>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-3 text-sm text-gray-500">
                        Loading sections...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return <div className="loading">Loading course...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="flex">
      <LessonSidebar course={course} courseId={courseId} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
