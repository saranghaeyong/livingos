import { useEffect, useState, useCallback, useRef } from 'react';
import { playTvSound } from '../utils/sound';

export interface RemoteNavConfig {
  soundEnabled: boolean;
  isModalOpen: boolean;
  isIdle: boolean;
  onWakeFromIdle: () => void;
  onCloseModal: () => void;
  onOpenSettings: () => void;
  onOpenSlideshow: () => void;
}

export function useRemoteNav({
  soundEnabled,
  isModalOpen,
  isIdle,
  onWakeFromIdle,
  onCloseModal,
  onOpenSettings,
  onOpenSlideshow,
}: RemoteNavConfig) {
  // Current active element ID
  const [focusedId, setFocusedId] = useState<string>('app-youtube');
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const resetIdleTimer = useCallback(() => {
    setLastInteractionTime(Date.now());
  }, []);

  const handleFocusChange = useCallback((newId: string) => {
    setFocusedId(newId);
    playTvSound('navigate', soundRef.current);
    resetIdleTimer();
  }, [resetIdleTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. If currently in Idle screen, ANY key exits idle screen
      if (isIdle) {
        e.preventDefault();
        onWakeFromIdle();
        playTvSound('back', soundRef.current);
        return;
      }

      resetIdleTimer();

      // 2. Global hotkeys
      if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 27 || e.keyCode === 8) {
        if (isModalOpen) {
          e.preventDefault();
          onCloseModal();
          playTvSound('back', soundRef.current);
          return;
        }
      }

      // If a modal is open, let modal manage internal tab order or Escape
      if (isModalOpen) {
        return;
      }

      // Quick key shortcuts:
      // 'm' or 'M' opens settings
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onOpenSettings();
        playTvSound('select', soundRef.current);
        return;
      }

      // 's' or 'S' toggles slideshow / idle
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onOpenSlideshow();
        playTvSound('toggle', soundRef.current);
        return;
      }

      // Arrow navigation logic for Dashboard
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (!arrowKeys.includes(e.key) && e.key !== 'Enter' && e.key !== ' ') {
        return;
      }

      // Find all elements marked with data-tv-nav
      const navElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-tv-nav="true"]')
      );

      if (navElements.length === 0) return;

      const currentEl = navElements.find((el) => el.id === focusedId);

      // Handle Enter / OK
      if (e.key === 'Enter' || e.key === ' ') {
        if (currentEl) {
          e.preventDefault();
          playTvSound('select', soundRef.current);
          currentEl.click();
        }
        return;
      }

      e.preventDefault();

      if (!currentEl) {
        // Default to first nav element
        if (navElements[0]) {
          handleFocusChange(navElements[0].id);
        }
        return;
      }

      const currentRect = currentEl.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2,
      };

      // Spatial navigation: find the best candidate in the directional half-plane
      type Candidate = { el: HTMLElement; score: number };
      const candidates: Candidate[] = [];

      navElements.forEach((el) => {
        if (el === currentEl) return;
        const rect = el.getBoundingClientRect();
        // check if visible
        if (rect.width === 0 || rect.height === 0) return;

        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;

        let inDirection = false;
        let primaryDist = 0;
        let secondaryDist = 0;

        if (e.key === 'ArrowRight') {
          inDirection = dx > 15;
          primaryDist = dx;
          secondaryDist = Math.abs(dy);
        } else if (e.key === 'ArrowLeft') {
          inDirection = dx < -15;
          primaryDist = -dx;
          secondaryDist = Math.abs(dy);
        } else if (e.key === 'ArrowDown') {
          inDirection = dy > 15;
          primaryDist = dy;
          secondaryDist = Math.abs(dx);
        } else if (e.key === 'ArrowUp') {
          inDirection = dy < -15;
          primaryDist = -dy;
          secondaryDist = Math.abs(dx);
        }

        if (inDirection) {
          // Weight secondary distance higher to prefer elements directly in line
          const score = primaryDist + secondaryDist * 2.2;
          candidates.push({ el, score });
        }
      });

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.score - b.score);
        const bestCandidate = candidates[0].el;
        handleFocusChange(bestCandidate.id);
        bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isIdle,
    isModalOpen,
    focusedId,
    onWakeFromIdle,
    onCloseModal,
    onOpenSettings,
    onOpenSlideshow,
    resetIdleTimer,
    handleFocusChange,
  ]);

  // Track mouse/touch activity to reset idle timer
  useEffect(() => {
    const handleUserActivity = () => {
      resetIdleTimer();
      if (isIdle) {
        onWakeFromIdle();
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isIdle, onWakeFromIdle, resetIdleTimer]);

  return {
    focusedId,
    setFocusedId: handleFocusChange,
    lastInteractionTime,
    resetIdleTimer,
  };
}
