"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Phone, CheckCircle } from "lucide-react";

export function VoiceClient({
  token,
  refereeName,
  candidateName,
  positionApplied,
  relationship,
  company,
}: {
  token: string;
  refereeName: string;
  candidateName: string;
  positionApplied: string;
  relationship: string;
  company: string;
}) {
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "completed" | "error">("idle");
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  async function startSession() {
    setStatus("connecting");
    setError(null);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // TODO: Integrate Gemini 3.1 Flash Live API via WebSocket
      // For now, show a placeholder message
      setStatus("active");
      setTranscript([
        {
          role: "assistant",
          text: `Hello ${refereeName}! I'm the VeReference AI assistant. I'd like to ask you a few questions about your experience working with ${candidateName} for the ${positionApplied} position. This conversation will be recorded and transcribed. Shall we begin?`,
        },
      ]);

      // Clean up stream when done
      stream.getTracks().forEach(track => track.stop());

    } catch (err) {
      setStatus("error");
      setError("Could not access microphone. Please allow microphone access and try again.");
    }
  }

  async function endSession() {
    setStatus("completed");
    // TODO: Save transcript and process responses
  }

  if (status === "completed") {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-muted-foreground">
          Your voice reference for {candidateName} has been recorded. We'll process the transcript and share the results with the hiring team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Status indicator */}
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            {status === "idle" && (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Click the button below to start your voice reference. You'll have a brief conversation with our AI assistant.
                </p>
                <Button onClick={startSession} size="lg">
                  <Mic className="h-4 w-4 mr-2" />
                  Start Voice Session
                </Button>
              </>
            )}

            {status === "connecting" && (
              <>
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Mic className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-muted-foreground">Connecting...</p>
              </>
            )}

            {status === "active" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-green-600 animate-pulse" />
                </div>
                <p className="text-sm text-green-600 font-medium mb-4">Session Active</p>
                <Button onClick={endSession} variant="destructive" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <MicOff className="h-8 w-8 text-red-600" />
                </div>
                <Button onClick={startSession} variant="outline">
                  Try Again
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live transcript */}
      {transcript.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Transcript</h3>
            <div className="space-y-3">
              {transcript.map((entry, i) => (
                <div key={i} className={`flex ${entry.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      entry.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-muted-foreground">
        This conversation is recorded and transcribed. By continuing, you consent to the processing of your voice data.
      </p>
    </div>
  );
}
