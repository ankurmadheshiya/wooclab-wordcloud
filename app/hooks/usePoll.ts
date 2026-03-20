"use client";

import { useEffect, useState, useCallback } from 'react';

export type PollType = 'wordcloud' | 'multiple-choice' | 'open-ended';

export interface PollState {
    id: string;
    question: string;
    type: PollType;
    isActive: boolean;
    options?: string[]; // For multiple choice
    votes: Record<string, number>; // text -> count
    feedbacks?: Record<string, number>; // emoji -> count
}

export function usePoll(pollId: string, role: 'host' | 'voter') {
    const [pollState, setPollState] = useState<PollState | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPoll = useCallback(async () => {
        if (!pollId) return;
        try {
            const res = await fetch(`/api/polls/${pollId}`);
            if (!res.ok) {
                if (res.status === 404) setError("Poll not found");
                return;
            }
            const data = await res.json();
            setPollState(data);
            if (!data.isActive && role === 'voter') {
                // keep local state updated that it's closed
            }
        } catch (err) {
            console.error("Poll fetch error", err);
        }
    }, [pollId, role]);

    // Polling effect
    useEffect(() => {
        if (!pollId) return;

        // Initial fetch
        fetchPoll();

        const interval = setInterval(fetchPoll, 2000); // 2 seconds polling
        return () => clearInterval(interval);
    }, [pollId, fetchPoll]);


    const sendVote = useCallback(async (answer: string) => {
        if (!pollId) return;
        try {
            const res = await fetch(`/api/polls/${pollId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'vote', answer })
            });
            if (res.ok) {
                const updated = await res.json();
                setPollState(updated);
            }
        } catch (e) { console.error("Vote failed", e); }
    }, [pollId]);

    const stopPoll = useCallback(async () => {
        if (!pollId) return;
        try {
            const res = await fetch(`/api/polls/${pollId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stop' })
            });
            if (res.ok) {
                const updated = await res.json();
                setPollState(updated);
            }
        } catch (e) { console.error("Stop failed", e); }
    }, [pollId]);

    const sendFeedback = useCallback(async (emoji: string) => {
        if (!pollId) return;
        try {
            const res = await fetch(`/api/polls/${pollId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'feedback', emoji })
            });
            if (res.ok) {
                const updated = await res.json();
                setPollState(updated);
            }
        } catch (e) { console.error("Feedback failed", e); }
    }, [pollId]);

    return { pollState, setPollState, sendVote, stopPoll, sendFeedback, error };
}
