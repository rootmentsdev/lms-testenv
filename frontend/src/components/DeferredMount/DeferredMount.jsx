import { useState, useEffect } from "react";

const requestIdleCallbackCompat =
  typeof requestIdleCallback !== "undefined"
    ? requestIdleCallback
    : (cb) => setTimeout(cb, 1);
const cancelIdleCallbackCompat =
  typeof cancelIdleCallback !== "undefined"
    ? cancelIdleCallback
    : clearTimeout;

/**
 * Mounts children after the browser is idle to reduce main-thread load on initial paint.
 * Used for non-critical widgets (e.g. Notification, LMSWebsiteLoginStats).
 */
const DeferredMount = ({ children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestIdleCallbackCompat(() => setShow(true));
    return () => cancelIdleCallbackCompat(id);
  }, []);

  if (!show) return null;
  return children;
};

export default DeferredMount;
