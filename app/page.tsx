import Feed from "@/components/Feed";
import News from "@/components/News";
import Sidebar from "@/components/Sidebar";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
   
  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-[18%] flex-shrink-0">
            <Sidebar user={user} />
          </div>
          
          {/* Main Feed */}
          <div className="flex-1">
            <Feed user={user} />
          </div>
          
          {/* News Section */}
          <div className="hidden md:block w-[30%] flex-shrink-0">
            <News />
          </div>
        </div>
      </div>
    </main>
  );
}
