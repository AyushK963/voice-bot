'use client';

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import Vapi from '@vapi-ai/web';

export interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
}

export interface VapiWidgetHandle {
  startCall: () => void;
  endCall: () => void;
}

const VapiWidget = forwardRef<VapiWidgetHandle, VapiWidgetProps>(
  ({ apiKey, assistantId }, ref) => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<
      Array<{ role: string; text: string }>
    >([]);
    const hasStartedRef = useRef(false);

    useEffect(() => {
      const vapiInstance = new Vapi(apiKey);
      setVapi(vapiInstance);

      vapiInstance.on('call-start', () => {
        setIsConnected(true);
        hasStartedRef.current = true;
      });

      vapiInstance.on('call-end', () => {
        setIsConnected(false);
        setIsSpeaking(false);
        setTranscript([]);
        hasStartedRef.current = false;
      });

      vapiInstance.on('speech-start', () => setIsSpeaking(true));
      vapiInstance.on('speech-end', () => setIsSpeaking(false));

      vapiInstance.on('message', (message) => {
        if (message.type === 'transcript') {
          setTranscript((prev) => [
            ...prev,
            { role: message.role, text: message.transcript },
          ]);
        }
      });

      vapiInstance.on('error', (error) => {
        console.error('Vapi error:', error);
      });

      return () => {
        vapiInstance?.stop();
      };
    }, [apiKey]);

    useImperativeHandle(ref, () => ({
      startCall: () => {
        if (vapi && !hasStartedRef.current) {
          vapi.start(assistantId);
        } else {
          vapi?.stop();
          setTimeout(() => vapi?.start(assistantId), 300);
        }
      },
      endCall: () => {
        vapi?.stop();
      },
    }));

    return (
      <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out">
        {isConnected && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 w-80 shadow-2xl animate-fade-in-up">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isSpeaking ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold text-gray-800">
                  {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
                </span>
              </div>
              <button
                onClick={() => vapi?.stop()}
                className="bg-red-500 text-white rounded-md px-3 py-1.5 text-sm hover:bg-red-600 transition-colors"
              >
                End Call
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto bg-gray-50 p-2 rounded-lg">
              {transcript.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Conversation will appear here...
                </p>
              ) : (
                transcript.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span
                      className={`inline-block max-w-[80%] px-3 py-2 rounded-xl text-sm text-white ${
                        msg.role === 'user'
                          ? 'bg-emerald-600'
                          : 'bg-gray-700'
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

VapiWidget.displayName = 'VapiWidget';

export default VapiWidget;
