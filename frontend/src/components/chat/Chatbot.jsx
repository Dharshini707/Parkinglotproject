import React, { useEffect } from "react";

const Chatbot = () => {
  useEffect(() => {
    const scriptId = "dialogflow-messenger-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Outer glow wrapper using Tailwind */}
      <div className="rounded-full p-[2px] bg-gradient-to-r from-green-400 to-teal-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]">
        
        <df-messenger
  chat-title="ParkingLotFinderAssistant"
  agent-id="68f72fb7-20ad-4178-b97c-ba60a4459c56"
  language-code="en"
></df-messenger>

      </div>
    </div>
  );
};

export default Chatbot;