import Hello from "./components/hello";

export default function Home() {
  console.log("what am i doing here? -- SERVER/CLIENT?");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to the matrix</h1>
      <h2 className="text-2xl font-bold">Created by Sudais </h2>
      <h3 className="text-2xl font-bold">let's goooooooooooooo</h3>
      <Hello />
    </main>
  );
}
