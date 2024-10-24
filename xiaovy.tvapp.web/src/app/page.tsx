import { ThemeSwitch } from "@/app/themeSwitch";
import { ThemeSelector } from "@/app/themeSelector";
import { Main } from "@/components/shared/Main"

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-0 xl:p-14">
      <h2 className="text-2xl font-bold">Light/Dark mode switch on Next.js <ThemeSelector /></h2>
      <div className="mt-4 h-10">
        <ThemeSwitch />
      </div>
      <Main />
    </main>
  );
}
