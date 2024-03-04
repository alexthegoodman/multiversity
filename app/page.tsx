"use client";

import TextareaAutosize from "react-textarea-autosize";

import shared from "./shared.module.scss";
import styles from "./page.module.scss";
import { useState } from "react";

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
  const [prompt, setPrompt] = useState("");

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span>Multiversity</span>
          <h1>Learn anything you can imagine, affordably</h1>
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
          <button className={shared.btn}>Start Learning</button>
          <div className={styles.examplePrompts}>
            <p>Many of these courses are hard to find or expensive elsewhere</p>
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
  );
}
