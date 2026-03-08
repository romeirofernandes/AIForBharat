import { useEffect } from 'react';

// Singleton flags to prevent duplicate script injection
let isScriptLoaded = false;
let isScriptLoading = false;
let scriptLoadPromise = null;

const GoogleTranslate = () => {
  // Define the callback function that Google Translate will call
  window.googleTranslateElementInit = () => {
    try {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,ta,te,kn,ml,bn,gu,pa,or,as,ur,sa,ne,sd,ks,doi,mai,kok,mni,bh,sat',
            autoDisplay: false,
          },
          'google_translate_element'
        );
        console.log('✅ Google Translate initialized successfully');
      }
    } catch (error) {
      console.error('❌ Google Translate init error:', error);
    }
  };

  useEffect(() => {
    const loadGoogleTranslateScript = () => {
      // Already loading, return existing promise
      if (isScriptLoading && scriptLoadPromise) {
        return scriptLoadPromise;
      }

      // Already loaded, initialize
      if (isScriptLoaded) {
        window.googleTranslateElementInit?.();
        return Promise.resolve();
      }

      isScriptLoading = true;

      scriptLoadPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src =
          'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.defer = true;
        script.id = 'google-translate-script-loader';

        script.onload = () => {
          isScriptLoaded = true;
          isScriptLoading = false;
          console.log('✅ Google Translate script loaded');
          resolve();
        };

        script.onerror = () => {
          isScriptLoading = false;
          console.error('❌ Failed to load Google Translate script');
          resolve();
        };

        document.head.appendChild(script);
      });

      return scriptLoadPromise;
    };

    loadGoogleTranslateScript();
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{ display: 'none' }}
    />
  );
};

export default GoogleTranslate;
