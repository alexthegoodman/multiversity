"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { useRouter } from "next/navigation";
import { getLearningPlan } from "@/fetchers/json";
import { v4 as uuidv4 } from "uuid";
import { getCourse, patchCourse } from "@/fetchers/course";

const inter = Inter({ subsets: ["latin"] });

const Sidebar = ({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) => {
  const pathname = usePathname();

  const sidebarItems = [
    { icon: "🏠", label: "Home", active: pathname === "/" },
    {
      icon: "📚",
      label: "My Courses",
      active: pathname?.startsWith("/course"),
    },
    { icon: "📖", label: "Learning Path", active: false },
    { icon: "⭐", label: "Favorites", active: false },
    { icon: "📊", label: "Progress", active: false },
    { icon: "⚙️", label: "Settings", active: false },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-15" : "w-60"
      } bg-white border-r border-gray-200 transition-all duration-300 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto`}
    >
      <div className="p-4 h-full flex flex-col">
        <nav className="flex-1">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 text-gray-700 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1 hover:bg-gray-100 hover:text-gray-900 ${
                item.active ? "bg-gray-100 text-gray-900 font-medium" : ""
              }`}
            >
              <span className="text-xl min-w-[20px] text-center">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-4">
                Quick Actions
              </h4>
              <div className="flex items-center gap-4 p-3 text-gray-700 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1 hover:bg-gray-100 hover:text-gray-900">
                <span className="text-xl min-w-[20px] text-center">➕</span>
                <span className="text-sm whitespace-nowrap">Create Course</span>
              </div>
              <div className="flex items-center gap-4 p-3 text-gray-700 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1 hover:bg-gray-100 hover:text-gray-900">
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

const Header = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  showSearch = false,
}: {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  showSearch?: boolean;
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleStartLearning = async () => {
    setIsLoading(true);

    try {
      const course = await getCourse(prompt);

      if (course?.id) {
        router.push(`/course/${course.id}`);
      } else {
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
        router.push(`/course/${savedCourse.id}`);
      }
    } catch (error) {
      console.error("Error creating/loading course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 z-50 py-2">
      <div className="w-full px-5 flex items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <button
            className="bg-none border-none text-xl text-gray-700 cursor-pointer p-2 rounded transition-colors hover:bg-gray-100"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 whitespace-nowrap"
          >
            Multiversity
          </Link>
        </div>

        {showSearch && (
          <div className="flex items-center flex-1 max-w-2xl gap-4">
            <div className="flex-1">
              <TextareaAutosize
                minRows={1}
                placeholder="What do you want to learn about?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-base bg-white text-gray-900 resize-none min-w-[300px] focus:outline-none focus:border-gray-600 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]"
              />
            </div>
            <button
              className="px-6 py-3 bg-gray-900 text-white border-none rounded-lg text-base font-normal cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleStartLearning}
              disabled={isLoading}
            >
              Search
            </button>
          </div>
        )}

        {!showSearch && pathname !== "/" && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="text-gray-700 hover:underline">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span>Course</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            showSearch={pathname === "/"}
          />
          <div className="flex min-h-[calc(100vh-70px)]">
            <Sidebar
              isCollapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className="flex-1 px-5 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
