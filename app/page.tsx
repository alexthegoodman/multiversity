"use client";

import TextareaAutosize from "react-textarea-autosize";

import shared from "./shared.module.scss";
import styles from "./page.module.scss";
import { useState } from "react";
import { getLearningPlan, getLessonSections } from "@/fetchers/json";

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
  allLessons,
  lesson,
}: {
  allLessons: string[];
  lesson: string;
}) => {
  const [open, setOpen] = useState(false);
  const [lessonSections, setLessonSections] = useState<any>(null);

  const handleLessonOpen = async () => {
    if (!open) {
      setOpen(true);
      const sections = await getLessonSections(allLessons, lesson);
      setLessonSections(sections);
    }
  };

  return (
    <>
      <li onClick={handleLessonOpen}>{lesson}</li>
      {open && (
        <ul>
          {lessonSections?.sections?.map((section: string, i: number) => (
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
    const plan = await getLearningPlan(prompt);
    setLearningPlan(plan);
    setStep(1);
    setIsLoading(false);
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
                allLessons={learningPlan.lessons}
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
