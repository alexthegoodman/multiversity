"use client";

import TextareaAutosize from "react-textarea-autosize";

import shared from "./shared.module.scss";
import styles from "./page.module.scss";
import { useState } from "react";
import { getLearningPlan, getLessonSections } from "@/fetchers/json";
import { v4 as uuidv4 } from "uuid";
import { getCourse, patchCourse } from "@/fetchers/course";

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

const LessonItem = ({
  prompt,
  learningPlan,
  lesson,
}: {
  prompt: string;
  learningPlan: any;
  lesson: any;
}) => {
  const [open, setOpen] = useState(false);
  const [lessonSections, setLessonSections] = useState<any>([]);

  const handleLessonOpen = async () => {
    if (!open) {
      setOpen(true);

      if (lesson.sections) {
        setLessonSections(lesson.sections);
      } else {
        const sections = await getLessonSections(learningPlan.lessons, lesson);
        setLessonSections(sections.sections);

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
    }
  };

  return (
    <>
      <li onClick={handleLessonOpen}>{lesson.lesson}</li>
      {open && (
        <ul>
          {lessonSections?.map((section: string, i: number) => (
            <li key={`section${i}`}>{section}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState(0);
  const [learningPlan, setLearningPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLearning = async () => {
    setIsLoading(true);

    // check if learning plan exists
    const course = await getCourse(prompt);

    console.info("course retrieved", course);

    if (course?.id) {
      setLearningPlan(course.learningPlan);
      setStep(1);
      setIsLoading(false);
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

      setLearningPlan(fullPlan);
      setStep(1);
      setIsLoading(false);

      await patchCourse(prompt, fullPlan);

      console.info("course patched");
    }
  };

  const handleGetStarted = () => {
    setStep(2);
  };

  return (
    <>
      {isLoading && <div className={shared.loading}>Loading...</div>}
      {step === 0 && (
        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <span>Multiversity</span>
              <h1>Learn anything you can imagine, affordably</h1>
              <h5>Self-Teaching at its finest</h5>
              <p>
                Enter the name of a course you want to take, or try one of the
                courses shown below.
              </p>
              <div className={styles.glowWrap}>
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
            </div>
          </section>
        </main>
      )}
      {step === 1 && (
        <main className={styles.main}>
          <h1>Learning Plan</h1>
          <pre>{prompt}</pre>
          <p>Here is the learning plan for the course you requested:</p>
          <p>{learningPlan?.title}</p>
          <ul className={styles.learningPlan}>
            {learningPlan.lessons.map((lesson: string, i: number) => (
              <LessonItem
                key={`lesson${i}`}
                prompt={prompt}
                learningPlan={learningPlan}
                lesson={lesson}
              />
            ))}
          </ul>
          <h2>
            Look good? Get started by selecting a lesson, then diving into a
            section.
          </h2>
          {/* <button className={shared.btn} onClick={handleGetStarted}>
            Perfect! Get Started
          </button> */}
          <button className={shared.btn} onClick={handleStartLearning}>
            No thanks. Regenerate!
          </button>
        </main>
      )}
    </>
  );
}
