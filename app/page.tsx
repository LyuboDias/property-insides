import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  // Main page with two input fields for RightMove and Zoopla links
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Property Link Submission</h1>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
          <label>
            RightMove
            <input type="url" name="rightmove" placeholder="Enter RightMove link" style={{ width: '100%' }} />
          </label>
          <label>
            Zoopla
            <input type="url" name="zoopla" placeholder="Enter Zoopla link" style={{ width: '100%' }} />
          </label>
        </form>
      </main>
    </div>
  );
}
