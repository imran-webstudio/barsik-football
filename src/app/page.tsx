import { MatchPoster } from "~/app/_components/match-poster";
import { RegisterForm } from "~/app/_components/register-form";

export default function Home() {
  return (
    <div className="night-app min-h-svh overflow-x-clip">
      <div className="grid min-h-svh min-w-0 lg:grid-cols-2">
        <MatchPoster />
        <main className="flex min-w-0 justify-center bg-[#07180f] px-4 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:min-h-svh lg:items-center lg:px-16 lg:py-12">
          <div className="w-full">
            <RegisterForm />
          </div>
        </main>
      </div>
    </div>
  );
}
