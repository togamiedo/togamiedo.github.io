import { createElement, useEffect } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const opening = vi.hoisted(() => ({
  paperDone: undefined as (() => void) | undefined,
  revealDone: undefined as (() => void) | undefined,
  rainUnmounted: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  useRouterState: () => "/",
}));
vi.mock("@/lib/sfx", () => ({
  getMusic: () => null, playCrack: vi.fn(), playSlash: vi.fn(), startMusic: vi.fn(),
}));
vi.mock("@/components/Petals", () => ({ Petals: () => null }));
vi.mock("@/components/CrimsonRain", () => ({
  CrimsonRain: () => {
    useEffect(() => () => opening.rainUnmounted(), []);
    return null;
  },
}));
vi.mock("framer-motion", () => {
  const component = (tag: string) => (props: Record<string, any>) => {
    const { animate, initial, exit, transition, onAnimationComplete, children, ...rest } = props;
    if (rest.style?.clipPath?.startsWith("polygon(0 53%")) opening.paperDone = onAnimationComplete;
    if (rest["aria-label"] === "Break the seal to enter") opening.revealDone = onAnimationComplete;
    return createElement(tag, rest, children);
  };
  return { useReducedMotion: () => false, AnimatePresence: ({ children }: { children: any }) => children,
    motion: { div: component("div"), p: component("p"), i: component("i") } };
});

import { IntroGate } from "@/components/IntroGate";

afterEach(() => { cleanup(); vi.useRealTimers(); opening.rainUnmounted.mockClear(); });

describe("Opening rain lifecycle", () => {
  it("keeps rain until both the paper cut and page reveal finish", () => {
    vi.useFakeTimers();
    render(<IntroGate />);
    fireEvent.click(screen.getByRole("button", { name: "Break the seal to enter" }));
    act(() => vi.advanceTimersByTime(10000));
    expect(opening.rainUnmounted).not.toHaveBeenCalled();
    act(() => opening.paperDone?.());
    expect(opening.rainUnmounted).not.toHaveBeenCalled();
    act(() => opening.revealDone?.());
    expect(opening.rainUnmounted).toHaveBeenCalledTimes(1);
  });
});