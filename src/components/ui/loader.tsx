import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const ScissorLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <DotLottieReact
        src="https://lottie.host/67cdb4a1-dea7-4bc2-8dce-e1e7b82a0980/UY4FfXBoZ3.lottie"
        loop
        autoplay
        style={{
          width: "100vw",
          height: "100vh",
          maxWidth: 500,
          maxHeight: 500,
        }}
      />
    </div>
  );
};

export default ScissorLoader;
