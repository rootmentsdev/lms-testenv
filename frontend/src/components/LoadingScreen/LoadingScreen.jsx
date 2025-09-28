import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const filledSegments = Math.floor((progress / 100) * 10);
  const emptySegments = 10 - filledSegments;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.title}>LOADING.....</div>
        
        <div style={styles.progressBarContainer}>
          <div style={styles.progressBar}>
            {Array.from({ length: filledSegments }, (_, index) => (
              <div key={index} style={styles.filledSegment}></div>
            ))}
            {Array.from({ length: emptySegments }, (_, index) => (
              <div key={index + filledSegments} style={styles.emptySegment}></div>
            ))}
          </div>
        </div>
        
        <div style={styles.subtitle}>Please wait....</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'normal',
    fontFamily: 'Arial, sans-serif',
    color: 'black',
    margin: 0,
  },
  progressBarContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  progressBar: {
    display: 'flex',
    gap: '2px',
    border: '2px solid black',
    padding: '2px',
  },
  filledSegment: {
    width: '30px',
    height: '20px',
    backgroundColor: 'black',
  },
  emptySegment: {
    width: '30px',
    height: '20px',
    backgroundColor: 'white',
    border: '1px solid black',
  },
  subtitle: {
    fontSize: '16px',
    fontWeight: 'normal',
    fontFamily: 'Arial, sans-serif',
    color: 'black',
    margin: 0,
    marginLeft: '20px',
  },
};

export default LoadingScreen;
