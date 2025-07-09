"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getLearningPlan } from "@/fetchers/json";
import { v4 as uuidv4 } from "uuid";
import { getCourse, patchCourse, getRecentCourses } from "@/fetchers/course";

const CourseCard = ({
  course,
  isExample = false,
}: {
  course: any;
  isExample?: boolean;
}) => {
  const router = useRouter();
  const getCourseTitle = () => {
    if (isExample) return course;
    return course.learningPlan?.title || decodeURIComponent(course.prompt);
  };

  const getCourseDescription = () => {
    if (isExample) return `Learn ${course} with expert guidance`;
    return (
      course.learningPlan?.description ||
      `Master ${decodeURIComponent(course.prompt)} through structured learning`
    );
  };

  const getLessonCount = () => {
    if (isExample) return 10;
    return course.learningPlan?.lessons?.length || 0;
  };

  const getEstimatedTime = () => {
    const lessons = getLessonCount();
    return `${lessons * 2}-${lessons * 3} hours`;
  };

  const getThumbnailGradient = () => {
    const gradients = [
      "blue-500 to-purple-600",
      "from-pink-400 to-red-500",
      "from-blue-400 to-cyan-500",
      "from-green-400 to-teal-500",
      "from-purple-400 to-pink-500",
      "from-indigo-400 to-purple-500",
      "from-yellow-400 to-orange-500",
      "from-red-400 to-pink-500",
    ];
    const title = getCourseTitle();
    const index =
      title
        .split("")
        .reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0) %
      gradients.length;
    return gradients[index];
  };

  const handleCourseClick = async () => {
    if (isExample) {
      try {
        const existingCourse = await getCourse(course);
        
        if (existingCourse?.id) {
          router.push(`/course/${existingCourse.id}`);
        } else {
          const plan = await getLearningPlan(course);
          
          const fullPlan = {
            ...plan,
            lessons: plan.lessons.map((lesson: string) => {
              return {
                lesson,
                id: uuidv4(),
              };
            }),
          };
          
          const savedCourse = await patchCourse(course, fullPlan);
          router.push(`/course/${savedCourse.id}`);
        }
      } catch (error) {
        console.error("Error creating/loading course:", error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-md group" onClick={handleCourseClick}>
      <div className={`relative h-45 flex items-center justify-center overflow-hidden bg-gradient-to-br from-${getThumbnailGradient()}`}>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-15 h-15 bg-white/95 rounded-full flex items-center justify-center text-xl text-gray-900 pl-1">
            ▶
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {getEstimatedTime()}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-normal text-gray-900 mb-3 line-clamp-2 leading-tight">{getCourseTitle()}</h3>
        <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-2">{getCourseDescription()}</p>
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <span className="font-medium">{getLessonCount()} lessons</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">Self-paced</span>
        </div>
      </div>
    </div>
  );
};

const examplePrompts = [
  "FFmpeg C++ Development",
  "Isomorphic JavaScript",
  "Introduction to Circuits",
  "Advanced Data Structures",
  "Assembly Code",
  "Embedded Rust Programming",
  "Autodesk's Fusion 360",
  "Apple 1",
];

export default function Home() {
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const courses = await getRecentCourses(5);
        setRecentCourses(courses);
      } catch (error) {
        console.error("Error fetching recent courses:", error);
      }
    };

    fetchRecentCourses();
  }, []);

  return (
    <>
      {isLoading && <div className="loading">Loading...</div>}
      {!isLoading && (
        <>
          <section className="text-center py-20 bg-gray-50 my-12 rounded-lg border border-gray-200">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-gray-900 text-4xl md:text-5xl lg:text-6xl font-bold mb-8">Learn anything you can imagine, affordably</h1>
              <p className="text-gray-700 text-lg md:text-xl lg:text-2xl leading-relaxed">
                Self-teaching at its finest - explore courses that are hard to
                find or expensive elsewhere
              </p>
            </div>
          </section>

          <section className="my-12">
            <div className="mb-8">
              <h2 className="text-gray-900 text-3xl md:text-4xl lg:text-5xl font-normal mb-3">Popular Courses</h2>
              <p className="text-gray-700 text-lg">Start your learning journey with these trending topics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {examplePrompts.map((prompt, index) => (
                <CourseCard
                  key={prompt}
                  course={prompt}
                  isExample={true}
                />
              ))}
            </div>
          </section>

          {recentCourses.length > 0 && (
            <section className="my-12">
              <div className="mb-8">
                <h2 className="text-gray-900 text-3xl md:text-4xl lg:text-5xl font-normal mb-3">Recently Created</h2>
                <p className="text-gray-700 text-lg">Continue learning with your recent courses</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {recentCourses.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <CourseCard course={course} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
