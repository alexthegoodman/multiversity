"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCourseById } from "@/fetchers/course";
import { getSectionContent } from "@/fetchers/json";
import { getYouTubeVideos } from "@/fetchers/youtube";

interface SectionContent {
  content: string;
  keyPoints?: string[];
  examples?: string[];
  exercises?: string[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
}

export default function SectionPage() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonSlug = params.lesson as string;
  const sectionSlug = params.section as string;

  const [course, setCourse] = useState<any>(null);
  const [sectionContent, setSectionContent] = useState<SectionContent | null>(
    null
  );
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertSlugToTitle = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const findLessonAndSection = (
    course: any,
    lessonSlug: string,
    sectionSlug: string
  ) => {
    if (!course?.learningPlan?.lessons) return { lesson: null, section: null };

    const lessonTitle = convertSlugToTitle(lessonSlug);
    const sectionTitle = convertSlugToTitle(sectionSlug);

    // Find lesson by comparing slugified versions
    const lesson = course.learningPlan.lessons.find((l: any) => {
      const slugified = l.lesson
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      return slugified === lessonSlug;
    });

    if (!lesson) return { lesson: null, section: null };

    // Find section in lesson
    const sections = lesson.sections?.sections || lesson.sections || [];
    const section = sections.find((s: string) => {
      const slugified = s
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      return slugified === sectionSlug;
    });

    return { lesson, section };
  };

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

  useEffect(() => {
    const loadSectionContent = async () => {
      if (!course) return;

      const { lesson, section } = findLessonAndSection(
        course,
        lessonSlug,
        sectionSlug
      );

      if (lesson && section) {
        setIsLoadingContent(true);
        try {
          const content = await getSectionContent(
            lesson.lesson,
            section,
            courseId
          );
          setSectionContent(content);

          // Load YouTube videos after content is loaded
          setIsLoadingVideos(true);
          try {
            const videos = await getYouTubeVideos(lesson.lesson, section);
            setYoutubeVideos(videos);
          } catch (videoError) {
            console.error("Error loading YouTube videos:", videoError);
            // Don't set error for videos, just log it
          } finally {
            setIsLoadingVideos(false);
          }
        } catch (error) {
          console.error("Error loading section content:", error);
          setError("Failed to load section content");
        } finally {
          setIsLoadingContent(false);
        }
      }
    };

    loadSectionContent();
  }, [course, lessonSlug, sectionSlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Course not found</div>
      </div>
    );
  }

  const { lesson, section } = findLessonAndSection(
    course,
    lessonSlug,
    sectionSlug
  );

  if (!lesson || !section) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 font-semibold mb-2">
            Section Not Found
          </h2>
          <p className="text-yellow-700">
            The requested lesson or section could not be found in this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <span className="font-medium text-gray-900">
          {course.learningPlan.title}
        </span>
        <span className="mx-2">•</span>
        <span className="font-medium">{lesson.lesson}</span>
        <span className="mx-2">•</span>
        <span>{section}</span>
      </nav>

      {/* Section Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {section}
        </h1>
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
          <p className="text-gray-800 font-medium">Part of: {lesson.lesson}</p>
        </div>
      </div>

      {/* Section Content */}
      {isLoadingContent ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">
            Loading section content...
          </div>
        </div>
      ) : sectionContent ? (
        <div className="space-y-8">
          {/* YouTube Videos */}
          {(isLoadingVideos || youtubeVideos.length > 0) && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-normal text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-600">📺</span>
                Related Videos
              </h3>
              {isLoadingVideos ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading videos...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {youtubeVideos.slice(0, 2).map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${video.id}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {video.channelTitle}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="prose max-w-none">
              <p className="text-gray-900 leading-relaxed text-lg">
                {sectionContent.content}
              </p>
            </div>
          </div>

          {/* Key Points */}
          {sectionContent.keyPoints && sectionContent.keyPoints.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-normal text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-600">🎯</span>
                Key Points
              </h3>
              <ul className="space-y-3">
                {sectionContent.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-600 font-bold mt-1">•</span>
                    <span className="text-gray-800 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {sectionContent.examples && sectionContent.examples.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-normal text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-600">💡</span>
                Examples
              </h3>
              <div className="space-y-4 whitespace-break-spaces">
                {sectionContent.examples.map((example, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <p className="text-gray-800 leading-relaxed">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Exercises */}
          {sectionContent.exercises && sectionContent.exercises.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-normal text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-600">🏋️</span>
                Practice Exercises
              </h3>
              <div className="space-y-4">
                {sectionContent.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded mt-1">
                        {index + 1}
                      </span>
                      <p className="text-gray-800 leading-relaxed flex-1">
                        {exercise}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Content Not Available
          </h3>
          <p className="text-gray-600">
            This section's content hasn't been generated yet. Please check back
            later.
          </p>
        </div>
      )}
    </div>
  );
}
