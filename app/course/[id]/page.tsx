"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCourseById } from "@/fetchers/course";
import { getLesson, patchLesson } from "@/fetchers/lesson";
import { getLessonSections, getSectionContent } from "@/fetchers/json";
import { patchCourse } from "@/fetchers/course";
import shared from "../../shared.module.scss";
import styles from "../../page.module.scss";

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
    <div className={styles.sectionItem}>
      <h5 className={styles.sectionTitle}>{sectionTitle}</h5>
      
      {!sectionContent ? (
        <button
          onClick={handleGenerateContent}
          disabled={isLoadingContent}
          className={shared.smallBtn}
        >
          {isLoadingContent
            ? "Generating Content..."
            : "Generate Section Content"}
        </button>
      ) : (
        <div className={styles.sectionContent}>
          <p className={styles.sectionText}>{sectionContent.content}</p>

          {sectionContent.keyPoints && sectionContent.keyPoints.length > 0 && (
            <div className={styles.contentBlock}>
              <strong className={styles.blockTitle}>Key Points:</strong>
              <ul className={styles.contentList}>
                {sectionContent.keyPoints.map((point: string, j: number) => (
                  <li key={`point${j}`} className={styles.listItem}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {sectionContent.examples && sectionContent.examples.length > 0 && (
            <div className={styles.contentBlock}>
              <strong className={styles.blockTitle}>Examples:</strong>
              <ul className={styles.contentList}>
                {sectionContent.examples.map((example: string, j: number) => (
                  <li key={`example${j}`} className={styles.listItem}>{example}</li>
                ))}
              </ul>
            </div>
          )}

          {sectionContent.exercises && sectionContent.exercises.length > 0 && (
            <div className={styles.contentBlock}>
              <strong className={styles.blockTitle}>Practice Exercises:</strong>
              <ul className={styles.contentList}>
                {sectionContent.exercises.map((exercise: string, j: number) => (
                  <li key={`exercise${j}`} className={styles.listItem}>{exercise}</li>
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
        className={styles.lessonItem}
      >
        {lesson.lesson}
      </li>
      {open && (
        <div className={styles.sectionsContainer}>
          <h4 className={styles.sectionsTitle}>Sections:</h4>
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
    return <div className={shared.loading}>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.courseHeader}>
        <h1 className={styles.courseTitle}>Learning Plan</h1>
        <div className={styles.coursePrompt}>
          <span className={styles.promptLabel}>Course Topic:</span>
          <span className={styles.promptText}>{decodeURIComponent(course.prompt)}</span>
        </div>
        <p className={styles.courseDescription}>Here is the learning plan for the course you requested:</p>
        <h2 className={styles.planTitle}>{course.learningPlan?.title}</h2>
      </div>
      <ul className={styles.learningPlan}>
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
  );
}