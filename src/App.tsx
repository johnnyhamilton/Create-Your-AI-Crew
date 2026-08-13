import React, { useState } from 'react';
import { AppState, FoundationRecord, SpecialistRecord } from './types';
import { Header } from './components/Header';
import { WelcomeState } from './components/WelcomeState';
import { ChatState } from './components/ChatState';
import { DeliveryState } from './components/DeliveryState';

export default function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [foundationRecord, setFoundationRecord] = useState<FoundationRecord | null>(null);
  const [specialistRecord, setSpecialistRecord] = useState<SpecialistRecord | null>(null);

  const handleStartChat = () => {
    setAppState('chat');
  };

  const handleRecordsReady = (foundation: FoundationRecord, specialist: SpecialistRecord) => {
    setFoundationRecord(foundation);
    setSpecialistRecord(specialist);
    setAppState('delivery');
  };

  const handleReset = () => {
    setFoundationRecord(null);
    setSpecialistRecord(null);
    setAppState('welcome');
  };

  return (
    <div className="min-h-screen bg-white text-[#1B1B1B] flex flex-col font-sans">
      <Header appState={appState} onReset={handleReset} />

      <main className="flex-1">
        {appState === 'welcome' && (
          <WelcomeState onStart={handleStartChat} />
        )}

        {appState === 'chat' && (
          <ChatState onRecordsReady={handleRecordsReady} />
        )}

        {appState === 'delivery' && foundationRecord && specialistRecord && (
          <DeliveryState
            foundationRecord={foundationRecord}
            specialistRecord={specialistRecord}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
