import { Suspense } from "react";
import VideoEditingPage from "../components/video-Agency/Video-Agency";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Video Agency...</div>}>
            <VideoEditingPage />
        </Suspense>
    );
}
