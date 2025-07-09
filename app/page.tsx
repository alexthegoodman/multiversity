"use client";

import TextareaAutosize from "react-textarea-autosize";
import Link from "next/link";
import { useRouter } from "next/navigation";

// No more SCSS imports - using Tailwind classes directly
import { useState, useEffect } from "react";
import { getLearningPlan } from "@/fetchers/json";
import { v4 as uuidv4 } from "uuid";
import { getCourse, patchCourse, getRecentCourses } from "@/fetchers/course";

const Sidebar = ({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) => {
  const sidebarItems = [
    { icon: '🏠', label: 'Home', active: true },
    { icon: '📚', label: 'My Courses', active: false },
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

const CourseCard = ({
  course,
  isExample = false,
  onClick,
}: {
  course: any;
  isExample?: boolean;
  onClick?: () => void;
}) => {
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
      "from-primary to-secondary",
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

  return (
    <div className="bg-white/95 rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl group" onClick={onClick}>
      <div className={`relative h-45 flex items-center justify-center overflow-hidden bg-gradient-to-br ${getThumbnailGradient()}`}>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-15 h-15 bg-white/90 rounded-full flex items-center justify-center text-xl text-primary pl-1">
            ▶
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {getEstimatedTime()}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{getCourseTitle()}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{getCourseDescription()}</p>
        <div className="flex items-center text-xs text-gray-500 gap-2">
          <span className="font-medium">{getLessonCount()} lessons</span>
          <span className="text-gray-300">•</span>
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
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const handleStartLearning = async () => {
    setIsLoading(true);

    try {
      // check if learning plan exists
      const course = await getCourse(prompt);

      console.info("course retrieved", course);

      if (course?.id) {
        router.push(`/course/${course.id}`);
      } else {
        // get new plan if not
        const plan = await getLearningPlan(prompt);

        const fullPlan = {
          ...plan,
          lessons: plan.lessons.map((lesson: string) => {
            return {
              lesson,
              id: uuidv4(),
            };
          }),
        };

        const savedCourse = await patchCourse(prompt, fullPlan);
        console.info("course patched");

        router.push(`/course/${savedCourse.id}`);
      }
    } catch (error) {
      console.error("Error creating/loading course:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <div className="loading">Loading...</div>}
      {!isLoading && (
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
                <span className="text-2xl font-bold text-primary whitespace-nowrap">Multiversity</span>
              </div>
              <div className="flex items-center flex-1 max-w-2xl gap-4">
                <div className="flex-1">
                  <TextareaAutosize
                    minRows={1}
                    placeholder="What do you want to learn about?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-primary/20 rounded-lg text-base bg-white text-gray-800 resize-none min-w-[300px] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                  />
                </div>
                <button
                  className="px-6 py-3 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-primary-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleStartLearning}
                  disabled={isLoading}
                >
                  Search
                </button>
              </div>
            </div>
          </nav>

          <div className="flex min-h-[calc(100vh-70px)]">
            <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <main className="flex-1 px-5 overflow-x-hidden">
            <section className="text-center py-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md my-8 rounded-2xl">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-lg">Learn anything you can imagine, affordably</h1>
                <p className="text-white/90 text-lg md:text-xl lg:text-2xl leading-relaxed">
                  Self-teaching at its finest - explore courses that are hard to
                  find or expensive elsewhere
                </p>
              </div>
            </section>

            <section className="my-12">
              <div className="mb-8">
                <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-2">Popular Courses</h2>
                <p className="text-white/80 text-lg">Start your learning journey with these trending topics</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {examplePrompts.map((prompt, index) => (
                  <CourseCard
                    key={prompt}
                    course={prompt}
                    isExample={true}
                    onClick={() => setPrompt(prompt)}
                  />
                ))}
              </div>
            </section>

            {recentCourses.length > 0 && (
              <section className="my-12">
                <div className="mb-8">
                  <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-2">Recently Created</h2>
                  <p className="text-white/80 text-lg">Continue learning with your recent courses</p>
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
          </main>
          </div>
        </div>
      )}
    </>
  );
}
