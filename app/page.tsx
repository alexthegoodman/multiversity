"use client";

import TextareaAutosize from "react-textarea-autosize";
import Link from "next/link";
import { useRouter } from "next/navigation";

import shared from "./shared.module.scss";
import styles from "./page.module.scss";
import glowStyles from "./glow.module.scss";
import { useState, useEffect } from "react";
import { getLearningPlan } from "@/fetchers/json";
import { v4 as uuidv4 } from "uuid";
import { getCourse, patchCourse, getRecentCourses } from "@/fetchers/course";

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
      {isLoading && <div className={shared.loading}>Loading...</div>}
      {!isLoading && (
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <span className={styles.brandName}>Multiversity</span>
              <h1>Learn anything you can imagine, affordably</h1>
              <h5>Self-Teaching at its finest</h5>
              <p>
                Enter the name of a course you want to take, or try one of the
                courses shown below.
              </p>
              <div className={glowStyles.glowWrap}>
                <TextareaAutosize
                  minRows={4}
                  placeholder="What do you want to learn about?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <button
                className={shared.btn}
                onClick={handleStartLearning}
                disabled={isLoading}
              >
                Start Learning
              </button>
              <div className={styles.examplePrompts}>
                <p>
                  Many of these courses are hard to find or expensive elsewhere
                </p>
                <ul>
                  {examplePrompts.map((prompt) => (
                    <li key={prompt}>
                      <button
                        className={shared.smallBtn}
                        onClick={() => setPrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {recentCourses.length > 0 && (
                <div className={styles.examplePrompts}>
                  <p>Recently created courses</p>
                  <ul>
                    {recentCourses.map((course) => (
                      <li key={course.id}>
                        <Link href={`/course/${course.id}`}>
                          <button className={shared.smallBtn}>
                            {course.learningPlan?.title ||
                              decodeURIComponent(course.prompt)}
                          </button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </>
  );
}
