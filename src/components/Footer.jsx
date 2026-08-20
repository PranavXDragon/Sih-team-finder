import './Footer.css';
export default function Footer() {
  return (
    <footer className="foot">
      <p>
        <b>SIH 2026 Team Finder</b> — a free tool for Smart India Hackathon students.
      </p>
      <p style={{ maxWidth: 640, margin: "10px auto 0", fontSize: "12.4px" }}>
        This tool is not affiliated with Smart India Hackathon or any government body.
        Always check team rules on the official SIH portal.
        Your phone number and email stay hidden until you accept a request.
      </p>
    </footer>
  );
}


