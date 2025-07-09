"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/fetchers/course";

export default function CoursePage() {
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

  const createLessonSlug = (lessonTitle: string) => {
    return lessonTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const createSectionSlug = (sectionTitle: string) => {
    return sectionTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

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

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-200">
        <h1 className="text-gray-900 mb-6 text-4xl md:text-5xl lg:text-6xl font-bold">
          {course.learningPlan?.title}
        </h1>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
          <span className="font-medium text-gray-700 block mb-2">Course Topic:</span>
          <span className="text-gray-900 text-lg">{decodeURIComponent(course.prompt)}</span>
        </div>
        <p className="text-gray-700 mb-4 leading-relaxed">
          Welcome to your personalized learning journey! Use the sidebar to navigate through lessons and sections. 
          Each section contains detailed content, key points, examples, and practice exercises.
        </p>
      </div>

      {/* Course Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h2 className="text-3xl font-normal text-gray-900 mb-6">Course Overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Total Lessons</h3>
            <p className="text-2xl font-bold text-gray-900">
              {course.learningPlan?.lessons?.length || 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Learning Style</h3>
            <p className="text-gray-700">Self-paced, Interactive</p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-3xl font-normal text-gray-900 mb-4">Getting Started</h2>
        <p className="text-gray-700 mb-4">
          Ready to begin your learning journey? Start with the first lesson by clicking on it in the sidebar, 
          or jump to any specific section that interests you.
        </p>
        
        {course.learningPlan?.lessons?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Start:</h3>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {course.learningPlan.lessons[0].lesson}
                  </h4>
                  <p className="text-sm text-gray-600">First lesson in the course</p>
                </div>
                <div className="text-gray-700 font-medium">
                  ← Click in sidebar to start
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-normal text-gray-900 mb-6">All Lessons</h2>
        <div className="space-y-4">
          {course.learningPlan?.lessons?.map((lesson: any, index: number) => (
            <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {lesson.lesson}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click on this lesson in the sidebar to explore its sections
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}