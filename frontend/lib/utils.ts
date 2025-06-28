import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileDevice || isSmallScreen;
}


export function generateUniqueDeviceId() {
	if (typeof window === "undefined") return "unknown-device";
	const deviceId = localStorage.getItem("deviceId");
	if (deviceId) return deviceId;
	const newDeviceId = btoa(
		`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
	);
	localStorage.setItem("deviceId", newDeviceId);
	return newDeviceId;
}

export function getDeviceInfo() {
  if (typeof navigator === "undefined") return {};
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    deviceId: generateUniqueDeviceId(),
  };
}
